-- Fix automation triggers for multi-tenancy support
-- Match workflows by organization_id instead of user_id
-- This ensures workflows trigger for ANY user in the same organization

CREATE OR REPLACE FUNCTION handle_universal_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  log_id UUID;
  v_trigger_type TEXT;
  should_trigger BOOLEAN;
  v_organization_id UUID;
BEGIN
  -- Bypass RLS for this function to access automation_workflows
  PERFORM set_config('row_security', 'off', true);

  -- Get organization_id from the record
  v_organization_id := NEW.organization_id;

  -- If no organization_id, try to get it from user's default org
  IF v_organization_id IS NULL THEN
    SELECT organization_id INTO v_organization_id
    FROM user_organizations
    WHERE user_id = NEW.user_id
    AND is_default = true
    LIMIT 1;
  END IF;

  -- Skip if still no organization_id
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
    WHERE organization_id = v_organization_id  -- Changed from user_id to organization_id
    AND trigger_type = v_trigger_type
    AND is_active = true
    AND status = 'active'
    AND steps IS NOT NULL
    AND jsonb_array_length(steps) > 0
  LOOP
    should_trigger := TRUE;

    IF workflow_record.trigger_config->>'conditions' IS NOT NULL THEN
      should_trigger := check_trigger_conditions(
        workflow_record.trigger_config->'conditions',
        row_to_json(NEW)::jsonb,
        row_to_json(OLD)::jsonb
      );
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

      RAISE NOTICE 'Created automation log % for workflow % (org: %)', log_id, workflow_record.id, v_organization_id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;

-- Update index for organization-based queries
DROP INDEX IF EXISTS idx_automation_workflows_active;
CREATE INDEX idx_automation_workflows_active
ON automation_workflows(organization_id, trigger_type, is_active, status)
WHERE is_active = true AND status = 'active';

-- Add comment
COMMENT ON FUNCTION handle_universal_automation_triggers() IS
'Multi-tenant automation trigger - matches workflows by organization_id, not user_id';
