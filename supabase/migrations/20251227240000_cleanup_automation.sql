-- Cleanup migration: Remove debug code and finalize automation triggers

-- Step 1: Drop debug table
DROP TABLE IF EXISTS automation_trigger_debug;

-- Step 2: Clean version of the universal automation trigger function (no debug logging)
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
  -- Bypass RLS for this function
  PERFORM set_config('row_security', 'off', true);

  -- Convert NEW to JSON for dynamic column access
  v_record_json := row_to_json(NEW)::jsonb;

  -- Get user_id from record (works for all tables)
  IF v_record_json->>'user_id' IS NOT NULL THEN
    v_user_id := (v_record_json->>'user_id')::UUID;
  END IF;

  -- Get organization_id:
  -- 1. First try from record (jobs, sms_messages have it)
  -- 2. Then lookup from profiles table
  IF v_record_json->>'organization_id' IS NOT NULL THEN
    v_organization_id := (v_record_json->>'organization_id')::UUID;
  ELSIF v_user_id IS NOT NULL THEN
    SELECT p.organization_id INTO v_organization_id
    FROM profiles p
    WHERE p.id = v_user_id;
  END IF;

  -- Skip if no organization found
  IF v_organization_id IS NULL THEN
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

  -- Find matching workflows for this organization
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

    -- Check trigger conditions if any
    IF workflow_record.trigger_config->>'conditions' IS NOT NULL THEN
      should_trigger := check_trigger_conditions(
        workflow_record.trigger_config->'conditions',
        v_record_json,
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END
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
          'new_record', v_record_json,
          'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
          'user_id', v_user_id,
          'organization_id', v_organization_id,
          'workflow_id', workflow_record.id
        ),
        'pending',
        NOW()
      ) RETURNING id INTO log_id;

      -- Update workflow stats
      UPDATE automation_workflows
      SET
        execution_count = COALESCE(execution_count, 0) + 1,
        last_triggered_at = NOW()
      WHERE id = workflow_record.id;
    END IF;
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Automation trigger error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

-- Step 3: Ensure check_trigger_conditions function exists
CREATE OR REPLACE FUNCTION check_trigger_conditions(
  conditions JSONB,
  new_record JSONB,
  old_record JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- Placeholder - always return true for now
  -- TODO: Implement actual condition checking logic
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 4: Drop obsolete functions
DROP FUNCTION IF EXISTS ensure_user_id() CASCADE;
DROP FUNCTION IF EXISTS handle_client_automation_triggers() CASCADE;
DROP FUNCTION IF EXISTS handle_client_tag_automation_triggers() CASCADE;

-- Step 5: Clean up exec_query function (keep for debugging but limit access)
-- Already exists, just ensure proper grants
REVOKE ALL ON FUNCTION exec_query(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_query(TEXT) TO service_role;

-- Step 6: Add comment
COMMENT ON FUNCTION handle_universal_automation_triggers() IS
'Universal automation trigger for multi-tenant workflow system.
Handles tables with and without organization_id column by falling back to profiles lookup.
Supports: jobs, clients, estimates, invoices, sms_messages, email_messages';
