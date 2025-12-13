-- Migration to fix jobs loading timeout issues
-- Optimizes indexes and queries for better performance

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_client_created 
ON jobs(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_org_created 
ON jobs(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_status_created 
ON jobs(status, created_at DESC);

-- Analyze tables for query optimization
ANALYZE jobs;
ANALYZE clients;

-- Create a faster view for job listing
CREATE OR REPLACE VIEW jobs_list_view AS
SELECT 
  j.id,
  j.title,
  j.client_id,
  j.status,
  j.job_type,
  j.service,
  j.date,
  j.schedule_start,
  j.revenue,
  j.address,
  j.created_at,
  j.organization_id
FROM jobs j
WHERE j.deleted_at IS NULL;

-- Grant permissions on the view
GRANT SELECT ON jobs_list_view TO authenticated;

-- Function to get jobs for a client with timeout protection
CREATE OR REPLACE FUNCTION get_client_jobs(
  p_client_id UUID,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  job_type TEXT,
  service TEXT,
  date DATE,
  schedule_start TIMESTAMP,
  revenue NUMERIC,
  address TEXT,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '10s'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.status,
    j.job_type,
    j.service,
    j.date,
    j.schedule_start,
    j.revenue,
    j.address,
    j.created_at
  FROM jobs j
  WHERE j.client_id = p_client_id
    AND j.deleted_at IS NULL
  ORDER BY j.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_client_jobs TO authenticated;
