-- Phase 2: Enhanced job status trigger function
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workflows RECORD;
  v_execution_hash TEXT;
  v_org_id UUID;
BEGIN
  -- Get organization_id from the job's user
  SELECT organization_id INTO v_org_id 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Only process if status actually changed
  IF TG_OP = 'UPDATE' AND (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
    RETURN NEW;
  END IF;
  
  -- Create execution hash for deduplication
  v_execution_hash := encode(sha256((NEW.id || ':' || NEW.status || ':' || EXTRACT(EPOCH FROM NOW()))::bytea), 'hex');
  
  -- Check for recent duplicate within 30 seconds
  IF EXISTS (
    SELECT 1 FROM automation_deduplication 
    WHERE job_id = NEW.id 
    AND new_status = NEW.status 
    AND created_at > NOW() - INTERVAL '30 seconds'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Insert deduplication record
  INSERT INTO automation_deduplication (execution_hash, workflow_id, job_id, new_status)
  SELECT v_execution_hash, aw.id, NEW.id, NEW.status
  FROM automation_workflows aw 
  WHERE aw.organization_id = v_org_id 
  AND aw.is_active = true 
  AND aw.trigger_type = 'job_status_changed'
  LIMIT 1;
  
  -- Create automation execution logs for matching workflows
  FOR v_workflows IN 
    SELECT aw.* FROM automation_workflows aw
    WHERE aw.organization_id = v_org_id
    AND aw.is_active = true
    AND aw.trigger_type = 'job_status_changed'
    AND (
      aw.trigger_conditions IS NULL 
      OR aw.trigger_conditions = '[]'::jsonb
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(aw.trigger_conditions) AS condition
        WHERE (condition->>'field' = 'status' AND condition->>'value' = NEW.status)
        OR (condition->>'field' = 'status_from' AND condition->>'value' = COALESCE(OLD.status, ''))
      )
    )
  LOOP
    -- Create execution log
    INSERT INTO automation_execution_logs (
      workflow_id,
      trigger_type,
      trigger_data,
      status,
      organization_id,
      created_at
    ) VALUES (
      v_workflows.id,
      'job_status_changed',
      jsonb_build_object(
        'job_id', NEW.id,
        'job_number', NEW.job_number,
        'client_id', NEW.client_id,
        'old_status', COALESCE(OLD.status, ''),
        'new_status', NEW.status,
        'title', NEW.title,
        'priority', NEW.priority,
        'total_amount', NEW.total,
        'execution_hash', v_execution_hash
      ),
      'pending',
      v_org_id,
      NOW()
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Phase 3: Create automation system health view
CREATE OR REPLACE VIEW automation_system_health AS
SELECT 
  (SELECT COUNT(*) FROM automation_execution_logs WHERE status = 'pending') as pending_count,
  (SELECT COUNT(*) FROM automation_execution_logs WHERE status = 'running') as running_count,
  (SELECT COUNT(*) FROM automation_execution_logs WHERE status = 'completed' AND created_at > NOW() - INTERVAL '1 hour') as completed_last_hour,
  (SELECT COUNT(*) FROM automation_execution_logs WHERE status = 'failed' AND created_at > NOW() - INTERVAL '1 hour') as failed_last_hour,
  (SELECT MAX(created_at) FROM automation_execution_logs WHERE status = 'completed') as last_success,
  (SELECT MAX(created_at) FROM automation_execution_logs WHERE status = 'failed') as last_failure,
  (SELECT COUNT(*) FROM automation_workflows WHERE is_active = true) as active_workflows;

-- Phase 4: Schedule the unified processing function to run every minute
SELECT cron.schedule(
  'automation-system-processor',
  '* * * * *',
  $$SELECT process_automation_system();$$
);

-- Phase 5: Add testing function
CREATE OR REPLACE FUNCTION test_job_status_automation(
  p_job_id TEXT,
  p_old_status TEXT DEFAULT 'pending',
  p_new_status TEXT DEFAULT 'completed'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_job_record RECORD;
  v_logs_created INTEGER;
BEGIN
  -- Get the job record
  SELECT * INTO v_job_record FROM jobs WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job not found', 'job_id', p_job_id);
  END IF;
  
  -- Count existing logs before test
  SELECT COUNT(*) INTO v_logs_created 
  FROM automation_execution_logs 
  WHERE trigger_data->>'job_id' = p_job_id;
  
  -- Simulate the trigger by updating the job status
  UPDATE jobs 
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_job_id;
  
  -- Count logs after test
  SELECT COUNT(*) - v_logs_created INTO v_logs_created
  FROM automation_execution_logs 
  WHERE trigger_data->>'job_id' = p_job_id
  AND created_at > NOW() - INTERVAL '5 seconds';
  
  -- Reset job status
  UPDATE jobs 
  SET status = p_old_status, updated_at = NOW()
  WHERE id = p_job_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'job_id', p_job_id,
    'status_change', p_old_status || ' -> ' || p_new_status,
    'automation_logs_created', v_logs_created,
    'test_completed_at', NOW()
  );
END;
$$;