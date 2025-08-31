-- Step 1: Check existing phone numbers
SELECT COUNT(*) as phone_count FROM telnyx_phone_numbers;

-- Step 2: Create first test phone number
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities,
  metadata
) VALUES (
  '+15551234567',
  NULL,
  'active',
  '{"sms": true, "voice": true}'::jsonb,
  '{"type": "system_default", "created": "2025-07-07", "purpose": "auto_assign"}'::jsonb
) ON CONFLICT (phone_number) DO UPDATE
SET 
  status = 'active',
  capabilities = '{"sms": true, "voice": true}'::jsonb,
  updated_at = NOW();

-- Step 3: Create second test phone number
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities,
  metadata
) VALUES (
  '+15557654321',
  NULL,
  'active',
  '{"sms": true, "voice": true}'::jsonb,
  '{"type": "system_default", "created": "2025-07-07", "purpose": "auto_assign"}'::jsonb
) ON CONFLICT (phone_number) DO NOTHING;

-- Step 4: Verify creation
SELECT * FROM telnyx_phone_numbers WHERE status = 'active';