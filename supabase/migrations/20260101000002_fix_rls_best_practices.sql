-- Fix RLS Policies - Supabase Best Practices
-- This migration fixes several issues in the original RLS implementation:
-- 1. Moves SECURITY DEFINER functions from public to private schema
-- 2. Adds (select ...) wrappers for performance optimization
-- 3. Adds missing WITH CHECK clauses for UPDATE policies
-- 4. Creates performance indexes for RLS columns

-- ============================================
-- PHASE 1: CREATE PRIVATE SCHEMA
-- ============================================

CREATE SCHEMA IF NOT EXISTS private;

-- Grant usage to authenticated users (they can execute, not modify)
GRANT USAGE ON SCHEMA private TO authenticated;

-- ============================================
-- PHASE 2: CREATE FUNCTIONS IN PRIVATE SCHEMA
-- ============================================

-- Get current user's role from profiles table
CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid())
$$;

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION private.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
$$;

-- Check if user is manager or above
CREATE OR REPLACE FUNCTION private.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (select auth.uid()) AND role IN ('admin', 'manager')
  )
$$;

-- Check if user is dispatcher or above
CREATE OR REPLACE FUNCTION private.is_dispatcher_or_above()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (select auth.uid()) AND role IN ('admin', 'manager', 'dispatcher')
  )
$$;

-- Check if technician is assigned to a job
CREATE OR REPLACE FUNCTION private.is_assigned_to_job(p_job_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = p_job_id
    AND j.technician_id = (select auth.uid())
  )
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_manager_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_dispatcher_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_assigned_to_job(TEXT) TO authenticated;

-- ============================================
-- PHASE 3: ADD PERFORMANCE INDEXES
-- ============================================

-- Indexes for profiles table (used in almost all RLS policies)
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Composite index for common organization + id lookup
CREATE INDEX IF NOT EXISTS idx_profiles_org_id_combo ON public.profiles(organization_id, id);

-- Indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_technician_id ON public.jobs(technician_id) WHERE technician_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id_user ON public.jobs(client_id, user_id);

-- Indexes for clients table
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Indexes for estimates table
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_job_id ON public.estimates(job_id);

-- Indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- ============================================
-- PHASE 4: RECREATE JOBS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "jobs_select_all_roles" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_elevated_roles" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_by_role" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_managers_only" ON public.jobs;

-- Admins, Managers, Dispatchers can view ALL jobs in organization
CREATE POLICY "jobs_select_all_roles"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager/Dispatcher can see all jobs in their organization
    ((select private.is_dispatcher_or_above()) AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR
    -- Technician can only see assigned jobs
    ((select private.get_user_role()) = 'technician' AND (select private.is_assigned_to_job(id)))
    OR
    -- User's own jobs
    user_id = (select auth.uid())
  );

-- Admins, Managers, Dispatchers can create jobs
CREATE POLICY "jobs_insert_elevated_roles"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select private.is_dispatcher_or_above())
  );

-- Admins/Managers can update any job, Dispatchers/Technicians only assigned
CREATE POLICY "jobs_update_by_role"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
    OR ((select private.get_user_role()) = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR ((select private.get_user_role()) = 'technician' AND (select private.is_assigned_to_job(id)))
  )
  WITH CHECK (
    (select private.is_manager_or_above())
    OR ((select private.get_user_role()) = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR ((select private.get_user_role()) = 'technician' AND (select private.is_assigned_to_job(id)))
  );

-- Only Admins and Managers can delete jobs
CREATE POLICY "jobs_delete_managers_only"
  ON public.jobs
  FOR DELETE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  );

-- ============================================
-- PHASE 5: RECREATE CLIENTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "clients_select_by_role" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_elevated_roles" ON public.clients;
DROP POLICY IF EXISTS "clients_update_by_role" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_managers_only" ON public.clients;

-- Everyone can view clients in their org, technicians only see clients from assigned jobs
CREATE POLICY "clients_select_by_role"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    -- Dispatcher and above can see all clients in org
    ((select private.is_dispatcher_or_above()) AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR
    -- Technician can only see clients from assigned jobs
    ((select private.get_user_role()) = 'technician' AND
     id IN (SELECT client_id FROM public.jobs WHERE (select private.is_assigned_to_job(jobs.id))))
    OR
    -- User's own clients
    user_id = (select auth.uid())
  );

-- Dispatcher and above can create clients
CREATE POLICY "clients_insert_elevated_roles"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select private.is_dispatcher_or_above())
  );

-- Update: Manager+ can edit all, Dispatcher can edit org clients, Tech limited
CREATE POLICY "clients_update_by_role"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
    OR ((select private.get_user_role()) = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR ((select private.get_user_role()) = 'technician' AND
        id IN (SELECT client_id FROM public.jobs WHERE (select private.is_assigned_to_job(jobs.id))))
  )
  WITH CHECK (
    (select private.is_manager_or_above())
    OR ((select private.get_user_role()) = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR ((select private.get_user_role()) = 'technician' AND
        id IN (SELECT client_id FROM public.jobs WHERE (select private.is_assigned_to_job(jobs.id))))
  );

-- Only Managers can delete clients
CREATE POLICY "clients_delete_managers_only"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  );

-- ============================================
-- PHASE 6: RECREATE ESTIMATES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "estimates_select_by_role" ON public.estimates;
DROP POLICY IF EXISTS "estimates_insert_elevated_roles" ON public.estimates;
DROP POLICY IF EXISTS "estimates_update_by_role" ON public.estimates;
DROP POLICY IF EXISTS "estimates_delete_managers_only" ON public.estimates;

