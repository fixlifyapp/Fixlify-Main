-- Fix automation workflow system to ensure proper triggering for job status changes

-- First, let's clean up the test automation that has no steps
DELETE FROM automation_workflows WHERE id = '2d5d51ea-89d7-47ed-8135-1370cfbe5ada';

-- Update the job status change trigger function to be more robust
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  execution_id UUID;
  job_data JSONB;
  client_data JSONB;
  dedup_hash TEXT;
BEGIN
  -- Only process job status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Create deduplication hash
    dedup_hash := MD5(NEW.id || '-' || NEW.status || '-' || EXTRACT(EPOCH FROM NOW())::TEXT);
    
    -- Check for recent duplicate executions (within 1 minute)
    IF EXISTS (
      SELECT 1 FROM automation_deduplication 
      WHERE job_id = NEW.id 
        AND new_status = NEW.status 
        AND created_at > NOW() - INTERVAL '1 minute'
    ) THEN
      RETURN NEW;
    END IF;
    
    -- Store deduplication record
    INSERT INTO automation_deduplication (job_id, new_status, workflow_id, execution_hash)
    VALUES (NEW.id, NEW.status, '00000000-0000-0000-0000-000000000000', dedup_hash);
    
    -- Get client data if exists
    SELECT to_jsonb(c.*) INTO client_data
    FROM clients c 
    WHERE c.id = NEW.client_id;
    
    -- Prepare job data
    job_data := to_jsonb(NEW);
    
    -- Find active workflows that match this trigger
    FOR workflow_record IN 
      SELECT * FROM automation_workflows 
      WHERE trigger_type = 'job_status_changed' 
        AND status = 'active'
        AND is_active = true
        AND user_id = NEW.user_id
        AND (
          trigger_config->>'triggerType' = 'job_status_changed'
          OR trigger_config IS NULL
        )
    LOOP
      -- Check if workflow has steps before creating execution
      IF jsonb_array_length(COALESCE(workflow_record.steps, '[]'::jsonb)) > 0 THEN
        
        -- Check conditions if they exist
        IF workflow_record.trigger_config->'conditions' IS NOT NULL THEN
          -- Check status condition
          IF NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(workflow_record.trigger_config->'conditions') AS condition
            WHERE condition->>'field' = 'status' 
              AND condition->>'operator' = 'equals'
              AND condition->>'value' = NEW.status
          ) THEN
            CONTINUE; -- Skip this workflow if condition doesn't match
          END IF;
        END IF;
        
        -- Generate execution ID
        execution_id := gen_random_uuid();
        
        -- Create execution log
        INSERT INTO automation_execution_logs (
          id,
          workflow_id,
          trigger_type,
          trigger_data,
          status,
          started_at,
          organization_id
        ) VALUES (
          execution_id,
          workflow_record.id,
          'job_status_changed',
          jsonb_build_object(
            'job', job_data,
            'client', client_data,
            'jobId', NEW.id,
            'job_id', NEW.id,
            'userId', NEW.user_id,
            'new_status', NEW.status,
            'old_status', OLD.status,
            'triggerType', 'job_status_changed'
          ),
          'pending',
          NOW(),
          NEW.organization_id
        );
        
        -- Update workflow metrics
        UPDATE automation_workflows
        SET 
          execution_count = COALESCE(execution_count, 0) + 1,
          last_triggered_at = NOW()
        WHERE id = workflow_record.id;
        
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Create a function to test automation workflows manually
CREATE OR REPLACE FUNCTION test_job_status_automation(
  p_job_id TEXT,
  p_new_status TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  workflow_id UUID,
  workflow_name TEXT,
  execution_id UUID,
  steps_count INTEGER,
  has_conditions BOOLEAN,
  conditions_met BOOLEAN
) AS $$
DECLARE
  job_record RECORD;
  workflow_record RECORD;
  exec_id UUID;
  client_data JSONB;
  job_data JSONB;
BEGIN
  -- Get job data
  SELECT * INTO job_record FROM jobs WHERE id = p_job_id;
  IF job_record IS NULL THEN
    RAISE EXCEPTION 'Job not found: %', p_job_id;
  END IF;
  
  -- Get client data
  SELECT to_jsonb(c.*) INTO client_data FROM clients c WHERE c.id = job_record.client_id;
  job_data := to_jsonb(job_record);
  
  -- Test each workflow
  FOR workflow_record IN 
    SELECT * FROM automation_workflows 
    WHERE trigger_type = 'job_status_changed' 
      AND status = 'active'
      AND is_active = true
      AND (p_user_id IS NULL OR user_id = p_user_id)
  LOOP
    exec_id := gen_random_uuid();
    
    -- Check conditions
    has_conditions := workflow_record.trigger_config->'conditions' IS NOT NULL;
    conditions_met := TRUE;
    
    IF has_conditions THEN
      conditions_met := EXISTS (
        SELECT 1 FROM jsonb_array_elements(workflow_record.trigger_config->'conditions') AS condition
        WHERE condition->>'field' = 'status' 
          AND condition->>'operator' = 'equals'
          AND condition->>'value' = p_new_status
      );
    END IF;
    
    -- Create test execution if conditions are met and workflow has steps
    IF conditions_met AND jsonb_array_length(COALESCE(workflow_record.steps, '[]'::jsonb)) > 0 THEN
      INSERT INTO automation_execution_logs (
        id,
        workflow_id,
        trigger_type,
        trigger_data,
        status,
        started_at,
        organization_id
      ) VALUES (
        exec_id,
        workflow_record.id,
        'job_status_changed',
        jsonb_build_object(
          'job', job_data,
          'client', client_data,
          'jobId', p_job_id,
          'job_id', p_job_id,
          'userId', job_record.user_id,
          'new_status', p_new_status,
          'old_status', job_record.status,
          'triggerType', 'job_status_changed',
          'test', true
        ),
        'pending',
        NOW(),
        job_record.organization_id
      );
    END IF;
    
    RETURN QUERY SELECT 
      workflow_record.id,
      workflow_record.name,
      CASE WHEN conditions_met AND jsonb_array_length(COALESCE(workflow_record.steps, '[]'::jsonb)) > 0 
           THEN exec_id ELSE NULL END,
      jsonb_array_length(COALESCE(workflow_record.steps, '[]'::jsonb))::INTEGER,
      has_conditions,
      conditions_met;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;