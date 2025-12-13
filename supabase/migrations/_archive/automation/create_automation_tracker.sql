-- Create a table to track automation execution attempts and prevent duplicates
CREATE TABLE IF NOT EXISTS automation_execution_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES automation_workflows(id),
  job_id TEXT NOT NULL,
  status_change TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, job_id, status_change, DATE_TRUNC('minute', created_at))
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_automation_tracker_lookup 
ON automation_execution_tracker(workflow_id, job_id, created_at DESC);
