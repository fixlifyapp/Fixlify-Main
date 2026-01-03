-- Fix RLS bypass for automation trigger function
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

  -- Log for debugging
  RAISE NOTICE 'Automation trigger: table=%, op=%, trigger_type=%, user_id=%',
    TG_TABLE_NAME, TG_OP, v_trigger_type, NEW.user_id;

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
    RAISE NOTICE 'Found matching workflow: %', workflow_record.id;
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
