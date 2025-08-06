-- Create a better deduplication system
CREATE TABLE IF NOT EXISTS automation_deduplication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  new_status TEXT NOT NULL,
  execution_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_execution_hash UNIQUE (execution_hash)
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_automation_dedup_cleanup 
ON automation_deduplication(created_at);

-- Function to generate execution hash
CREATE OR REPLACE FUNCTION generate_execution_hash(
  p_workflow_id UUID,
  p_job_id TEXT,
  p_new_status TEXT,
  p_time_window INTEGER DEFAULT 60 -- seconds
) RETURNS TEXT AS $$
BEGIN
  RETURN MD5(
    p_workflow_id::TEXT || '-' || 
    p_job_id || '-' || 
    LOWER(p_new_status) || '-' ||
    EXTRACT(EPOCH FROM NOW())::INTEGER / p_time_window
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;