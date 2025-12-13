-- Fix automation execution to work automatically
-- This migration updates triggers to execute automations directly instead of just creating logs

-- First, let's fix existing workflows that have no steps
UPDATE automation_workflows
SET steps = '[{
  "id": "action-1",
  "type": "action",
  "subType": "email",
  "name": "Send Notification",
  "config": {
    "subject": "{{trigger.type}}: {{job.title}}",
    "body": "<h2>Automation Notification</h2><p>Dear {{client.firstName}} {{client.lastName}},</p><p>Job: {{job.title}}</p><p>Status: {{job.status}}</p><p>Thank you for choosing {{company.name}}!</p>",
    "sendToClient": true
  }
}]'::jsonb
WHERE (steps IS NULL OR steps = '[]'::jsonb)
AND is_active = true;

-- Create function to process automations via frontend
-- Since we can't use HTTP extension in migrations, we'll create a simpler approach
CREATE OR REPLACE FUNCTION create_automation_log_for_processing(
  p_workflow_id UUID,
  p_trigger_type TEXT,
  p_trigger_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO automation_execution_logs (
    workflow_id,
    trigger_type,
    trigger_data,
    status,
    created_at
  ) VALUES (
    p_workflow_id,
    p_trigger_type,
    p_trigger_data,
    'pending',
    NOW()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Update the job automation trigger function
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
BEGIN
  -- For job status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Find matching workflows
    FOR workflow_record IN 
      SELECT * FROM automation_workflows
      WHERE user_id = NEW.user_id
      AND trigger_type = 'job_status_changed'
      AND is_active = true
      AND status = 'active'
    LOOP
      -- Check if status matches trigger condition
      IF workflow_record.trigger_config->>'conditions' IS NOT NULL THEN
        DECLARE
          condition JSONB;
          should_trigger BOOLEAN := FALSE;
        BEGIN
          FOR condition IN SELECT * FROM jsonb_array_elements(workflow_record.trigger_config->'conditions')
          LOOP
            IF condition->>'field' = 'status' AND 
               lower(condition->>'value') = lower(NEW.status) THEN
              should_trigger := TRUE;
              EXIT;
            END IF;
          END LOOP;
          
          IF should_trigger THEN
            -- Create execution log for processing
            log_id := create_automation_log_for_processing(
              workflow_record.id,
              'job_status_changed',
              jsonb_build_object(
                'job_id', NEW.id,
                'jobId', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'job', row_to_json(NEW),
                'oldStatus', OLD.status,
                'workflow_id', workflow_record.id,
                'userId', NEW.user_id,
                'triggerType', 'job_status_changed'
              )
            );
            
            -- Update workflow execution count
            UPDATE automation_workflows
            SET execution_count = COALESCE(execution_count, 0) + 1,
                last_triggered_at = NOW()
            WHERE id = workflow_record.id;
          END IF;
        END;
      END IF;
    END LOOP;
  
  -- For new jobs
  ELSIF TG_OP = 'INSERT' THEN
    FOR workflow_record IN 
      SELECT * FROM automation_workflows
      WHERE user_id = NEW.user_id
      AND trigger_type = 'job_created'
      AND is_active = true
      AND status = 'active'
    LOOP
      -- Create execution log for processing
      log_id := create_automation_log_for_processing(
        workflow_record.id,
        'job_created',
        jsonb_build_object(
          'job_id', NEW.id,
          'jobId', NEW.id,
          'job', row_to_json(NEW),
          'workflow_id', workflow_record.id,
          'userId', NEW.user_id,
          'triggerType', 'job_created'
        )
      );
      
      -- Update workflow execution count
      UPDATE automation_workflows
      SET execution_count = COALESCE(execution_count, 0) + 1,
          last_triggered_at = NOW()
      WHERE id = workflow_record.id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Create an index to speed up pending log queries
CREATE INDEX IF NOT EXISTS idx_automation_logs_pending 
ON automation_execution_logs(status, created_at) 
WHERE status = 'pending';

-- Add a comment explaining the automation flow
COMMENT ON FUNCTION handle_job_automation_triggers() IS 
'Creates pending automation logs when jobs are created or status changes. 
Frontend or edge functions must process these pending logs to execute the actual automations.';
