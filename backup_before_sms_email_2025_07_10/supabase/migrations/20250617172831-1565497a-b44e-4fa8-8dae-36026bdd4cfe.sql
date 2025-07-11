
-- Fix RLS policies for client portal access
-- Allow service role to access all data for client portal functionality

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete estimates" ON public.estimates;

DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;

DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;

-- Create new policies that allow service role access for client portal

-- Service role policies for estimates
CREATE POLICY "Service role can access all estimates"
ON public.estimates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Service role policies for invoices
CREATE POLICY "Service role can access all invoices"
ON public.invoices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Service role policies for clients
CREATE POLICY "Service role can access all clients"
ON public.clients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated user policies (for regular app usage)
CREATE POLICY "Authenticated users can view estimates"
ON public.estimates
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage estimates"
ON public.estimates
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clients"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage clients"
ON public.clients
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
