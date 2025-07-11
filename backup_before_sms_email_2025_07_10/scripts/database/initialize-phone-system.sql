-- Initialize phone number system for Fixlify
-- This will create test phone numbers that can be used by any user

-- First, check if any phone numbers exist
SELECT COUNT(*) as phone_count FROM telnyx_phone_numbers;

-- Create a test phone number that's not assigned to any user
-- This number will be automatically assigned when a user tries to send SMS
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities,
  metadata
) VALUES (
  '+15551234567',  -- Test phone number
  NULL,            -- Not assigned to any user yet
  'active',
  '{"sms": true, "voice": true}'::jsonb,
  '{"type": "system_default", "created": "2025-07-07", "purpose": "auto_assign"}'::jsonb
) ON CONFLICT (phone_number) DO UPDATE
SET 
  status = 'active',
  capabilities = '{"sms": true, "voice": true}'::jsonb,
  updated_at = NOW();

-- Create another test number as backup
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities,
  metadata
) VALUES (
  '+15557654321',  -- Another test phone number
  NULL,            -- Not assigned to any user yet
  'active',
  '{"sms": true, "voice": true}'::jsonb,
  '{"type": "system_default", "created": "2025-07-07", "purpose": "auto_assign"}'::jsonb
) ON CONFLICT (phone_number) DO NOTHING;

-- Verify the phone numbers were created
SELECT * FROM telnyx_phone_numbers WHERE user_id IS NULL AND status = 'active';

-- Show all phone numbers in the system
SELECT 
  phone_number,
  user_id,
  status,
  created_at
FROM telnyx_phone_numbers
ORDER BY created_at DESC;