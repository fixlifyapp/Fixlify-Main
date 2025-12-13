-- Phase 1: Clean up cron jobs and create unified automation system

-- Remove all existing cron jobs to avoid conflicts
SELECT cron.unschedule('process-pending-automations');
SELECT cron.unschedule('check-automation-triggers');
SELECT cron.unschedule('cleanup-stuck-automations');

-- Create a unified automation processing function
CREATE OR REPLACE FUNCTION process_automation_system()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stuck_count INTEGER;
  processed_count INTEGER;
BEGIN
  -- Step 1: Clean up stuck automations (older than 5 minutes)
  UPDATE automation_execution_logs
  SET status = 'failed',
      error_message = 'Timeout - stuck in running state for over 5 minutes',
      completed_at = NOW()
  WHERE status = 'running'
    AND started_at < NOW() - INTERVAL '5 minutes';

  GET DIAGNOSTICS stuck_count = ROW_COUNT;
  
  IF stuck_count > 0 THEN
    RAISE LOG 'Cleaned up % stuck automations', stuck_count;
  END IF;

  -- Step 2: Process pending automations by calling the edge function
  FOR i IN 1..10 LOOP -- Process up to 10 automations per run
    -- Check if there are pending automations
    IF NOT EXISTS (
      SELECT 1 FROM automation_execution_logs 
      WHERE status = 'pending' 
      LIMIT 1
    ) THEN
      EXIT; -- No more pending automations
    END IF;

    -- Call the automation scheduler edge function
    PERFORM
      net.http_post(
        url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-scheduler',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU5MTcwNSwiZXhwIjoyMDYzMTY3NzA1fQ.s4W6QZqH0zGYxZaJ0dGzMz3Z4VIj9YqCtYcm6zD8qTE"}'::jsonb,
        body := '{"source": "cron_job"}'::jsonb
      );
    
    -- Small delay between calls
    PERFORM pg_sleep(0.5);
  END LOOP;

  -- Step 3: Update workflow metrics
  UPDATE automation_workflows
  SET execution_count = COALESCE(execution_count, 0) + (
    SELECT COUNT(*)
    FROM automation_execution_logs
    WHERE workflow_id = automation_workflows.id
      AND status = 'completed'
      AND completed_at > NOW() - INTERVAL '1 hour'
  ),
  success_count = COALESCE(success_count, 0) + (
    SELECT COUNT(*)
    FROM automation_execution_logs
    WHERE workflow_id = automation_workflows.id
      AND status = 'completed'
      AND completed_at > NOW() - INTERVAL '1 hour'
  ),
  last_triggered_at = (
    SELECT MAX(created_at)
    FROM automation_execution_logs
    WHERE workflow_id = automation_workflows.id
      AND created_at > NOW() - INTERVAL '1 hour'
  )
  WHERE id IN (
    SELECT DISTINCT workflow_id
    FROM automation_execution_logs
    WHERE status = 'completed'
      AND completed_at > NOW() - INTERVAL '1 hour'
  );

END;
$$;

-- Phase 2: Enhanced job status trigger function with better deduplication and validation
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workflow_record RECORD;
  normalized_old_status TEXT;
  normalized_new_status TEXT;
  dedup_hash TEXT;
  trigger_data JSONB;
  condition_met BOOLEAN;
  condition_record RECORD;
