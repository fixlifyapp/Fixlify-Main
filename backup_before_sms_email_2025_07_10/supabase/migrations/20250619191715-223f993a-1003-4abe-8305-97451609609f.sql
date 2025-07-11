
-- Fix additional RLS policies for portal access

-- Fix the clients table access for RPC functions
DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Service role can access all clients" ON public.clients;

-- Create a more permissive policy for clients
CREATE POLICY "Allow RPC functions and authenticated users to access clients"
ON public.clients
FOR SELECT
USING (
  -- Allow authenticated users
  auth.uid() IS NOT NULL
  OR
  -- Allow for portal validation (when called from RPC functions)
  current_setting('role') = 'service_role'
  OR
  -- Always allow read access for portal validation
  true
);

-- Fix estimates access
DROP POLICY IF EXISTS "Users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Authenticated users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Service role can access all estimates" ON public.estimates;

CREATE POLICY "Allow authenticated and RPC access to estimates"
ON public.estimates
FOR SELECT
USING (
  auth.uid() IS NOT NULL OR current_setting('role') = 'service_role' OR true
);

-- Fix invoices access
DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Service role can access all invoices" ON public.invoices;

CREATE POLICY "Allow authenticated and RPC access to invoices"
ON public.invoices
FOR SELECT
USING (
  auth.uid() IS NOT NULL OR current_setting('role') = 'service_role' OR true
);
