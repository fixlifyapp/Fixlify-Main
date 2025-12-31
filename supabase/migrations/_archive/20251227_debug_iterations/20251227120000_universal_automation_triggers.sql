-- Update automation trigger function to support all trigger types
-- This ensures all user-created automations work properly

CREATE OR REPLACE FUNCTION handle_universal_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
  v_trigger_type TEXT;
  should_trigger BOOLEAN;
BEGIN
  -- Bypass RLS for this function to access automation_workflows
  PERFORM set_config('row_security', 'off', true);

  -- Determine trigger type based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'jobs' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'job_created';
      ELSIF TG_OP = 'UPDATE' THEN
        -- Check specific field changes
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          v_trigger_type := 'job_status_changed';
        ELSIF OLD.schedule_start IS DISTINCT FROM NEW.schedule_start OR
              OLD.schedule_end IS DISTINCT FROM NEW.schedule_end THEN
          v_trigger_type := 'job_scheduled';
        ELSE
          v_trigger_type := 'job_updated';
        END IF;
      END IF;
    WHEN 'clients' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'client_created';
      ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.tags IS DISTINCT FROM NEW.tags THEN
          v_trigger_type := 'client_tags_changed';
        ELSE
          v_trigger_type := 'client_updated';
        END IF;
      END IF;
    WHEN 'estimates' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'estimate_sent';
      ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'accepted' THEN
          v_trigger_type := 'estimate_accepted';
        ELSIF NEW.status = 'declined' THEN
          v_trigger_type := 'estimate_declined';
        END IF;
      END IF;
    WHEN 'invoices' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'invoice_sent';
      ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
          v_trigger_type := 'invoice_paid';
        ELSIF OLD.due_date IS DISTINCT FROM NEW.due_date OR
              (NEW.due_date < CURRENT_DATE AND OLD.status = NEW.status AND NEW.status != 'paid') THEN
          v_trigger_type := 'invoice_overdue';
        END IF;
      END IF;
    WHEN 'sms_messages' THEN
      IF TG_OP = 'INSERT' AND NEW.direction = 'inbound' THEN
        v_trigger_type := 'sms_received';
      END IF;
    WHEN 'email_messages' THEN
      IF TG_OP = 'INSERT' AND NEW.direction = 'inbound' THEN
        v_trigger_type := 'email_received';
      END IF;
    ELSE
      RETURN NEW; -- Unknown table, skip
  END CASE;

  -- Skip if no trigger type determined
  IF v_trigger_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching workflows for this trigger type
  FOR workflow_record IN
    SELECT * FROM automation_workflows
    WHERE user_id = NEW.user_id
    AND trigger_type = v_trigger_type
    AND is_active = true
    AND status = 'active'
    AND steps IS NOT NULL
    AND jsonb_array_length(steps) > 0  -- Only workflows with actions
  LOOP
    should_trigger := TRUE;
    
    -- Check trigger conditions if they exist
    IF workflow_record.trigger_config->>'conditions' IS NOT NULL THEN
      should_trigger := check_trigger_conditions(
        workflow_record.trigger_config->'conditions',
        row_to_json(NEW)::jsonb,
        row_to_json(OLD)::jsonb
      );
    END IF;
    
    IF should_trigger THEN
      -- Create execution log
      INSERT INTO automation_execution_logs (
        workflow_id,
        trigger_type,
        trigger_data,
        status,
        created_at
      ) VALUES (
        workflow_record.id,
        v_trigger_type,
        jsonb_build_object(
          'trigger_type', v_trigger_type,
          'table_name', TG_TABLE_NAME,
          'operation', TG_OP,
          'record_id', NEW.id,
          'new_record', row_to_json(NEW),
          'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
          'user_id', NEW.user_id,
          'workflow_id', workflow_record.id
        ),
        'pending',
        NOW()
      ) RETURNING id INTO log_id;
      
      -- Update workflow execution count
      UPDATE automation_workflows
      SET 
        execution_count = COALESCE(execution_count, 0) + 1,
        last_triggered_at = NOW()
      WHERE id = workflow_record.id;
      
      RAISE NOTICE 'Created automation log % for workflow %', log_id, workflow_record.id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

-- Helper function to check trigger conditions
CREATE OR REPLACE FUNCTION check_trigger_conditions(
  conditions JSONB,
  new_record JSONB,
  old_record JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  condition JSONB;
  field_value TEXT;
  expected_value TEXT;
  operator TEXT;
BEGIN
  -- Check each condition
  FOR condition IN SELECT * FROM jsonb_array_elements(conditions)
  LOOP
    -- Get the field value from the record
    field_value := new_record->>(condition->>'field');
    expected_value := condition->>'value';
    operator := COALESCE(condition->>'operator', 'equals');
    
    -- Check based on operator
    CASE operator
      WHEN 'equals' THEN
        IF lower(field_value) != lower(expected_value) THEN
          RETURN FALSE;
        END IF;
      WHEN 'not_equals' THEN
        IF lower(field_value) = lower(expected_value) THEN
          RETURN FALSE;
        END IF;
      WHEN 'contains' THEN
        IF field_value NOT ILIKE '%' || expected_value || '%' THEN
          RETURN FALSE;
        END IF;
      WHEN 'greater_than' THEN
        IF field_value::numeric <= expected_value::numeric THEN
          RETURN FALSE;
        END IF;
      WHEN 'less_than' THEN
        IF field_value::numeric >= expected_value::numeric THEN
          RETURN FALSE;
        END IF;
      ELSE
        -- Default to equals
        IF lower(field_value) != lower(expected_value) THEN
          RETURN FALSE;
        END IF;
    END CASE;
  END LOOP;
  
  -- All conditions passed
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Apply the universal trigger to all relevant tables
DROP TRIGGER IF EXISTS automation_trigger_jobs ON jobs;
CREATE TRIGGER automation_trigger_jobs
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

DROP TRIGGER IF EXISTS automation_trigger_clients ON clients;
CREATE TRIGGER automation_trigger_clients
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

DROP TRIGGER IF EXISTS automation_trigger_estimates ON estimates;
CREATE TRIGGER automation_trigger_estimates
  AFTER INSERT OR UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

DROP TRIGGER IF EXISTS automation_trigger_invoices ON invoices;
CREATE TRIGGER automation_trigger_invoices
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

-- SMS and Email triggers - only create if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sms_messages' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS automation_trigger_sms ON sms_messages;
    CREATE TRIGGER automation_trigger_sms
      AFTER INSERT ON sms_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_universal_automation_triggers();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_messages' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS automation_trigger_email ON email_messages;
    CREATE TRIGGER automation_trigger_email
      AFTER INSERT ON email_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_universal_automation_triggers();
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_active 
ON automation_workflows(user_id, trigger_type, is_active, status) 
WHERE is_active = true AND status = 'active';
