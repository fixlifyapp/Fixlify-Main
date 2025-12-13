-- CHECK AND FIX RLS POLICIES FOR COMMUNICATION TABLES
-- Run this in Supabase SQL Editor

-- 1. Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('communication_logs', 'estimate_communications', 'invoice_communications', 'mailgun_domains', 'telnyx_phone_numbers')
ORDER BY tablename;

-- 2. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('communication_logs', 'estimate_communications', 'invoice_communications')
ORDER BY tablename, policyname;

-- 3. Fix RLS policies for communication tables
-- First, ensure RLS is enabled
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_communications ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "communication_logs_insert_policy" ON communication_logs;
DROP POLICY IF EXISTS "communication_logs_select_policy" ON communication_logs;
DROP POLICY IF EXISTS "estimate_communications_insert_policy" ON estimate_communications;
DROP POLICY IF EXISTS "estimate_communications_select_policy" ON estimate_communications;
DROP POLICY IF EXISTS "invoice_communications_insert_policy" ON invoice_communications;
DROP POLICY IF EXISTS "invoice_communications_select_policy" ON invoice_communications;

-- 5. Create permissive policies for edge functions
-- These allow both authenticated users and service role to insert

-- Communication logs policies
CREATE POLICY "Enable insert for authenticated users" 
ON communication_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable select for users based on user_id" 
ON communication_logs FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = user_id 
    OR user_id IS NULL
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id = communication_logs.organization_id
    )
);

-- Estimate communications policies  
CREATE POLICY "Enable insert for authenticated users" 
ON estimate_communications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" 
ON estimate_communications FOR SELECT 
TO authenticated 
USING (true);

-- Invoice communications policies
CREATE POLICY "Enable insert for authenticated users" 
ON invoice_communications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" 
ON invoice_communications FOR SELECT 
TO authenticated 
USING (true);

-- 6. Grant permissions to authenticated and service role
GRANT ALL ON communication_logs TO authenticated;
GRANT ALL ON estimate_communications TO authenticated;
GRANT ALL ON invoice_communications TO authenticated;
GRANT ALL ON communication_logs TO service_role;
GRANT ALL ON estimate_communications TO service_role;
GRANT ALL ON invoice_communications TO service_role;

-- 7. Verify the changes
SELECT 
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('communication_logs', 'estimate_communications', 'invoice_communications')
ORDER BY tablename;
