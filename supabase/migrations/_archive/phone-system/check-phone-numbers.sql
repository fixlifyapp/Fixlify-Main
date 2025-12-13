-- Check phone numbers for petrusenkocorp@gmail.com
-- Run this in Supabase SQL Editor

-- First, find the user ID
SELECT id, email 
FROM profiles 
WHERE email = 'petrusenkocorp@gmail.com';

-- Check existing phone numbers for this user
-- Replace 'USER_ID_HERE' with the actual ID from above query
SELECT * 
FROM telnyx_phone_numbers 
WHERE user_id = 'USER_ID_HERE';

-- If no active phone numbers exist, add one
-- Replace the values below with actual data
/*
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities
) VALUES (
  '+1234567890', -- Replace with your actual Telnyx phone number
  'USER_ID_HERE', -- Replace with the user ID from first query
  'active',
  '{"sms": true, "voice": true}'::jsonb
);
*/

-- Or activate an existing phone number
/*
UPDATE telnyx_phone_numbers
SET status = 'active'
WHERE user_id = 'USER_ID_HERE'
AND phone_number = '+1234567890';
*/