-- SMS/Email Testing Helper Script
-- Run this in Supabase SQL Editor after logging into your app

-- 1. Check if you have a user session
SELECT auth.uid() as your_user_id;

-- 2. Add a test phone number (replace with your actual Telnyx number)
INSERT INTO phone_numbers (user_id, phone_number, is_primary, is_active)
VALUES (
  auth.uid(),
  '+1234567890',  -- CHANGE THIS to your Telnyx phone number
  true,
  true
)
ON CONFLICT (phone_number) 
DO UPDATE SET 
  user_id = auth.uid(),
  is_primary = true,
  is_active = true;

-- 3. Verify your phone number is added
SELECT * FROM phone_numbers WHERE user_id = auth.uid();

-- 4. Check available message templates
SELECT name, type, category, content 
FROM message_templates 
WHERE is_default = true OR user_id = auth.uid();

-- 5. After sending test SMS, check logs
SELECT 
  created_at,
  status,
  to_address,
  content,
  error_message
FROM communication_logs 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
