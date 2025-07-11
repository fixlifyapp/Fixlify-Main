-- Create a test phone number for SMS functionality
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status
) VALUES (
  '+15551234567',
  NULL,
  'active'
) ON CONFLICT (phone_number) DO UPDATE
SET 
  status = 'active',
  updated_at = NOW();