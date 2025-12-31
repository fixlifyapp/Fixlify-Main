-- Fix trigger function - use hstore for dynamic column access
-- This avoids errors when accessing non-existent columns

-- Enable hstore extension if not already enabled
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE OR REPLACE FUNCTION handle_universal_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
  v_trigger_type TEXT;
  should_trigger BOOLEAN;
  v_organization_id UUID;
  v_new_hstore hstore;
  v_user_id UUID;
BEGIN
  -- Bypass RLS for this function
  PERFORM set_config('row_security', 'off', true);

  -- Convert NEW to hstore for dynamic column access
  v_new_hstore := hstore(NEW);

  -- Get user_id from the record
  v_user_id := (v_new_hstore -> 'user_id')::UUID;

  -- Try to get organization_id from the record (may not exist)
  IF v_new_hstore ? 'organization_id' THEN
    v_organization_id := (v_new_hstore -> 'organization_id')::UUID;
  END IF;

  -- If no organization_id in record, look up from profiles
  IF v_organization_id IS NULL AND v_user_id IS NOT NULL THEN
    SELECT p.organization_id INTO v_organization_id
    FROM profiles p
    WHERE p.id = v_user_id
    LIMIT 1;
  END IF;

  -- Skip if no organization_id found
  IF v_organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine trigger type based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'jobs' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'job_created';
      ELSIF TG_OP = 'UPDATE' THEN
        IF (hstore(OLD) -> 'status') IS DISTINCT FROM (v_new_hstore -> 'status') THEN
          v_trigger_type := 'job_status_changed';
        ELSIF (hstore(OLD) -> 'schedule_start') IS DISTINCT FROM (v_new_hstore -> 'schedule_start') OR
              (hstore(OLD) -> 'schedule_end') IS DISTINCT FROM (v_new_hstore -> 'schedule_end') THEN
          v_trigger_type := 'job_scheduled';
        ELSE
          v_trigger_type := 'job_updated';
        END IF;
      END IF;
    WHEN 'clients' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'client_created';
      ELSIF TG_OP = 'UPDATE' THEN
        IF (hstore(OLD) -> 'tags') IS DISTINCT FROM (v_new_hstore -> 'tags') THEN
          v_trigger_type := 'client_tags_changed';
        ELSE
          v_trigger_type := 'client_updated';
        END IF;
      END IF;
    WHEN 'estimates' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'estimate_sent';
      ELSIF TG_OP = 'UPDATE' AND (hstore(OLD) -> 'status') IS DISTINCT FROM (v_new_hstore -> 'status') THEN
        IF (v_new_hstore -> 'status') = 'accepted' THEN
          v_trigger_type := 'estimate_accepted';
        ELSIF (v_new_hstore -> 'status') = 'declined' THEN
          v_trigger_type := 'estimate_declined';
        END IF;
      END IF;
    WHEN 'invoices' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'invoice_sent';
      ELSIF TG_OP = 'UPDATE' THEN
        IF (hstore(OLD) -> 'status') IS DISTINCT FROM (v_new_hstore -> 'status') AND (v_new_hstore -> 'status') = 'paid' THEN
          v_trigger_type := 'invoice_paid';
        ELSIF (hstore(OLD) -> 'due_date') IS DISTINCT FROM (v_new_hstore -> 'due_date') OR
              ((v_new_hstore -> 'due_date')::date < CURRENT_DATE AND
               (hstore(OLD) -> 'status') = (v_new_hstore -> 'status') AND
               (v_new_hstore -> 'status') != 'paid') THEN
          v_trigger_type := 'invoice_overdue';
        END IF;
      END IF;
    WHEN 'sms_messages' THEN
      IF TG_OP = 'INSERT' AND (v_new_hstore -> 'direction') = 'inbound' THEN
        v_trigger_type := 'sms_received';
      END IF;
    WHEN 'email_messages' THEN
      IF TG_OP = 'INSERT' AND (v_new_hstore -> 'direction') = 'inbound' THEN
        v_trigger_type := 'email_received';
      END IF;
    ELSE
      RETURN NEW;
  END CASE;

  IF v_trigger_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching workflows by ORGANIZATION_ID
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
          CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END
        );
      EXCEPTION WHEN OTHERS THEN
        should_trigger := TRUE;
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
          'record_id', (v_new_hstore -> 'id')::uuid,
          'new_record', row_to_json(NEW),
          'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
          'user_id', v_user_id,
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

      RAISE NOTICE 'Automation log % for workflow % (org: %, table: %, trigger: %)',
        log_id, workflow_record.id, v_organization_id, TG_TABLE_NAME, v_trigger_type;
    END IF;
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Automation trigger error: % (table: %, op: %)', SQLERRM, TG_TABLE_NAME, TG_OP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

COMMENT ON FUNCTION handle_universal_automation_triggers() IS
'Multi-tenant automation trigger v4 - uses hstore for dynamic column access to handle tables with/without organization_id';
