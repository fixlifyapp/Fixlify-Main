-- Fix permissions for automation system
-- Allow system to update automation execution logs
DROP POLICY IF EXISTS "System can insert automation logs" ON automation_execution_logs;
DROP POLICY IF EXISTS "System can update automation logs" ON automation_execution_logs;

CREATE POLICY "System can manage automation logs" ON automation_execution_logs
FOR ALL USING (true);

-- Update the process function to use proper permissions
CREATE OR REPLACE FUNCTION process_pending_automation_log(log_id UUID)
RETURNS jsonb AS $$
DECLARE
  log_record RECORD;
  workflow_record RECORD;
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
    -- Mark as failed using system permissions
    INSERT INTO automation_execution_logs (
      id, workflow_id, trigger_type, trigger_data, status, 
      error_message, completed_at, organization_id, created_at, started_at
    ) VALUES (
      gen_random_uuid(), log_record.workflow_id, log_record.trigger_type, 
      log_record.trigger_data, 'failed', 'Workflow not found', NOW(), 
      log_record.organization_id, log_record.created_at, log_record.started_at
    ) ON CONFLICT (id) DO UPDATE SET
      status = 'failed',
      error_message = 'Workflow not found',
      completed_at = NOW();
    
    RETURN jsonb_build_object('success', false, 'error', 'Workflow not found');
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Log ready for processing', 'workflow_name', workflow_record.name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;