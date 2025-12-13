-- Fix the automation trigger function to use correct field names
CREATE OR REPLACE FUNCTION public.handle_job_automation_triggers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  workflow_record RECORD;
  trigger_config JSONB;
  conditions JSONB;
  condition_met BOOLEAN := TRUE;
  condition_item JSONB;
  field_value TEXT;
  org_id UUID;
BEGIN
  -- Get organization_id for the job
  org_id := COALESCE(NEW.organization_id, NEW.user_id);
  
  -- Handle different trigger types
  FOR workflow_record IN 
    SELECT * FROM automation_workflows 
    WHERE is_active = TRUE 
    AND organization_id = org_id
    AND (
      (trigger_type = 'job_created' AND TG_OP = 'INSERT') OR
      (trigger_type = 'job_status_changed' AND TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR
      (trigger_type = 'job_completed' AND TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed')
    )
  LOOP
    -- Get trigger conditions
    trigger_config := COALESCE(workflow_record.trigger_config, '{}'::jsonb);
    conditions := COALESCE(trigger_config->'conditions', '[]'::jsonb);
    
    -- Check conditions
    condition_met := TRUE;
    
    -- Loop through conditions
    FOR condition_item IN SELECT * FROM jsonb_array_elements(conditions)
    LOOP
      -- Get field value from NEW record
      CASE condition_item->>'field'
        WHEN 'status' THEN field_value := NEW.status;
        WHEN 'service' THEN field_value := NEW.service;
        WHEN 'job_type' THEN field_value := NEW.job_type;
        WHEN 'technician_id' THEN field_value := NEW.technician_id;
        WHEN 'client_id' THEN field_value := NEW.client_id;
        ELSE field_value := NULL;
      END CASE;
      
      -- Check condition
      CASE condition_item->>'operator'
        WHEN 'equals' THEN
          IF field_value != condition_item->>'value' THEN
            condition_met := FALSE;
            EXIT;
          END IF;
        WHEN 'not_equals' THEN
          IF field_value = condition_item->>'value' THEN
            condition_met := FALSE;
            EXIT;
          END IF;
        -- Add more operators as needed
      END CASE;
    END LOOP;
    
    -- If conditions are met, create automation log
    IF condition_met THEN
      INSERT INTO automation_execution_logs (
        workflow_id,
        trigger_type,
        trigger_data,
        status,
        started_at,
        organization_id
      ) VALUES (
        workflow_record.id,
        workflow_record.trigger_type,
        jsonb_build_object(
          'job_id', NEW.id,  -- Use NEW.id instead of NEW.job_number
          'job_title', NEW.title,
          'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
          'new_status', NEW.status,
          'client_id', NEW.client_id,
          'technician_id', NEW.technician_id,
          'service', NEW.service,
          'job_type', NEW.job_type,
          'revenue', NEW.revenue,
          'created_at', NEW.created_at,
          'updated_at', NEW.updated_at
        ),
        'pending',
        now(),
        org_id
      );
      
      -- Update workflow metrics
      UPDATE automation_workflows
      SET 
        execution_count = COALESCE(execution_count, 0) + 1,
        last_triggered_at = now()
      WHERE id = workflow_record.id;
      
      RAISE NOTICE 'Created automation log for workflow % (job %)', workflow_record.id, NEW.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;