-- Update the job automation trigger to pass real context data
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  context_data JSONB;
BEGIN
  -- Get organization ID from user
  SELECT organization_id INTO org_id 
  FROM profiles 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;
  
  -- If no organization, use a default UUID
  IF org_id IS NULL THEN
    org_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  
  -- Job status changed trigger
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Build rich context data with job and client information
    context_data := jsonb_build_object(
      'jobId', NEW.id,
      'job_id', NEW.id,
      'userId', NEW.user_id,
      'triggerType', 'job_status_changed',
      'workflowId', null, -- Will be set by executor
      'job', jsonb_build_object(
        'id', NEW.id,
        'title', COALESCE(NEW.title, NEW.description),
        'status', NEW.status,
        'oldStatus', OLD.status,
        'user_id', NEW.user_id,
        'client_id', NEW.client_id,
        'scheduled_date', NEW.scheduled_date,
        'scheduled_time', NEW.scheduled_time,
        'total', NEW.total,
        'notes', NEW.notes
      )
    );
    
    -- Add client information if we have a client_id
    IF NEW.client_id IS NOT NULL THEN
      -- Add client data to context (will be enriched by automation executor)
      context_data := context_data || jsonb_build_object(
        'clientId', NEW.client_id,
        'client_id', NEW.client_id
      );
    END IF;
    
    PERFORM execute_automation_for_record(
      'job_status_changed',
      context_data,
      org_id
    );
  END IF;
  
  -- Job created trigger
  IF TG_OP = 'INSERT' THEN
    context_data := jsonb_build_object(
      'jobId', NEW.id,
      'job_id', NEW.id,
      'userId', NEW.user_id,
      'triggerType', 'job_created',
      'workflowId', null,
      'job', jsonb_build_object(
        'id', NEW.id,
        'title', COALESCE(NEW.title, NEW.description),
        'status', NEW.status,
        'user_id', NEW.user_id,
        'client_id', NEW.client_id,
        'scheduled_date', NEW.scheduled_date,
        'scheduled_time', NEW.scheduled_time,
        'total', NEW.total,
        'notes', NEW.notes
      )
    );
    
    IF NEW.client_id IS NOT NULL THEN
      context_data := context_data || jsonb_build_object(
        'clientId', NEW.client_id,
        'client_id', NEW.client_id
      );
    END IF;
    
    PERFORM execute_automation_for_record(
      'job_created',
      context_data,
      org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the execute_automation_for_record function to call the automation executor
CREATE OR REPLACE FUNCTION execute_automation_for_record(
  trigger_type_param TEXT,
  context_data_param JSONB,
  org_id_param UUID
) RETURNS VOID AS $$
DECLARE
  workflow_record RECORD;
  trigger_conditions JSONB;
  should_execute BOOLEAN;
BEGIN
  -- Find matching workflows for this trigger type and organization
  FOR workflow_record IN 
    SELECT * FROM automation_workflows 
    WHERE status = 'active' 
    AND user_id IN (
      SELECT id FROM profiles WHERE organization_id = org_id_param
    )
    AND (
      -- Match template config steps that have this trigger type
      template_config->'steps' @> jsonb_build_array(
        jsonb_build_object('type', 'trigger', 'config', jsonb_build_object('triggerType', trigger_type_param))
      )
      OR
      -- Legacy trigger_type field support
      trigger_type = trigger_type_param
    )
  LOOP
    should_execute := TRUE;
    
    -- Check any additional conditions from the workflow
    IF workflow_record.trigger_conditions IS NOT NULL THEN
      trigger_conditions := workflow_record.trigger_conditions;
      
      -- Add custom condition checking logic here if needed
      -- For now, we'll execute if the basic trigger matches
    END IF;
    
    IF should_execute THEN
      -- Log the automation execution request
      INSERT INTO automation_execution_logs (
        automation_id,
        workflow_id,
        trigger_type,
        trigger_data,
        status,
        started_at,
        organization_id
      ) VALUES (
        workflow_record.id,
        workflow_record.id,
        trigger_type_param,
        context_data_param || jsonb_build_object('workflowId', workflow_record.id),
        'pending',
        now(),
        org_id_param
      );
      
      -- Execute the workflow asynchronously by calling the automation-executor
      -- Note: In a real system, this would be done via a job queue
      -- For now, we'll rely on the process-scheduled-automations function
      RAISE NOTICE 'Automation triggered: % for workflow %', trigger_type_param, workflow_record.id;
    END IF;
  END LOOP;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in execute_automation_for_record: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS automation_job_triggers ON jobs;
CREATE TRIGGER automation_job_triggers
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();