-- Fix the job automation trigger function to use correct field names
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
        'date', NEW.date,
        'schedule_start', NEW.schedule_start,
        'schedule_end', NEW.schedule_end,
        'revenue', NEW.revenue,
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
        'date', NEW.date,
        'schedule_start', NEW.schedule_start,
        'schedule_end', NEW.schedule_end,
        'revenue', NEW.revenue,
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
$$ LANGUAGE plpgsql;