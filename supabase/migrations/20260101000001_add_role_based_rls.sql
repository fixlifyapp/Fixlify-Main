-- Role-Based RLS Policies
-- This migration adds role-based access control at the database level
-- Roles: admin, manager, dispatcher, technician

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Drop existing functions first (to handle parameter type changes)
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_user_organization_id();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_manager_or_above();
DROP FUNCTION IF EXISTS public.is_dispatcher_or_above();
DROP FUNCTION IF EXISTS public.is_assigned_to_job(TEXT);
DROP FUNCTION IF EXISTS public.is_assigned_to_job(UUID);

-- Get current user's role from profiles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- Check if user is manager or above
CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
$$;

-- Check if user is dispatcher or above
CREATE OR REPLACE FUNCTION public.is_dispatcher_or_above()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'dispatcher')
  )
$$;

-- Check if technician is assigned to a job
-- Note: jobs table has technician_id field directly (not a junction table)
-- jobs.id is TEXT, jobs.technician_id is UUID
CREATE OR REPLACE FUNCTION public.is_assigned_to_job(p_job_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = p_job_id
    AND j.technician_id = auth.uid()
  )
$$;

-- ============================================
-- JOBS TABLE POLICIES
-- ============================================

-- Drop existing job policies
DROP POLICY IF EXISTS "Users can view own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can view assigned jobs" ON public.jobs;
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
    (public.is_dispatcher_or_above() AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR
    -- Technician can only see assigned jobs
    (public.get_user_role() = 'technician' AND public.is_assigned_to_job(id))
    OR
    -- User's own jobs
    user_id = auth.uid()
  );

-- Admins, Managers, Dispatchers can create jobs
CREATE POLICY "jobs_insert_elevated_roles"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_dispatcher_or_above()
  );

-- Admins/Managers can update any job, Dispatchers/Technicians only assigned
CREATE POLICY "jobs_update_by_role"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager_or_above()
    OR (public.get_user_role() = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR (public.get_user_role() = 'technician' AND public.is_assigned_to_job(id))
  )
  WITH CHECK (
    public.is_manager_or_above()
    OR (public.get_user_role() = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR (public.get_user_role() = 'technician' AND public.is_assigned_to_job(id))
  );

-- Only Admins and Managers can delete jobs
CREATE POLICY "jobs_delete_managers_only"
  ON public.jobs
  FOR DELETE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- ============================================
-- CLIENTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
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
    (public.is_dispatcher_or_above() AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR
    -- Technician can only see clients from assigned jobs
    (public.get_user_role() = 'technician' AND
     id IN (SELECT client_id FROM public.jobs WHERE public.is_assigned_to_job(jobs.id)))
    OR
    -- User's own clients
    user_id = auth.uid()
  );

-- Dispatcher and above can create clients
CREATE POLICY "clients_insert_elevated_roles"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_dispatcher_or_above()
  );

-- Update: Manager+ can edit all, Dispatcher can edit org clients, Tech limited
CREATE POLICY "clients_update_by_role"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager_or_above()
    OR (public.get_user_role() = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR (public.get_user_role() = 'technician' AND
        id IN (SELECT client_id FROM public.jobs WHERE public.is_assigned_to_job(jobs.id)))
  )
  WITH CHECK (
    public.is_manager_or_above()
    OR (public.get_user_role() = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR (public.get_user_role() = 'technician' AND
        id IN (SELECT client_id FROM public.jobs WHERE public.is_assigned_to_job(jobs.id)))
  );

-- Only Managers can delete clients
CREATE POLICY "clients_delete_managers_only"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- ============================================
-- ESTIMATES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete own estimates" ON public.estimates;
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
    (public.is_dispatcher_or_above() AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR
    -- Technician sees estimates from assigned jobs
    (public.get_user_role() = 'technician' AND
     job_id IN (SELECT id FROM public.jobs WHERE public.is_assigned_to_job(jobs.id)))
    OR
    user_id = auth.uid()
  );

-- Dispatcher and above can create estimates
CREATE POLICY "estimates_insert_elevated_roles"
  ON public.estimates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_dispatcher_or_above()
    OR public.get_user_role() = 'technician' -- Technicians can create estimates
  );

-- Update estimates
CREATE POLICY "estimates_update_by_role"
  ON public.estimates
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager_or_above()
    OR (public.get_user_role() = 'dispatcher' AND
        user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
  );

-- Only Managers can delete estimates
CREATE POLICY "estimates_delete_managers_only"
  ON public.estimates
  FOR DELETE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- ============================================
-- INVOICES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
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
    (public.is_dispatcher_or_above() AND
     user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
    OR
    -- Technician sees invoices from assigned jobs
    (public.get_user_role() = 'technician' AND
     job_id IN (SELECT id FROM public.jobs WHERE public.is_assigned_to_job(jobs.id)))
    OR
    user_id = auth.uid()
  );

-- Dispatcher and above can create invoices
CREATE POLICY "invoices_insert_elevated_roles"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_dispatcher_or_above()
  );

-- Only Manager can update invoices (financial data)
CREATE POLICY "invoices_update_managers_only"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- Only Managers can delete invoices
CREATE POLICY "invoices_delete_managers_only"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can create own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
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
    user_id IN (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id())
    OR user_id = auth.uid()
  );

-- Only Manager can create products
CREATE POLICY "products_insert_managers_only"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_manager_or_above()
  );

-- Only Manager can update products
CREATE POLICY "products_update_managers_only"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- Only Manager can delete products
CREATE POLICY "products_delete_managers_only"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    public.is_manager_or_above()
  );

-- ============================================
-- JOB_TECHNICIANS TABLE POLICIES (Assignments)
-- ============================================
-- NOTE: job_technicians junction table does not exist in this schema.
-- Jobs use technician_id field directly on the jobs table.
-- These policies are commented out but kept for future reference if
-- a junction table is added later for multi-technician assignments.

-- DROP POLICY IF EXISTS "Users can view job_technicians" ON public.job_technicians;
-- DROP POLICY IF EXISTS "Users can insert job_technicians" ON public.job_technicians;
-- DROP POLICY IF EXISTS "Users can delete job_technicians" ON public.job_technicians;

-- Everyone in org can view assignments
-- CREATE POLICY "job_technicians_select"
--   ON public.job_technicians
--   FOR SELECT
--   TO authenticated
--   USING (
--     job_id IN (SELECT id FROM public.jobs WHERE user_id IN
--       (SELECT id FROM public.profiles WHERE organization_id = public.get_user_organization_id()))
--     OR technician_id = auth.uid()
--   );

-- Only Dispatcher+ can assign technicians
-- CREATE POLICY "job_technicians_insert_dispatchers"
--   ON public.job_technicians
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     public.is_dispatcher_or_above()
--   );

-- Only Dispatcher+ can remove assignments
-- CREATE POLICY "job_technicians_delete_dispatchers"
--   ON public.job_technicians
--   FOR DELETE
--   TO authenticated
--   USING (
--     public.is_dispatcher_or_above()
--   );

-- ============================================
-- GRANT EXECUTE ON FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_dispatcher_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_to_job(TEXT) TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION public.get_user_organization_id() IS 'Returns the organization_id of the current authenticated user';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is admin';
COMMENT ON FUNCTION public.is_manager_or_above() IS 'Returns true if current user is admin or manager';
COMMENT ON FUNCTION public.is_dispatcher_or_above() IS 'Returns true if current user is admin, manager, or dispatcher';
COMMENT ON FUNCTION public.is_assigned_to_job(TEXT) IS 'Returns true if current user (technician) is assigned to the specified job';