BEGIN
  -- Only process UPDATE operations
  IF TG_OP != 'UPDATE' THEN
    RETURN NEW;
  END IF;

  -- Normalize status strings for comparison
  normalized_old_status := LOWER(TRIM(REPLACE(REPLACE(REPLACE(COALESCE(OLD.status, ''), ' ', ''), '_', ''), '-', '')));
  normalized_new_status := LOWER(TRIM(REPLACE(REPLACE(REPLACE(COALESCE(NEW.status, ''), ' ', ''), '_', ''), '-', '')));

  -- Only trigger if status actually changed
  IF normalized_old_status = normalized_new_status THEN
    RETURN NEW;
  END IF;

  RAISE LOG 'Job % status changed from "%" to "%"', NEW.id, OLD.status, NEW.status;

  -- Create deduplication hash to prevent duplicate processing within 30 seconds
  dedup_hash := encode(sha256((NEW.id || '_' || NEW.status || '_' || EXTRACT(EPOCH FROM NOW())::bigint / 30)::bytea), 'hex');

  -- Check for recent duplicate
  IF EXISTS (
    SELECT 1 FROM automation_deduplication
    WHERE execution_hash = dedup_hash
      AND created_at > NOW() - INTERVAL '30 seconds'
  ) THEN
    RAISE LOG 'Skipping duplicate automation for job % status %', NEW.id, NEW.status;
    RETURN NEW;
  END IF;

  -- Insert deduplication record
  INSERT INTO automation_deduplication (execution_hash, workflow_id, job_id, new_status)
  VALUES (dedup_hash, '00000000-0000-0000-0000-000000000000'::uuid, NEW.id, NEW.status)
  ON CONFLICT (execution_hash) DO NOTHING;

  -- Prepare trigger data
  trigger_data := jsonb_build_object(
    'job', to_jsonb(NEW),
    'jobId', NEW.id,
    'job_id', NEW.id,
    'userId', NEW.user_id,
    'user_id', NEW.user_id,
    'new_status', NEW.status,
    'old_status', OLD.status,
    'triggerType', 'job_status_changed',
    'trigger_type', 'job_status_changed',
    'organization_id', NEW.organization_id,
    'timestamp', NOW()
  );

  -- Find all active workflows for job status changes
  FOR workflow_record IN
    SELECT DISTINCT w.*
    FROM automation_workflows w
    WHERE w.is_active = TRUE
      AND w.enabled = TRUE
      AND w.user_id = NEW.user_id
      AND (
        w.trigger_type = 'job_status_changed'
        OR w.trigger_type = 'job_completed'
        OR jsonb_path_exists(w.triggers, '$[*] ? (@.type == "job_status_changed")')
        OR jsonb_path_exists(w.triggers, '$[*] ? (@.type == "job_completed")')
      )
  LOOP
    condition_met := TRUE;

    -- Check trigger conditions if they exist
    IF workflow_record.trigger_conditions IS NOT NULL AND jsonb_array_length(workflow_record.trigger_conditions) > 0 THEN
      condition_met := FALSE;
      
      FOR condition_record IN
        SELECT *
        FROM jsonb_array_elements(workflow_record.trigger_conditions) AS condition
      LOOP
        -- Check status conditions
        IF condition_record.condition->>'field' = 'status' THEN
          IF LOWER(TRIM(condition_record.condition->>'value')) = normalized_new_status THEN
            condition_met := TRUE;
            EXIT;
          END IF;
        -- Check for specific completed status workflows
        ELSIF condition_record.condition->>'field' = 'job_status' AND condition_record.condition->>'value' = 'completed' THEN
          IF normalized_new_status = 'completed' THEN
            condition_met := TRUE;
            EXIT;
          END IF;
        END IF;
      END LOOP;
    -- If no conditions, trigger for all status changes
    ELSIF workflow_record.trigger_type = 'job_status_changed' THEN
      condition_met := TRUE;
    -- For job_completed triggers, only trigger on completed status
    ELSIF workflow_record.trigger_type = 'job_completed' THEN
      condition_met := (normalized_new_status = 'completed');
    END IF;

    -- Create automation execution log if conditions are met
    IF condition_met THEN
      -- Validate workflow has proper steps/actions
      IF (
        workflow_record.steps IS NOT NULL AND jsonb_array_length(workflow_record.steps) > 0
      ) OR (
        workflow_record.action_config IS NOT NULL AND workflow_record.action_config != '{}'::jsonb
      ) THEN
        INSERT INTO automation_execution_logs (
          workflow_id,
          trigger_type,
          trigger_data,
          status,
          organization_id,
          created_at,
          started_at
        ) VALUES (
          workflow_record.id,
          'job_status_changed',
          trigger_data,
          'pending',
          NEW.organization_id,
          NOW(),
          NOW()
        );

        RAISE LOG 'Created automation execution for workflow % (job % -> %)', 
          workflow_record.id, NEW.id, NEW.status;
      ELSE
        RAISE LOG 'Skipping workflow % - no valid steps or actions configured', workflow_record.id;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Phase 3: Create automation health monitoring
CREATE OR REPLACE VIEW automation_system_health AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'running') as running_count,
  COUNT(*) FILTER (WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '1 hour') as completed_last_hour,
  COUNT(*) FILTER (WHERE status = 'failed' AND completed_at > NOW() - INTERVAL '1 hour') as failed_last_hour,
  COUNT(*) FILTER (WHERE status = 'running' AND started_at < NOW() - INTERVAL '5 minutes') as stuck_count,
  MAX(completed_at) FILTER (WHERE status = 'completed') as last_successful_run,
  MAX(completed_at) FILTER (WHERE status = 'failed') as last_failed_run
FROM automation_execution_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Schedule the unified automation system to run every minute
SELECT cron.schedule(
  'process-automation-system',
  '* * * * *',
  'SELECT process_automation_system();'
);

-- Create test function for manual testing
CREATE OR REPLACE FUNCTION test_job_status_automation(
  p_job_id TEXT DEFAULT 'J-2019',
  p_new_status TEXT DEFAULT 'completed',
  p_user_id UUID DEFAULT '6dfbdcae-c484-45aa-9327-763500213f24'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  workflow_count INTEGER;
  execution_count INTEGER;
BEGIN
  -- Count active workflows that should trigger
  SELECT COUNT(*) INTO workflow_count
  FROM automation_workflows
  WHERE is_active = TRUE
    AND enabled = TRUE
    AND user_id = p_user_id
    AND (
      trigger_type = 'job_status_changed'
      OR trigger_type = 'job_completed'
      OR jsonb_path_exists(triggers, '$[*] ? (@.type == "job_status_changed")')
    );

  -- Simulate status update
  UPDATE jobs
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_job_id
    AND user_id = p_user_id;

  -- Wait a moment for triggers to process
  PERFORM pg_sleep(1);

  -- Count created execution logs
  SELECT COUNT(*) INTO execution_count
  FROM automation_execution_logs
  WHERE trigger_data->>'job_id' = p_job_id
    AND created_at > NOW() - INTERVAL '10 seconds';

  result := jsonb_build_object(
    'job_id', p_job_id,
    'new_status', p_new_status,
    'active_workflows_found', workflow_count,
    'execution_logs_created', execution_count,
    'success', execution_count > 0,
    'message', CASE
      WHEN execution_count > 0 THEN 'Automation triggered successfully'
      WHEN workflow_count = 0 THEN 'No active workflows found for this trigger'
      ELSE 'Workflows found but no executions created - check workflow configuration'
    END
  );

  RETURN result;
END;
$$;