-- Fix the handle_job_status_automation function to use correct field names
CREATE OR REPLACE FUNCTION public.handle_job_status_automation()
RETURNS trigger AS $$
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
          'jobNumber', NEW.id,  -- Use NEW.id instead of NEW.job_number
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
$$ LANGUAGE plpgsql SECURITY DEFINER;