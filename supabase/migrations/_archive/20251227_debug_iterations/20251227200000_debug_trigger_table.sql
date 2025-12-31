-- Create debug table to trace trigger execution
CREATE TABLE IF NOT EXISTS automation_trigger_debug (
  id SERIAL PRIMARY KEY,
  table_name TEXT,
  operation TEXT,
  user_id UUID,
  org_id UUID,
  trigger_type TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant access
ALTER TABLE automation_trigger_debug ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for debug" ON automation_trigger_debug FOR ALL USING (true) WITH CHECK (true);

-- Update trigger function to write debug info
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
  -- Write debug entry at start
  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'Trigger started');

  -- Bypass RLS
  PERFORM set_config('row_security', 'off', true);

  -- Convert to JSON
  v_record_json := row_to_json(NEW)::jsonb;

  -- Get user_id
  v_user_id := (v_record_json->>'user_id')::UUID;

  INSERT INTO automation_trigger_debug (table_name, operation, user_id, message)
  VALUES (TG_TABLE_NAME, TG_OP, v_user_id, 'User ID extracted');

  -- Get org_id from record if exists
  IF v_record_json ? 'organization_id' AND v_record_json->>'organization_id' IS NOT NULL THEN
    v_organization_id := (v_record_json->>'organization_id')::UUID;
    INSERT INTO automation_trigger_debug (table_name, operation, org_id, message)
    VALUES (TG_TABLE_NAME, TG_OP, v_organization_id, 'Org ID from record');
  END IF;

  -- Fallback to profiles
  IF v_organization_id IS NULL AND v_user_id IS NOT NULL THEN
    SELECT p.organization_id INTO v_organization_id
    FROM profiles p
    WHERE p.id = v_user_id
    LIMIT 1;

    INSERT INTO automation_trigger_debug (table_name, operation, org_id, message)
    VALUES (TG_TABLE_NAME, TG_OP, v_organization_id, 'Org ID from profiles lookup');
  END IF;

  -- Skip if no org
  IF v_organization_id IS NULL THEN
    INSERT INTO automation_trigger_debug (table_name, operation, message)
    VALUES (TG_TABLE_NAME, TG_OP, 'No org_id found - skipping');
    RETURN NEW;
  END IF;

  -- Determine trigger type
  CASE TG_TABLE_NAME
    WHEN 'jobs' THEN
      IF TG_OP = 'INSERT' THEN v_trigger_type := 'job_created';
      ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN v_trigger_type := 'job_status_changed';
        ELSE v_trigger_type := 'job_updated'; END IF;
      END IF;
    WHEN 'clients' THEN
      IF TG_OP = 'INSERT' THEN v_trigger_type := 'client_created';
      ELSIF TG_OP = 'UPDATE' THEN v_trigger_type := 'client_updated'; END IF;
    WHEN 'estimates' THEN
      IF TG_OP = 'INSERT' THEN v_trigger_type := 'estimate_sent'; END IF;
    WHEN 'invoices' THEN
      IF TG_OP = 'INSERT' THEN v_trigger_type := 'invoice_sent'; END IF;
    ELSE
      INSERT INTO automation_trigger_debug (table_name, operation, message)
      VALUES (TG_TABLE_NAME, TG_OP, 'Unknown table - skipping');
      RETURN NEW;
  END CASE;

  INSERT INTO automation_trigger_debug (table_name, operation, trigger_type, message)
  VALUES (TG_TABLE_NAME, TG_OP, v_trigger_type, 'Trigger type determined');

  IF v_trigger_type IS NULL THEN
    INSERT INTO automation_trigger_debug (table_name, operation, message)
    VALUES (TG_TABLE_NAME, TG_OP, 'No trigger type - skipping');
    RETURN NEW;
  END IF;

  -- Find workflows
  FOR workflow_record IN
    SELECT * FROM automation_workflows
    WHERE organization_id = v_organization_id
    AND trigger_type = v_trigger_type
    AND is_active = true
    AND status = 'active'
    AND steps IS NOT NULL
    AND jsonb_array_length(steps) > 0
  LOOP
    INSERT INTO automation_trigger_debug (table_name, operation, trigger_type, message)
    VALUES (TG_TABLE_NAME, TG_OP, v_trigger_type, 'Found workflow: ' || workflow_record.id::text);

    should_trigger := TRUE;

    IF should_trigger THEN
      INSERT INTO automation_execution_logs (
        workflow_id, trigger_type, trigger_data, status, created_at
      ) VALUES (
        workflow_record.id,
        v_trigger_type,
        jsonb_build_object(
          'trigger_type', v_trigger_type,
          'table_name', TG_TABLE_NAME,
          'operation', TG_OP,
          'record_id', NEW.id,
          'new_record', v_record_json,
          'user_id', v_user_id,
          'organization_id', v_organization_id,
          'workflow_id', workflow_record.id
        ),
        'pending',
        NOW()
      ) RETURNING id INTO log_id;

      INSERT INTO automation_trigger_debug (table_name, operation, trigger_type, message)
      VALUES (TG_TABLE_NAME, TG_OP, v_trigger_type, 'Created log: ' || log_id::text);

      UPDATE automation_workflows
      SET execution_count = COALESCE(execution_count, 0) + 1,
          last_triggered_at = NOW()
      WHERE id = workflow_record.id;
    END IF;
  END LOOP;

  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'Trigger completed successfully');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'ERROR: ' || SQLERRM);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;
