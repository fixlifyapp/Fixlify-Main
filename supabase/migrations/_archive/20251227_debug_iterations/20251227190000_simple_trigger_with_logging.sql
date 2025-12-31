-- Simplified trigger function with explicit logging
-- Uses JSON instead of hstore for better compatibility

CREATE OR REPLACE FUNCTION handle_universal_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
  v_trigger_type TEXT;
  should_trigger BOOLEAN;
  v_organization_id UUID;
  v_user_id UUID;
  v_record_json JSONB;
BEGIN
  -- Log entry for debugging
  RAISE LOG 'Automation trigger fired: table=%, op=%', TG_TABLE_NAME, TG_OP;

  -- Bypass RLS
  PERFORM set_config('row_security', 'off', true);

  -- Convert NEW to JSON for safe column access
  v_record_json := row_to_json(NEW)::jsonb;

  -- Get user_id
  v_user_id := (v_record_json->>'user_id')::UUID;

  -- Get organization_id if it exists in the record
  IF v_record_json ? 'organization_id' AND v_record_json->>'organization_id' IS NOT NULL THEN
    v_organization_id := (v_record_json->>'organization_id')::UUID;
    RAISE LOG 'Found organization_id in record: %', v_organization_id;
  END IF;

  -- Fallback to profiles lookup
  IF v_organization_id IS NULL AND v_user_id IS NOT NULL THEN
    SELECT p.organization_id INTO v_organization_id
    FROM profiles p
    WHERE p.id = v_user_id
    LIMIT 1;
    RAISE LOG 'Looked up organization_id from profiles: %', v_organization_id;
  END IF;

  -- Skip if no org found
  IF v_organization_id IS NULL THEN
    RAISE LOG 'No organization_id found, skipping trigger';
    RETURN NEW;
  END IF;

  -- Determine trigger type
  CASE TG_TABLE_NAME
    WHEN 'jobs' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'job_created';
      ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          v_trigger_type := 'job_status_changed';
        ELSE
          v_trigger_type := 'job_updated';
        END IF;
      END IF;
    WHEN 'clients' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'client_created';
      ELSIF TG_OP = 'UPDATE' THEN
        v_trigger_type := 'client_updated';
      END IF;
    WHEN 'estimates' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'estimate_sent';
      ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          IF NEW.status = 'accepted' THEN
            v_trigger_type := 'estimate_accepted';
          ELSIF NEW.status = 'declined' THEN
            v_trigger_type := 'estimate_declined';
          END IF;
        END IF;
      END IF;
    WHEN 'invoices' THEN
      IF TG_OP = 'INSERT' THEN
        v_trigger_type := 'invoice_sent';
      ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
        v_trigger_type := 'invoice_paid';
      END IF;
    ELSE
      RETURN NEW;
  END CASE;

  RAISE LOG 'Trigger type determined: %', v_trigger_type;

  IF v_trigger_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching workflows
  FOR workflow_record IN
    SELECT * FROM automation_workflows
    WHERE organization_id = v_organization_id
    AND trigger_type = v_trigger_type
    AND is_active = true
    AND status = 'active'
    AND steps IS NOT NULL
    AND jsonb_array_length(steps) > 0
  LOOP
    RAISE LOG 'Found matching workflow: %', workflow_record.id;
    should_trigger := TRUE;

    -- Check conditions if present
    IF workflow_record.trigger_config IS NOT NULL AND
       workflow_record.trigger_config ? 'conditions' AND
       jsonb_array_length(workflow_record.trigger_config->'conditions') > 0 THEN
      BEGIN
        should_trigger := check_trigger_conditions(
          workflow_record.trigger_config->'conditions',
          v_record_json,
          CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Condition check failed, defaulting to true: %', SQLERRM;
        should_trigger := TRUE;
      END;
    END IF;

    IF should_trigger THEN
      RAISE LOG 'Creating execution log for workflow %', workflow_record.id;

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
          'new_record', v_record_json,
          'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
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

      RAISE LOG 'Created execution log: %', log_id;
    END IF;
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Automation trigger error on %: %', TG_TABLE_NAME, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

COMMENT ON FUNCTION handle_universal_automation_triggers() IS
'Multi-tenant automation trigger v5 - uses JSON for safe column access, logs all operations';

-- Recreate triggers to ensure they use the updated function
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

-- Also recreate jobs trigger to ensure consistency
DROP TRIGGER IF EXISTS automation_trigger_jobs ON jobs;
CREATE TRIGGER automation_trigger_jobs
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();
