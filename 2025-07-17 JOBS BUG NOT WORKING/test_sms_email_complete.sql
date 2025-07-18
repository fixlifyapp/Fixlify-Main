-- ========================================
-- SMS/EMAIL TESTING SCRIPT
-- Run this in Supabase SQL Editor
-- ========================================

-- STEP 1: Check if you're logged in
-- ========================================
SELECT auth.uid() as your_user_id;
-- If this returns NULL, you need to log into the app first!


-- STEP 2: Add your Telnyx phone number for SMS
-- ========================================
-- This is your Telnyx number that will SEND SMS messages
INSERT INTO phone_numbers (user_id, phone_number, is_primary, is_active, telnyx_phone_number_id)
VALUES (
  auth.uid(),
  '+14375249932',  -- Your Telnyx phone number (no dashes)
  true,
  true,
  'your-telnyx-phone-id'  -- Optional: Add your Telnyx phone ID if you have it
)
ON CONFLICT (phone_number) 
DO UPDATE SET 
  user_id = auth.uid(),
  is_primary = true,
  is_active = true;

-- Verify phone number was added
SELECT * FROM phone_numbers WHERE user_id = auth.uid();


-- STEP 3: Check if tables exist
-- ========================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
ORDER BY table_name;


-- STEP 4: View available templates
-- ========================================
-- SMS Templates
SELECT name, category, content 
FROM message_templates 
WHERE type = 'sms' AND (is_default = true OR user_id = auth.uid());

-- Email Templates
SELECT name, category, subject, LEFT(content, 100) || '...' as content_preview
FROM message_templates 
WHERE type = 'email' AND (is_default = true OR user_id = auth.uid());


-- STEP 5: After testing, check communication logs
-- ========================================
-- View all your communications
SELECT 
  created_at,
  type,
  direction,
  status,
  from_address,
  to_address,
  LEFT(content, 50) || '...' as content_preview,
  error_message
FROM communication_logs 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 20;

-- Check SMS logs specifically
SELECT 
  created_at,
  status,
  from_address as from_phone,
  to_address as to_phone,
  LEFT(content, 100) as message,
  error_message,
  sent_at,
  delivered_at,
  failed_at
FROM communication_logs 
WHERE user_id = auth.uid() AND type = 'sms'
ORDER BY created_at DESC;

-- Check Email logs specifically
SELECT 
  created_at,
  status,
  to_address as email,
  metadata->>'subject' as subject,
  error_message,
  sent_at,
  delivered_at,
  failed_at
FROM communication_logs 
WHERE user_id = auth.uid() AND type = 'email'
ORDER BY created_at DESC;


-- STEP 6: Debug - Check for errors
-- ========================================
-- Recent failed communications
SELECT 
  created_at,
  type,
  to_address,
  error_message,
  metadata
FROM communication_logs 
WHERE user_id = auth.uid() 
AND status IN ('failed', 'bounced')
ORDER BY created_at DESC;


-- STEP 7: Clean up test data (optional)
-- ========================================
-- Delete test SMS logs
-- DELETE FROM communication_logs 
-- WHERE user_id = auth.uid() 
-- AND type = 'sms' 
-- AND metadata->>'test' = 'true';

-- Delete test Email logs
-- DELETE FROM communication_logs 
-- WHERE user_id = auth.uid() 
-- AND type = 'email' 
-- AND metadata->>'test' = 'true';


-- STEP 8: Check your Telnyx phone number
-- ========================================
SELECT 
  phone_number,
  is_primary,
  is_active,
  capabilities,
  created_at
FROM phone_numbers 
WHERE user_id = auth.uid();
