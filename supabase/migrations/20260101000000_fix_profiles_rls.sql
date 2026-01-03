-- Fix profiles RLS to allow viewing team members in same organization

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policy to allow viewing profiles in same organization
CREATE POLICY "Users can view profiles in same organization"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy to allow inserting own profile (for new user signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
