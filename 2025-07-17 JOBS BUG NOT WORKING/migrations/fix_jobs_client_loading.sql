-- Migration to fix jobs organization_id and RLS policies
-- This ensures jobs can be properly filtered by client and permissions

-- First, add organization_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' 
                   AND column_name = 'organization_id') THEN
        ALTER TABLE jobs ADD COLUMN organization_id UUID;
    END IF;
END
$$;

-- Create index on organization_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);

-- Update all jobs to have organization_id from their client
UPDATE jobs j
SET organization_id = c.organization_id
FROM clients c
WHERE j.client_id = c.id
AND (j.organization_id IS NULL OR j.organization_id != c.organization_id);

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Users can create jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Users can delete jobs in their organization" ON jobs;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view jobs in their organization"
ON jobs FOR SELECT
TO authenticated
USING (
  -- User is part of the organization
  EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.organization_id = jobs.organization_id
    AND ou.user_id = auth.uid()
  )
  -- OR user is the assigned technician
  OR technician_id = auth.uid()
  -- OR job belongs to a client they can access
  OR EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = jobs.client_id
    AND EXISTS (
      SELECT 1 FROM organization_users ou
      WHERE ou.organization_id = c.organization_id
      AND ou.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create jobs in their organization"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (
  -- Must have organization_id
  organization_id IS NOT NULL
  -- User must be part of the organization
  AND EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.organization_id = jobs.organization_id
    AND ou.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update jobs in their organization"
ON jobs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.organization_id = jobs.organization_id
    AND ou.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.organization_id = jobs.organization_id
    AND ou.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete jobs in their organization"
ON jobs FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.organization_id = jobs.organization_id
    AND ou.user_id = auth.uid()
  )
);

-- Create function to debug job access
CREATE OR REPLACE FUNCTION debug_job_access(p_client_id uuid DEFAULT NULL)
RETURNS TABLE (
  check_name text,
  result text,
  details jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_job_count int;
  v_client_org_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Get user's organization
  SELECT organization_id INTO v_org_id
  FROM organization_users
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Check 1: User authentication
  RETURN QUERY
  SELECT 
    'User Authentication'::text,
    CASE WHEN v_user_id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END::text,
    jsonb_build_object('user_id', v_user_id)::jsonb;
  
  -- Check 2: Organization membership
  RETURN QUERY
  SELECT 
    'Organization Membership'::text,
    CASE WHEN v_org_id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END::text,
    jsonb_build_object('organization_id', v_org_id)::jsonb;
  
  -- Check 3: Client access (if client_id provided)
  IF p_client_id IS NOT NULL THEN
    SELECT organization_id INTO v_client_org_id
    FROM clients
    WHERE id = p_client_id;
    
    RETURN QUERY
    SELECT 
      'Client Access'::text,      CASE 
        WHEN v_client_org_id = v_org_id THEN 'PASS' 
        WHEN v_client_org_id IS NULL THEN 'CLIENT_NOT_FOUND'
        ELSE 'FAIL' 
      END::text,
      jsonb_build_object(
        'client_id', p_client_id,
        'client_org_id', v_client_org_id,
        'user_org_id', v_org_id
      )::jsonb;
  END IF;
  
  -- Check 4: Jobs count
  IF p_client_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_job_count
    FROM jobs
    WHERE client_id = p_client_id;
  ELSE
    SELECT COUNT(*) INTO v_job_count
    FROM jobs
    WHERE organization_id = v_org_id;
  END IF;
  
  RETURN QUERY
  SELECT 
    'Jobs Count'::text,
    v_job_count::text,
    jsonb_build_object(
      'total_jobs', v_job_count,
      'filter', CASE WHEN p_client_id IS NOT NULL THEN 'by_client' ELSE 'by_organization' END
    )::jsonb;  
  -- Check 5: Sample jobs
  RETURN QUERY
  SELECT 
    'Sample Jobs'::text,
    'INFO'::text,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', j.id,
            'title', j.title,
            'client_id', j.client_id,
            'organization_id', j.organization_id,
            'status', j.status
          )
        )
        FROM (
          SELECT * FROM jobs
          WHERE (p_client_id IS NULL OR client_id = p_client_id)
          AND (organization_id = v_org_id OR technician_id = v_user_id)
          LIMIT 5
        ) j
      ),
      '[]'::jsonb
    )::jsonb;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_job_access TO authenticated;