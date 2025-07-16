
-- Fix RLS policies for jobs table
DROP POLICY IF EXISTS "Users can view their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete jobs" ON public.jobs;

-- Create comprehensive policies for jobs table
CREATE POLICY "Users can view jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for clients table
DROP POLICY IF EXISTS "Users can view their clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;

-- Create comprehensive policies for clients table
CREATE POLICY "Users can view clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled on both tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