-- View estimates by role
CREATE POLICY "estimates_select_by_role"
  ON public.estimates
  FOR SELECT
  TO authenticated
  USING (
    -- Dispatcher+ can see all in org
    ((select private.is_dispatcher_or_above()) AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR
    -- Technician sees estimates from assigned jobs
    ((select private.get_user_role()) = 'technician' AND
     job_id IN (SELECT id FROM public.jobs WHERE (select private.is_assigned_to_job(jobs.id))))
    OR
    user_id = (select auth.uid())
  );

-- Dispatcher and above can create estimates (technicians too)
CREATE POLICY "estimates_insert_elevated_roles"
  ON public.estimates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select private.is_dispatcher_or_above())
    OR (select private.get_user_role()) = 'technician'
  );

-- Update estimates - FIXED: Added WITH CHECK
CREATE POLICY "estimates_update_by_role"
  ON public.estimates
  FOR UPDATE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
    OR ((select private.get_user_role()) = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
  )
  WITH CHECK (
    (select private.is_manager_or_above())
    OR ((select private.get_user_role()) = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
  );

-- Only Managers can delete estimates
CREATE POLICY "estimates_delete_managers_only"
  ON public.estimates
  FOR DELETE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  );

-- ============================================
-- PHASE 7: RECREATE INVOICES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "invoices_select_by_role" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_elevated_roles" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_managers_only" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_managers_only" ON public.invoices;

-- View invoices by role
CREATE POLICY "invoices_select_by_role"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    -- Dispatcher+ can see all in org
    ((select private.is_dispatcher_or_above()) AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id())))
    OR
    -- Technician sees invoices from assigned jobs
    ((select private.get_user_role()) = 'technician' AND
     job_id IN (SELECT id FROM public.jobs WHERE (select private.is_assigned_to_job(jobs.id))))
    OR
    user_id = (select auth.uid())
  );

-- Dispatcher and above can create invoices
CREATE POLICY "invoices_insert_elevated_roles"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select private.is_dispatcher_or_above())
  );

-- Only Manager can update invoices - FIXED: Added WITH CHECK
CREATE POLICY "invoices_update_managers_only"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  )
  WITH CHECK (
    (select private.is_manager_or_above())
  );

-- Only Managers can delete invoices
CREATE POLICY "invoices_delete_managers_only"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  );

-- ============================================
-- PHASE 8: RECREATE PRODUCTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "products_select_org" ON public.products;
DROP POLICY IF EXISTS "products_insert_managers_only" ON public.products;
DROP POLICY IF EXISTS "products_update_managers_only" ON public.products;
DROP POLICY IF EXISTS "products_delete_managers_only" ON public.products;

-- Everyone in org can view products
CREATE POLICY "products_select_org"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM public.profiles WHERE organization_id = (select private.get_user_organization_id()))
    OR user_id = (select auth.uid())
  );

-- Only Manager can create products
CREATE POLICY "products_insert_managers_only"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select private.is_manager_or_above())
  );

-- Only Manager can update products - FIXED: Added WITH CHECK
CREATE POLICY "products_update_managers_only"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  )
  WITH CHECK (
    (select private.is_manager_or_above())
  );

-- Only Manager can delete products
CREATE POLICY "products_delete_managers_only"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    (select private.is_manager_or_above())
  );

-- ============================================
-- PHASE 9: DROP OLD PUBLIC FUNCTIONS
-- ============================================

-- Drop old public functions (they're now in private schema)
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_user_organization_id();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_manager_or_above();
DROP FUNCTION IF EXISTS public.is_dispatcher_or_above();
DROP FUNCTION IF EXISTS public.is_assigned_to_job(TEXT);
DROP FUNCTION IF EXISTS public.is_assigned_to_job(UUID);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON SCHEMA private IS 'Schema for security-sensitive functions. Functions here are SECURITY DEFINER and should not be directly modifiable by users.';

COMMENT ON FUNCTION private.get_user_role() IS 'Returns the role of the current authenticated user (admin, manager, dispatcher, technician)';
COMMENT ON FUNCTION private.get_user_organization_id() IS 'Returns the organization_id of the current authenticated user';
COMMENT ON FUNCTION private.is_admin() IS 'Returns true if current user is admin';
COMMENT ON FUNCTION private.is_manager_or_above() IS 'Returns true if current user is admin or manager';
COMMENT ON FUNCTION private.is_dispatcher_or_above() IS 'Returns true if current user is admin, manager, or dispatcher';
COMMENT ON FUNCTION private.is_assigned_to_job(TEXT) IS 'Returns true if current user (technician) is assigned to the specified job';

-- ============================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================
--
-- Check functions are in private schema:
-- SELECT routine_name, routine_schema
-- FROM information_schema.routines
-- WHERE routine_name IN ('get_user_role', 'get_user_organization_id', 'is_admin', 'is_manager_or_above', 'is_dispatcher_or_above', 'is_assigned_to_job')
-- AND routine_schema IN ('public', 'private');
--
-- Verify indexes exist:
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE indexname LIKE 'idx_%' AND schemaname = 'public'
-- ORDER BY tablename;
--
-- Test RLS performance with EXPLAIN ANALYZE:
-- EXPLAIN ANALYZE SELECT * FROM jobs LIMIT 10;
--
