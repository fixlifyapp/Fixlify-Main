-- Verification script for SMS/Email schema
-- Run this after migration to verify everything is set up correctly

-- Check if tables exist
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
GROUP BY table_name
ORDER BY table_name;

-- Check indexes
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('phone_numbers', 'communication_logs', 'message_templates')
ORDER BY tablename, indexname;

-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings');

-- Check policies
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
ORDER BY tablename, policyname;

-- Check functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_primary_phone', 'log_communication', 'update_updated_at_column');

-- Test insert (will fail if not authenticated, which is expected)
-- This is just to verify the structure
/*
INSERT INTO phone_numbers (user_id, phone_number, telnyx_phone_number_id)
VALUES ('00000000-0000-0000-0000-000000000000', '+1234567890', 'test_id')
ON CONFLICT DO NOTHING;
*/