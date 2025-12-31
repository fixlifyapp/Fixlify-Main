-- More detailed debug trigger to trace the lookup issue

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
  v_user_id_text TEXT;
  v_profile_count INT;
BEGIN
  -- Write debug entry at start
  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'Trigger started v2');

  PERFORM set_config('row_security', 'off', true);

  -- Convert to JSON
  v_record_json := row_to_json(NEW)::jsonb;

  -- Get user_id as TEXT first
  v_user_id_text := v_record_json->>'user_id';

  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'user_id text: ' || COALESCE(v_user_id_text, 'NULL'));

  -- Cast to UUID
  IF v_user_id_text IS NOT NULL THEN
    BEGIN
      v_user_id := v_user_id_text::UUID;
      INSERT INTO automation_trigger_debug (table_name, operation, user_id, message)
      VALUES (TG_TABLE_NAME, TG_OP, v_user_id, 'user_id UUID: ' || v_user_id::text);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO automation_trigger_debug (table_name, operation, message)
      VALUES (TG_TABLE_NAME, TG_OP, 'ERROR casting user_id: ' || SQLERRM);
    END;
  END IF;

  -- Check how many profiles exist
  SELECT COUNT(*) INTO v_profile_count FROM profiles;
  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'Total profiles in table: ' || v_profile_count);

  -- Try to find the specific profile
  IF v_user_id IS NOT NULL THEN
    -- Direct query
    SELECT p.organization_id INTO v_organization_id
    FROM profiles p
    WHERE p.id = v_user_id;

    IF v_organization_id IS NOT NULL THEN
      INSERT INTO automation_trigger_debug (table_name, operation, org_id, message)
      VALUES (TG_TABLE_NAME, TG_OP, v_organization_id, 'Found org_id from profiles');
    ELSE
      -- Check if profile exists at all
      PERFORM 1 FROM profiles WHERE id = v_user_id;
      IF FOUND THEN
        INSERT INTO automation_trigger_debug (table_name, operation, message)
        VALUES (TG_TABLE_NAME, TG_OP, 'Profile exists but org_id is NULL');
      ELSE
        INSERT INTO automation_trigger_debug (table_name, operation, message)
        VALUES (TG_TABLE_NAME, TG_OP, 'Profile NOT found for user_id');
      END IF;
    END IF;
  END IF;

  -- Skip if no org
  IF v_organization_id IS NULL THEN
    INSERT INTO automation_trigger_debug (table_name, operation, message)
    VALUES (TG_TABLE_NAME, TG_OP, 'SKIPPING: No org_id found');
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
      RETURN NEW;
  END CASE;

  INSERT INTO automation_trigger_debug (table_name, operation, trigger_type, message)
  VALUES (TG_TABLE_NAME, TG_OP, v_trigger_type, 'Trigger type: ' || v_trigger_type);

  IF v_trigger_type IS NULL THEN
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
    INSERT INTO automation_trigger_debug (table_name, operation, message)
    VALUES (TG_TABLE_NAME, TG_OP, 'Found workflow: ' || workflow_record.id);

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

    INSERT INTO automation_trigger_debug (table_name, operation, message)
    VALUES (TG_TABLE_NAME, TG_OP, 'Created log: ' || log_id);

    UPDATE automation_workflows
    SET execution_count = COALESCE(execution_count, 0) + 1,
        last_triggered_at = NOW()
    WHERE id = workflow_record.id;
  END LOOP;

  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'Trigger completed');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO automation_trigger_debug (table_name, operation, message)
  VALUES (TG_TABLE_NAME, TG_OP, 'EXCEPTION: ' || SQLERRM);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off;
