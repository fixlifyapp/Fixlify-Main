-- Migration: Enable multi-tenant phone number system with $0 pricing
-- Date: 2025-08-11

-- Update default pricing to $0 for all phone numbers (temporary for testing)
ALTER TABLE phone_numbers 
ALTER COLUMN price SET DEFAULT 0.00,
ALTER COLUMN monthly_price SET DEFAULT 0.00,
ALTER COLUMN retail_price SET DEFAULT 0.00,
ALTER COLUMN retail_monthly_price SET DEFAULT 0.00;

-- Update existing phone numbers to $0 pricing
UPDATE phone_numbers 
SET 
  price = 0.00,
  monthly_price = 0.00,
  retail_price = 0.00,
  retail_monthly_price = 0.00
WHERE price > 0 OR monthly_price > 0;

-- Ensure RLS is enabled
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can purchase available phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can update their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can view available phone numbers" ON phone_numbers;

-- Create RLS policies for phone_numbers
CREATE POLICY "Users can view available phone numbers"
  ON phone_numbers FOR SELECT
  USING (status = 'available' OR user_id = auth.uid() OR purchased_by = auth.uid());

CREATE POLICY "Users can purchase available phone numbers"
  ON phone_numbers FOR UPDATE
  USING (status = 'available')
  WITH CHECK (purchased_by = auth.uid());

CREATE POLICY "Users can update their own phone numbers"
  ON phone_numbers FOR UPDATE
  USING (user_id = auth.uid() OR purchased_by = auth.uid());

CREATE POLICY "Users can insert phone numbers"
  ON phone_numbers FOR INSERT
  WITH CHECK (user_id = auth.uid() OR purchased_by = auth.uid());

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_purchased_by ON phone_numbers(purchased_by);

-- Create function to get user's primary phone number
CREATE OR REPLACE FUNCTION get_user_primary_phone(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_phone_number TEXT;
BEGIN
  -- First try to get primary phone
  SELECT phone_number INTO v_phone_number
  FROM phone_numbers
  WHERE user_id = p_user_id
    AND status = 'purchased'
    AND is_primary = true
  LIMIT 1;
  
  -- If no primary, get any purchased phone
  IF v_phone_number IS NULL THEN
    SELECT phone_number INTO v_phone_number
    FROM phone_numbers
    WHERE user_id = p_user_id
      AND status = 'purchased'
    ORDER BY purchased_at DESC
    LIMIT 1;
  END IF;
  
  RETURN v_phone_number;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_primary_phone(UUID) TO authenticated;

-- Add some test phone numbers as available (if needed)
INSERT INTO phone_numbers (phone_number, friendly_name, status, country_code, capabilities, phone_number_type, price, monthly_price)
VALUES 
  ('+12025551234', 'Washington DC', 'available', 'US', '{"sms": true, "voice": true, "mms": false}'::jsonb, 'local', 0.00, 0.00),
  ('+13105552345', 'Los Angeles', 'available', 'US', '{"sms": true, "voice": true, "mms": false}'::jsonb, 'local', 0.00, 0.00),
  ('+14155553456', 'San Francisco', 'available', 'US', '{"sms": true, "voice": true, "mms": false}'::jsonb, 'local', 0.00, 0.00),
  ('+17185554567', 'New York', 'available', 'US', '{"sms": true, "voice": true, "mms": false}'::jsonb, 'local', 0.00, 0.00),
  ('+13125555678', 'Chicago', 'available', 'US', '{"sms": true, "voice": true, "mms": false}'::jsonb, 'local', 0.00, 0.00)
ON CONFLICT (phone_number) DO NOTHING;
