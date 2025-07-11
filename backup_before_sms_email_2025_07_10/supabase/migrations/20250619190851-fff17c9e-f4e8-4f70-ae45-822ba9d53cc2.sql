
-- Fix RLS policies for client_portal_access table to allow anonymous access for portal validation

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to manage portal access" ON public.client_portal_access;

-- Create policies that allow public read access for validation
CREATE POLICY "Allow public to validate portal access"
ON public.client_portal_access
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to create portal access"
ON public.client_portal_access
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update portal access"
ON public.client_portal_access
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete portal access"
ON public.client_portal_access
FOR DELETE
USING (auth.role() = 'authenticated');
