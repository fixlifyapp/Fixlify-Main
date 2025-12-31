-- Fix trigger function - user_organizations table doesn't exist!
-- Use profiles.organization_id for fallback instead

CREATE OR REPLACE FUNCTION handle_universal_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
  v_trigger_type TEXT;
  should_trigger BOOLEAN;
  v_organization_id UUID;
  v_has_org_column BOOLEAN;
BEGIN
  -- Bypass RLS for this function to access automation_workflows
  PERFORM set_config('row_security', 'off', true);

  -- Determine if this table has organization_id column
  -- jobs has it, clients/estimates/invoices don't
  v_has_org_column := TG_TABLE_NAME IN ('jobs', 'sms_messages', 'email_messages');

  -- Get organization_id based on table structure
  IF v_has_org_column AND NEW.organization_id IS NOT NULL THEN
    v_organization_id := NEW.organization_id;
  END IF;

  -- If no organization_id, look up from profiles table
  IF v_organization_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT p.organization_id INTO v_organization_id
    FROM profiles p
    WHERE p.id = NEW.user_id
    LIMIT 1;
  END IF;

  -- Skip if still no organization_id
  IF v_organization_id IS NULL THEN
    RAISE NOTICE 'No organization_id found for table %, user_id %, skipping', TG_TABLE_NAME, NEW.user_id;
    RETURN NEW;
  END IF;

  -- Determine trigger type based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'jobs' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'job_created';
      ELSIF TG_OP = 'UPDATE' THEN
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
      RETURN NEW;
  END CASE;

  IF v_trigger_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching workflows by ORGANIZATION_ID (multi-tenancy)
  FOR workflow_record IN
    SELECT * FROM automation_workflows
    WHERE organization_id = v_organization_id
    AND trigger_type = v_trigger_type
    AND is_active = true
    AND status = 'active'
    AND steps IS NOT NULL
    AND jsonb_array_length(steps) > 0
  LOOP
    should_trigger := TRUE;

    IF workflow_record.trigger_config->>'conditions' IS NOT NULL THEN
      BEGIN
        should_trigger := check_trigger_conditions(
          workflow_record.trigger_config->'conditions',
          row_to_json(NEW)::jsonb,
          row_to_json(OLD)::jsonb
        );
      EXCEPTION WHEN OTHERS THEN
        should_trigger := TRUE; -- Default to trigger if condition check fails
      END;
    END IF;

    IF should_trigger THEN
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
          'organization_id', v_organization_id,
          'workflow_id', workflow_record.id
        ),
        'pending',
        NOW()
      ) RETURNING id INTO log_id;

      UPDATE automation_workflows
      SET
        execution_count = COALESCE(execution_count, 0) + 1,
        last_triggered_at = NOW()
      WHERE id = workflow_record.id;

      RAISE NOTICE 'Automation log % created for workflow % (org: %, table: %, trigger: %)',
        log_id, workflow_record.id, v_organization_id, TG_TABLE_NAME, v_trigger_type;
    END IF;
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Automation trigger error: % (table: %, op: %)', SQLERRM, TG_TABLE_NAME, TG_OP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

-- Add comment
COMMENT ON FUNCTION handle_universal_automation_triggers() IS
'Multi-tenant automation trigger v3 - uses profiles.organization_id for fallback, handles errors gracefully';
