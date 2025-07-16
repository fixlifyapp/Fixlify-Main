-- Script to enable test mode for email/SMS sending
-- This allows the system to work without actual API keys

-- Create a function to check if we're in test mode
CREATE OR REPLACE FUNCTION is_test_mode()
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if MAILGUN_API_KEY or TELNYX_API_KEY are missing
  -- In production, you would check the actual secrets
  RETURN true; -- For now, always return test mode
END;
$$;

-- Update the estimate_communications table to track test sends
ALTER TABLE estimate_communications 
ADD COLUMN IF NOT EXISTS is_test_send boolean DEFAULT false;

ALTER TABLE invoice_communications 
ADD COLUMN IF NOT EXISTS is_test_send boolean DEFAULT false;

-- Create a test phone numbers table for SMS testing
CREATE TABLE IF NOT EXISTS test_phone_numbers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Insert a test phone number
INSERT INTO test_phone_numbers (phone_number, user_id)
SELECT '+1234567890', id FROM auth.users LIMIT 1
ON CONFLICT DO NOTHING;

COMMENT ON TABLE test_phone_numbers IS 'Phone numbers for testing SMS functionality without actual Telnyx integration';
