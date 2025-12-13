-- Fix automation system to properly handle steps and triggers
-- This ensures workflows work correctly with their defined actions

-- 1. First, let's see the current state of workflows
SELECT 
    id,
    name,
    trigger_type,
    steps,
    trigger_config,
    is_active,
    jsonb_array_length(COALESCE(steps, '[]'::jsonb)) as step_count
FROM automation_workflows
WHERE is_active = true
ORDER BY created_at DESC;

-- 2. Fix the trigger function to properly check steps
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
  should_trigger BOOLEAN := FALSE;
  condition JSONB;
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
      -- Only workflows with steps defined
      AND steps IS NOT NULL 
      AND jsonb_array_length(steps) > 0
    LOOP
      should_trigger := FALSE;
      
      -- Check if status matches trigger condition
      IF workflow_record.trigger_config IS NOT NULL AND 
         workflow_record.trigger_config->>'conditions' IS NOT NULL THEN
        -- Check each condition
        FOR condition IN SELECT * FROM jsonb_array_elements(workflow_record.trigger_config->'conditions')
        LOOP
          IF condition->>'field' = 'status' AND 
             lower(condition->>'value') = lower(NEW.status) THEN
            should_trigger := TRUE;
            EXIT;
          END IF;
        END LOOP;
      ELSE
        -- No conditions, trigger for any status change
        should_trigger := TRUE;
      END IF;
      
      IF should_trigger THEN
        -- Log the trigger details
        RAISE NOTICE 'Triggering workflow % for job % status change from % to %', 
          workflow_record.name, NEW.id, OLD.status, NEW.status;
        
        -- Create execution log
        INSERT INTO automation_execution_logs (
          workflow_id,
          trigger_type,
          trigger_data,
          status,
          created_at
        ) VALUES (
          workflow_record.id,
          'job_status_changed',
          jsonb_build_object(
            'job_id', NEW.id,
            'jobId', NEW.id,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'oldStatus', OLD.status,
            'status', NEW.status,
            'job', row_to_json(NEW),
            'workflow_id', workflow_record.id,
            'userId', NEW.user_id,
            'user_id', NEW.user_id,
            'triggerType', 'job_status_changed'
          ),
          'pending',
          NOW()
        ) RETURNING id INTO log_id;
        
        RAISE NOTICE 'Created automation log % for workflow %', log_id, workflow_record.id;
        
        -- Update workflow execution count
        UPDATE automation_workflows
        SET execution_count = COALESCE(execution_count, 0) + 1,
            last_triggered_at = NOW()
        WHERE id = workflow_record.id;
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
      -- Only workflows with steps defined
      AND steps IS NOT NULL 
      AND jsonb_array_length(steps) > 0
    LOOP
      RAISE NOTICE 'Triggering workflow % for new job %', workflow_record.name, NEW.id;
      
      -- Create execution log
      INSERT INTO automation_execution_logs (
        workflow_id,
        trigger_type,
        trigger_data,
        status,
        created_at
      ) VALUES (
        workflow_record.id,
        'job_created',
        jsonb_build_object(
          'job_id', NEW.id,
          'jobId', NEW.id,
          'job', row_to_json(NEW),
          'workflow_id', workflow_record.id,
          'userId', NEW.user_id,
          'user_id', NEW.user_id,
          'triggerType', 'job_created'
        ),
        'pending',
        NOW()
      ) RETURNING id INTO log_id;
      
      RAISE NOTICE 'Created automation log % for workflow %', log_id, workflow_record.id;
      
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

-- 3. Recreate the trigger
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- 4. Add helper function to validate workflow before execution
CREATE OR REPLACE FUNCTION validate_workflow_for_execution(workflow_id UUID)
RETURNS TABLE(is_valid BOOLEAN, error_message TEXT) AS $$
DECLARE
  workflow_record RECORD;
BEGIN
  -- Get workflow
  SELECT * INTO workflow_record
  FROM automation_workflows
  WHERE id = workflow_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Workflow not found';
    RETURN;
  END IF;
  
  IF NOT workflow_record.is_active THEN
    RETURN QUERY SELECT FALSE, 'Workflow is not active';
    RETURN;
  END IF;
  
  IF workflow_record.status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'Workflow status is not active';
    RETURN;
  END IF;
  
  IF workflow_record.steps IS NULL OR jsonb_array_length(workflow_record.steps) = 0 THEN
    RETURN QUERY SELECT FALSE, 'Workflow has no steps defined';
    RETURN;
  END IF;
  
  -- Check if steps have required fields
  IF NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(workflow_record.steps) AS step
    WHERE step->>'type' IS NOT NULL
  ) THEN
    RETURN QUERY SELECT FALSE, 'Workflow steps are invalid';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a view to easily see workflow status
CREATE OR REPLACE VIEW automation_workflow_status AS
SELECT 
    w.id,
    w.name,
    w.trigger_type,
    w.is_active,
    w.status,
    jsonb_array_length(COALESCE(w.steps, '[]'::jsonb)) as step_count,
    CASE 
        WHEN w.steps IS NULL OR jsonb_array_length(w.steps) = 0 THEN 'No steps defined'
        WHEN NOT w.is_active THEN 'Inactive'
        WHEN w.status != 'active' THEN 'Status not active'
        ELSE 'Ready'
    END as execution_status,
    w.execution_count,
    w.last_triggered_at,
    (
        SELECT COUNT(*) 
        FROM automation_execution_logs l 
        WHERE l.workflow_id = w.id AND l.status = 'pending'
    ) as pending_executions,
    w.created_at
FROM automation_workflows w
ORDER BY w.created_at DESC;

-- 6. Fix any workflows that have template_config instead of steps
UPDATE automation_workflows
SET steps = template_config->'steps'
WHERE steps IS NULL 
  AND template_config IS NOT NULL 
  AND template_config->'steps' IS NOT NULL
  AND jsonb_array_length(template_config->'steps') > 0;

-- 7. Show current workflow status
SELECT * FROM automation_workflow_status;
