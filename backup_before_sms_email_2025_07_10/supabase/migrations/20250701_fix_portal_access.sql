-- Fix Client Portal Access Issues

-- These policies allow public (unauthenticated) access to view estimates, invoices, jobs, and clients
-- This is necessary for the client portal pages to work without authentication

-- Drop existing restrictive policies and create new ones that allow portal access
BEGIN;

-- Estimates policies
DROP POLICY IF EXISTS "Public can view estimates for portal" ON estimates;
CREATE POLICY "Public can view estimates for portal" ON estimates
FOR SELECT TO anon USING (true);

-- Jobs policies  
DROP POLICY IF EXISTS "Public can view jobs for portal" ON jobs;
CREATE POLICY "Public can view jobs for portal" ON jobs
FOR SELECT TO anon USING (true);

-- Clients policies
DROP POLICY IF EXISTS "Public can view clients for portal" ON clients;
CREATE POLICY "Public can view clients for portal" ON clients
FOR SELECT TO anon USING (true);

-- Invoices policies
DROP POLICY IF EXISTS "Public can view invoices for portal" ON invoices;
CREATE POLICY "Public can view invoices for portal" ON invoices
FOR SELECT TO anon USING (true);

COMMIT;

-- Note: These policies are intentionally permissive for portal access
-- In production, you should consider using portal access tokens for more secure access