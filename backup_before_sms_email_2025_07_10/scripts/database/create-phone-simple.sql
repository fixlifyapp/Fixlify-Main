-- Create a test phone number for SMS functionality
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities
) VALUES (
  '+15551234567',
  NULL,
  'active',
  '{"sms": true, "voice": true}'::jsonb
) ON CONFLICT (phone_number) DO UPDATE
SET 
  status = 'active',
  updated_at = NOW();