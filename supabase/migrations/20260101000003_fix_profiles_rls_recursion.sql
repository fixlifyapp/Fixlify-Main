-- Fix Profiles RLS Infinite Recursion
-- Problem: The current profiles RLS policy queries the profiles table
-- to check organization_id, which causes infinite recursion.
-- Solution: Use the SECURITY DEFINER function private.get_user_organization_id()
-- which bypasses RLS and prevents recursion.

-- ============================================
-- DROP EXISTING PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view profiles in same organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- ============================================
-- RECREATE POLICIES USING PRIVATE FUNCTIONS
-- ============================================

-- Policy to allow viewing profiles in same organization
-- Uses private.get_user_organization_id() which is SECURITY DEFINER
-- and bypasses RLS to prevent infinite recursion
CREATE POLICY "Users can view profiles in same organization"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- User can always view their own profile
    id = (select auth.uid())
    OR
    -- User can view profiles in the same organization
    organization_id = (select private.get_user_organization_id())
  );

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Policy to allow inserting own profile (for new user signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================
-- VERIFICATION
-- ============================================
-- After applying this migration, run:
-- SELECT * FROM profiles LIMIT 5;
--
-- If it works without 500 error, the fix is successful.
