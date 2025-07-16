
-- Fix 1: Add missing permissions column to portal_sessions
ALTER TABLE public.portal_sessions 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"view_estimates": true, "view_invoices": true, "make_payments": false}';

-- Fix 2: Update RLS policies for client_portal_access (drop existing ones first)
DROP POLICY IF EXISTS "Allow public to validate portal access" ON public.client_portal_access;
DROP POLICY IF EXISTS "Allow authenticated users to create portal access" ON public.client_portal_access;
DROP POLICY IF EXISTS "Allow authenticated users to update portal access" ON public.client_portal_access;
DROP POLICY IF EXISTS "Allow authenticated users to delete portal access" ON public.client_portal_access;
DROP POLICY IF EXISTS "Allow authenticated users to manage portal access" ON public.client_portal_access;

-- Create the correct policies
CREATE POLICY "Allow public to validate portal access"
ON public.client_portal_access
FOR SELECT
USING (true);

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
