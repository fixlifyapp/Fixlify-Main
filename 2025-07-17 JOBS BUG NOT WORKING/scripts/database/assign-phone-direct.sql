-- Direct phone number assignment for petrusenkocorp@gmail.com
-- This script will be run via Supabase SQL Editor

-- First, get the user ID for petrusenkocorp@gmail.com
WITH user_info AS (
  SELECT id, email 
  FROM auth.users 
  WHERE email = 'petrusenkocorp@gmail.com'
  LIMIT 1
)
-- Check if user already has a phone number
SELECT 
  u.id as user_id,
  u.email,
  t.phone_number,
  t.status,
  t.id as phone_id
FROM user_info u
LEFT JOIN telnyx_phone_numbers t ON t.user_id = u.id;

-- If no phone number exists, this will insert one
-- The phone number +15559876543 is a test number
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities,
  metadata
) 
SELECT 
  '+15559876543' as phone_number,
  id as user_id,
  'active' as status,
  '{"sms": true, "voice": true}'::jsonb as capabilities,
  '{"assigned": "2025-07-07", "type": "test_number"}'::jsonb as metadata
FROM auth.users 
WHERE email = 'petrusenkocorp@gmail.com'
ON CONFLICT (phone_number) DO UPDATE
SET 
  user_id = EXCLUDED.user_id,
  status = 'active',
  updated_at = NOW();

-- Verify the assignment
SELECT * FROM telnyx_phone_numbers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'petrusenkocorp@gmail.com');
