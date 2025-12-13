-- Create CRON job to process scheduled automations every minute
SELECT cron.schedule(
  'process-scheduled-automations',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/process-scheduled-automations',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg"}'::jsonb,
        body:='{"triggered_by": "cron", "timestamp": "'||now()||'"}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to execute automation for records (enhanced version)
CREATE OR REPLACE FUNCTION execute_automation_for_record(
  p_trigger_type TEXT,
  p_trigger_data JSONB,
  p_organization_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Log the automation execution request to the execution logs table
  INSERT INTO automation_execution_logs (
    workflow_id,
    trigger_type,
    trigger_data,
    status,
    started_at,
    organization_id
  )
  SELECT 
    w.id,
    p_trigger_type,
    p_trigger_data,
    'pending',
    NOW(),
    COALESCE(p_organization_id, w.organization_id)
  FROM automation_workflows w
  WHERE w.trigger_type = p_trigger_type 
    AND w.status = 'active'
    AND (p_organization_id IS NULL OR w.organization_id = p_organization_id);
    
  -- The actual execution will be handled by the edge function
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance on automation queries
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger_status 
ON automation_workflows(trigger_type, status);

CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_status_created 
ON automation_execution_logs(status, created_at);

CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date 
ON invoices(status, due_date) WHERE status = 'sent';

CREATE INDEX IF NOT EXISTS idx_jobs_status_updated 
ON jobs(status, updated_at) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date 
ON tasks(status, due_date) WHERE status NOT IN ('completed', 'cancelled');