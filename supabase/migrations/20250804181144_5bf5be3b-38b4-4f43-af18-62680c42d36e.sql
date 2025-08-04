-- Create database triggers to automatically execute automations when jobs change status
-- This will fix the automation system by creating automation logs when job status changes

-- Create function to handle job status change automation
CREATE OR REPLACE FUNCTION handle_job_status_automation()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
BEGIN
  -- Only trigger for status changes (not initial inserts)
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Find active workflows that match this trigger
    FOR workflow_record IN 
      SELECT * FROM automation_workflows 
      WHERE trigger_type = 'job_status_changed' 
      AND status = 'active'
      AND organization_id = NEW.organization_id
    LOOP
      -- Create automation execution log
      INSERT INTO automation_execution_logs (
        workflow_id,
        trigger_type,
        trigger_data,
        status,
        started_at,
        organization_id
      ) VALUES (
        workflow_record.id,
        'job_status_changed',
        jsonb_build_object(
          'jobId', NEW.id,
          'oldStatus', OLD.status,
          'newStatus', NEW.status,
          'clientId', NEW.client_id,
          'userId', NEW.user_id,
          'jobNumber', NEW.job_number,
          'triggerType', 'job_status_changed'
        ),
        'pending',
        NOW(),
        NEW.organization_id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job status changes
DROP TRIGGER IF EXISTS job_status_automation_trigger ON jobs;
CREATE TRIGGER job_status_automation_trigger
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_status_automation();

-- Update the automation processor to find and process recent pending logs more effectively
-- Also add a function to manually process a specific pending log
CREATE OR REPLACE FUNCTION process_pending_automation_log(log_id UUID)
RETURNS jsonb AS $$
DECLARE
  log_record RECORD;
  workflow_record RECORD;
  result jsonb;
BEGIN
  -- Get the pending log
  SELECT * INTO log_record
  FROM automation_execution_logs
  WHERE id = log_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Log not found or not pending');
  END IF;
  
  -- Get the workflow
  SELECT * INTO workflow_record
  FROM automation_workflows
  WHERE id = log_record.workflow_id;
  
  IF NOT FOUND THEN
    -- Mark as failed
    UPDATE automation_execution_logs
    SET status = 'failed', 
        error_message = 'Workflow not found',
        completed_at = NOW()
    WHERE id = log_id;
    
    RETURN jsonb_build_object('success', false, 'error', 'Workflow not found');
  END IF;
  
  -- Mark as running
  UPDATE automation_execution_logs
  SET status = 'running',
      started_at = NOW()
  WHERE id = log_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Log marked as running, will be processed by edge function');
END;
$$ LANGUAGE plpgsql;