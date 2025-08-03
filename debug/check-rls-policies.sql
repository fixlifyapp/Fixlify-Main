-- SQL script to check RLS policies on clients table
-- Run this in Supabase SQL editor

-- Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'clients';

-- List all policies on clients table
SELECT 
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polroles::regrole[] as roles,
  pol.polqual as using_expression,
  pol.polwithcheck as with_check_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'clients';

-- Check current user permissions
SELECT has_table_privilege(current_user, 'public.clients', 'INSERT');
SELECT has_table_privilege(current_user, 'public.clients', 'SELECT');
SELECT has_table_privilege(current_user, 'public.clients', 'UPDATE');
SELECT has_table_privilege(current_user, 'public.clients', 'DELETE');
