-- Multi-tenant phone number system setup
-- This migration ensures each user can purchase and manage their own phone numbers

-- Add organization_id to phone_numbers table if not exists
ALTER TABLE phone_numbers 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add pricing columns with $0 default for now
ALTER TABLE phone_numbers 
ALTER COLUMN price SET DEFAULT 0.00,
ALTER COLUMN monthly_price SET DEFAULT 0.00,
ALTER COLUMN retail_price SET DEFAULT 0.00,
ALTER COLUMN retail_monthly_price SET DEFAULT 0.00;

-- Update existing phone numbers to be available (except the one already purchased)
UPDATE phone_numbers 
SET status = 'available',
    purchased_by = NULL,
    purchased_at = NULL,
    assigned_to = NULL,
    user_id = NULL
WHERE phone_number != '+14375249932';

-- Assign the existing number to petrusenkocorp@gmail.com
UPDATE phone_numbers 
SET status = 'purchased',
    purchased_by = (SELECT id FROM auth.users WHERE email = 'petrusenkocorp@gmail.com' LIMIT 1),
    purchased_at = NOW(),
    user_id = (SELECT id FROM auth.users WHERE email = 'petrusenkocorp@gmail.com' LIMIT 1),
    is_primary = true
WHERE phone_number = '+14375249932';

-- Create function to generate mock phone numbers for testing
CREATE OR REPLACE FUNCTION generate_available_phone_numbers()
RETURNS void AS $$
DECLARE
  i INTEGER;
  area_codes TEXT[] := ARRAY['415', '650', '408', '510', '925', '707', '831', '209', '559', '661'];
  area_code TEXT;
BEGIN
  FOR i IN 1..50 LOOP
    area_code := area_codes[1 + floor(random() * array_length(area_codes, 1))::int];
    
    INSERT INTO phone_numbers (
      phone_number,
      friendly_name,
      country_code,
      region,
      locality,
      capabilities,
      phone_number_type,
      status,
      price,
      monthly_price,
      retail_price,
      retail_monthly_price,
      area_code
    ) VALUES (
      '+1' || area_code || floor(random() * 9000000 + 1000000)::text,
      'Available Number',
      'US',
      'CA',
      'San Francisco',
      '{"sms": true, "voice": true, "mms": false}'::jsonb,
      'local',
      'available',
      0.00,
      0.00,
      0.00,
      0.00,
      area_code
    )
    ON CONFLICT (phone_number) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate some available numbers for testing
SELECT generate_available_phone_numbers();

-- Create or update RLS policies for phone_numbers
DROP POLICY IF EXISTS "Users can view all available phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can view their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can purchase phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can update their own phone numbers" ON phone_numbers;

-- Allow users to see available and their own numbers
CREATE POLICY "Users can view available and own phone numbers" ON phone_numbers
  FOR SELECT
  USING (
    status = 'available' 
    OR user_id = auth.uid() 
    OR purchased_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow users to purchase available numbers
CREATE POLICY "Users can purchase available phone numbers" ON phone_numbers
  FOR UPDATE
  USING (status = 'available')
  WITH CHECK (
    purchased_by = auth.uid() 
    AND user_id = auth.uid()
  );

-- Allow users to update their own numbers
CREATE POLICY "Users can update their own phone numbers" ON phone_numbers
  FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR purchased_by = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR purchased_by = auth.uid()
  );

-- Allow users to insert purchased numbers
CREATE POLICY "Users can insert purchased phone numbers" ON phone_numbers
  FOR INSERT
  WITH CHECK (
    purchased_by = auth.uid() 
    AND user_id = auth.uid()
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_organization_id ON phone_numbers(organization_id);