-- Migration: Add RLS policies for portal token access
-- Description: Allow anonymous users to view estimates/invoices via portal_access_token
-- This fixes the "invalid or expired token" error when clients click email links

-- Drop existing policies if they exist (avoid duplicates)
DROP POLICY IF EXISTS "Portal token access for estimates" ON public.estimates;
DROP POLICY IF EXISTS "Portal token access for invoices" ON public.invoices;

-- Create policy for estimates portal token access
-- Allows SELECT on estimates that have a portal_access_token
CREATE POLICY "Portal token access for estimates"
ON public.estimates
FOR SELECT
TO anon, authenticated
USING (portal_access_token IS NOT NULL);

-- Create policy for invoices portal token access
CREATE POLICY "Portal token access for invoices"
ON public.invoices
FOR SELECT
TO anon, authenticated
USING (portal_access_token IS NOT NULL);
