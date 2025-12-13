-- Create or replace the job automation trigger function
CREATE OR REPLACE FUNCTION public.handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  v_workflow RECORD;
  v_user_id UUID;
  v_organization_id UUID;
  v_automation_key TEXT;
  v_existing_log_id UUID;
BEGIN
  -- Handle different trigger types
  IF TG_OP = 'INSERT' THEN
    -- Job created trigger
    v_user_id := NEW.user_id;
    v_organization_id := COALESCE(NEW.organization_id, '00000000-0000-0000-0000-000000000001');
    
    -- Create automation key to prevent duplicates
    v_automation_key := 'job_created_' || NEW.id || '_' || extract(epoch from now())::text;
    
    -- Find matching workflows for job creation
    FOR v_workflow IN 
      SELECT * FROM automation_workflows 
      WHERE trigger_type = 'job_created' 
      AND user_id = v_user_id
      AND is_active = true
    LOOP
      -- Check for duplicate automation within last 30 seconds
      SELECT id INTO v_existing_log_id
      FROM automation_execution_logs
      WHERE workflow_id = v_workflow.id
        AND trigger_type = 'job_created'
        AND (trigger_data->>'job_id')::text = NEW.id
        AND created_at > NOW() - INTERVAL '30 seconds'
      LIMIT 1;
      
      -- Only create if no recent duplicate
      IF v_existing_log_id IS NULL THEN
        INSERT INTO automation_execution_logs (
          workflow_id,
          trigger_type,
          trigger_data,
          status,
          created_at,
          started_at
        ) VALUES (
          v_workflow.id,
          'job_created',
          jsonb_build_object(
            'job_id', NEW.id,
            'jobId', NEW.id,
            'userId', v_user_id,
            'triggerType', 'job_created',
            'automation_key', v_automation_key,
            'job', row_to_json(NEW)
          ),
          'pending',
          NOW(),
          NOW()
        );
        
        RAISE NOTICE 'Created automation log for job_created: job_id=%, workflow_id=%', NEW.id, v_workflow.id;
      ELSE
        RAISE NOTICE 'Skipped duplicate automation for job_created: job_id=%, workflow_id=%', NEW.id, v_workflow.id;
      END IF;
    END LOOP;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Job status changed trigger
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_user_id := NEW.user_id;
      v_organization_id := COALESCE(NEW.organization_id, '00000000-0000-0000-0000-000000000001');
      
      -- Create automation key to prevent duplicates
      v_automation_key := 'job_status_changed_' || NEW.id || '_' || COALESCE(OLD.status, 'null') || '_to_' || NEW.status || '_' || extract(epoch from now())::text;
      
      -- Find matching workflows for status changes
      FOR v_workflow IN 
        SELECT * FROM automation_workflows 
        WHERE trigger_type = 'job_status_changed' 
        AND user_id = v_user_id
        AND is_active = true
      LOOP
        -- Check trigger conditions
        DECLARE
          v_trigger_config JSONB;
          v_conditions JSONB;
          v_condition JSONB;
          v_should_trigger BOOLEAN := false;
        BEGIN
          v_trigger_config := v_workflow.trigger_config;
          v_conditions := v_trigger_config->'conditions';
          
          -- If no specific conditions, trigger for any status change
          IF v_conditions IS NULL OR jsonb_array_length(v_conditions) = 0 THEN
            v_should_trigger := true;
          ELSE
            -- Check each condition
            FOR v_condition IN SELECT * FROM jsonb_array_elements(v_conditions)
            LOOP
              IF v_condition->>'field' = 'status' THEN
                -- Case-insensitive status matching
                IF LOWER(TRIM(v_condition->>'value')) = LOWER(TRIM(NEW.status)) THEN
                  v_should_trigger := true;
                  EXIT;
                END IF;
              END IF;
            END LOOP;
          END IF;
          
          -- Create automation log if conditions match
          IF v_should_trigger THEN
            -- Check for duplicate automation within last 30 seconds
            SELECT id INTO v_existing_log_id
            FROM automation_execution_logs
            WHERE workflow_id = v_workflow.id
              AND trigger_type = 'job_status_changed'
              AND (trigger_data->>'job_id')::text = NEW.id
              AND (trigger_data->>'new_status')::text = NEW.status
              AND created_at > NOW() - INTERVAL '30 seconds'
            LIMIT 1;
            
            -- Only create if no recent duplicate
            IF v_existing_log_id IS NULL THEN
              INSERT INTO automation_execution_logs (
                workflow_id,
                trigger_type,
                trigger_data,
                status,
                created_at,
                started_at
              ) VALUES (
                v_workflow.id,
                'job_status_changed',
                jsonb_build_object(
                  'job_id', NEW.id,
                  'jobId', NEW.id,
                  'userId', v_user_id,
                  'triggerType', 'job_status_changed',
                  'old_status', COALESCE(OLD.status, 'unknown'),
                  'new_status', NEW.status,
                  'automation_key', v_automation_key,
                  'job', row_to_json(NEW)
                ),
                'pending',
                NOW(),
                NOW()
              );
              
              RAISE NOTICE 'Created automation log for job_status_changed: job_id=%, workflow_id=%, old_status=%, new_status=%', NEW.id, v_workflow.id, OLD.status, NEW.status;
            ELSE
              RAISE NOTICE 'Skipped duplicate automation for job_status_changed: job_id=%, workflow_id=%, status=%', NEW.id, v_workflow.id, NEW.status;
            END IF;
          ELSE
            RAISE NOTICE 'Automation conditions not met for workflow_id=%, job_id=%, status=%', v_workflow.id, NEW.id, NEW.status;
          END IF;
        END;
      END LOOP;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trigger_job_automation ON public.jobs;
DROP TRIGGER IF EXISTS trigger_job_automation_insert ON public.jobs;
DROP TRIGGER IF EXISTS trigger_job_automation_update ON public.jobs;

-- Create triggers for both INSERT and UPDATE
CREATE TRIGGER trigger_job_automation_insert
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_job_automation_triggers();

CREATE TRIGGER trigger_job_automation_update
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_job_automation_triggers();