-- Quick diagnostic query to check your database structure
-- Run this in Supabase SQL editor to see what's happening

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('automation_workflows', 'automation_templates', 'automation_history', 'profiles')
ORDER BY table_name;

-- 2. Check current user
SELECT auth.uid() as current_user_id;

-- 3. Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if current user has a profile
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 5. Check if automation tables exist and have data
SELECT 
  (SELECT COUNT(*) FROM automation_templates) as template_count,
  (SELECT COUNT(*) FROM automation_workflows WHERE organization_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())) as workflow_count;

-- 6. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('automation_workflows', 'automation_templates', 'automation_history')
ORDER BY tablename, policyname;