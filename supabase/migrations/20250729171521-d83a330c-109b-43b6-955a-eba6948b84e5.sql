-- Drop and recreate the execute_automation_for_record function with the correct implementation
-- First drop the existing function
DROP FUNCTION IF EXISTS execute_automation_for_record(text, jsonb, uuid);

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the corrected function to execute automation for a record
CREATE OR REPLACE FUNCTION execute_automation_for_record(
  trigger_type TEXT,
  trigger_data JSONB,
  org_id UUID
) RETURNS VOID AS $$
DECLARE
  automation_record RECORD;
  match_found BOOLEAN;
  automation_context JSONB;
  step_data JSONB;
  conditions_data JSONB;
  condition_match BOOLEAN;
BEGIN
  FOR automation_record IN 
    SELECT * FROM automation_workflows 
    WHERE organization_id = org_id 
    AND status = 'active'
  LOOP
    match_found := FALSE;
    
    -- Check if automation matches the trigger
    IF automation_record.template_config IS NOT NULL 
       AND automation_record.template_config ? 'steps' THEN
      -- Check steps for matching trigger
      FOR step_data IN SELECT jsonb_array_elements(automation_record.template_config->'steps')
      LOOP
        IF (step_data->>'type') = 'trigger' 
           AND (step_data->'config'->>'triggerType') = trigger_type THEN
          
          -- Check additional conditions if they exist
          condition_match := TRUE;
          IF step_data->'config' ? 'conditions' THEN
            conditions_data := step_data->'config'->'conditions';
            IF jsonb_array_length(conditions_data) > 0 THEN
              -- For job_status_changed, check if status matches
              IF trigger_type = 'job_status_changed' 
                 AND step_data->'config' ? 'to_status' THEN
                DECLARE
                  target_statuses JSONB := step_data->'config'->'to_status';
                  new_status TEXT := trigger_data->>'new_status';
                BEGIN
                  condition_match := FALSE;
                  IF jsonb_typeof(target_statuses) = 'array' THEN
                    FOR i IN 0..jsonb_array_length(target_statuses)-1 LOOP
                      IF target_statuses->>i = new_status THEN
                        condition_match := TRUE;
                        EXIT;
                      END IF;
                    END LOOP;
                  END IF;
                END;
              END IF;
            END IF;
          END IF;
          
          IF condition_match THEN
            match_found := TRUE;
            EXIT;
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    -- If match found, execute the automation
    IF match_found THEN
      -- Create execution context with more data
      automation_context := jsonb_build_object(
        'triggerType', trigger_type,
        'triggerData', trigger_data,
        'workflowId', automation_record.id,
        'organizationId', org_id,
        'userId', automation_record.user_id,
        'jobId', COALESCE(trigger_data->>'job_id', trigger_data->>'id'),
        'clientId', trigger_data->>'client_id'
      );
      
      -- Call automation executor edge function using pg_net
      PERFORM net.http_post(
        url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-executor',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU5MTcwNSwiZXhwIjoyMDYzMTY3NzA1fQ.Qv6NXGmqTdGNFGqJPjIBgaF0cG8oAhW0Cm5xCUUZA5w'
        ),
        body := jsonb_build_object(
          'workflowId', automation_record.id,
          'context', automation_context
        )::text
      );
      
      -- Update workflow metrics
      UPDATE automation_workflows 
      SET 
        last_triggered_at = NOW(),
        execution_count = COALESCE(execution_count, 0) + 1
      WHERE id = automation_record.id;
      
      RAISE LOG 'Triggered automation % for trigger type %', automation_record.id, trigger_type;
    END IF;
  END LOOP;
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE LOG 'Error in execute_automation_for_record: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;