-- Create database triggers for automation execution

-- Function to execute automation for record changes
CREATE OR REPLACE FUNCTION execute_automation_for_record(
  trigger_type TEXT,
  trigger_data JSONB,
  org_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Find and execute matching automation workflows
  INSERT INTO automation_execution_logs (
    workflow_id,
    trigger_type,
    trigger_data,
    status,
    organization_id,
    started_at
  )
  SELECT 
    aw.id,
    trigger_type,
    trigger_data,
    'pending',
    org_id,
    NOW()
  FROM automation_workflows aw
  WHERE aw.trigger_type = execute_automation_for_record.trigger_type
    AND aw.status = 'active'
    AND aw.organization_id = org_id;
    
  -- Log the trigger event
  RAISE NOTICE 'Automation trigger: % for org: %', trigger_type, org_id;
END;
$$;

-- Trigger for job events
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Job created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'job_created',
      jsonb_build_object(
        'job_id', NEW.id,
        'job_number', NEW.job_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
        'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
        'job_description', NEW.description,
        'job_status', NEW.status,
        'created_at', NEW.created_at
      ),
      NEW.organization_id
    );
  END IF;
  
  -- Job status changed trigger
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM execute_automation_for_record(
      'job_status_changed',
      jsonb_build_object(
        'job_id', NEW.id,
        'job_number', NEW.job_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
        'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
        'old_status', OLD.status,
        'new_status', NEW.status,
        'updated_at', NEW.updated_at
      ),
      NEW.organization_id
    );
    
    -- Job completed trigger
    IF NEW.status = 'completed' THEN
      PERFORM execute_automation_for_record(
        'job_completed',
        jsonb_build_object(
          'job_id', NEW.id,
          'job_number', NEW.job_number,
          'client_id', NEW.client_id,
          'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
          'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
          'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
          'completed_at', NEW.updated_at,
          'revenue', NEW.revenue
        ),
        NEW.organization_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for jobs table
DROP TRIGGER IF EXISTS automation_job_triggers ON jobs;
CREATE TRIGGER automation_job_triggers
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Trigger for invoice events
CREATE OR REPLACE FUNCTION handle_invoice_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Invoice created/sent trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'invoice_sent',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'invoice_number', NEW.invoice_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
        'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
        'total', NEW.total,
        'due_date', NEW.due_date,
        'created_at', NEW.created_at
      ),
      NEW.organization_id
    );
  END IF;
  
  -- Payment received trigger
  IF TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid' THEN
    PERFORM execute_automation_for_record(
      'payment_received',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'invoice_number', NEW.invoice_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
        'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
        'total', NEW.total,
        'paid_at', NEW.updated_at
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for invoices table
DROP TRIGGER IF EXISTS automation_invoice_triggers ON invoices;
CREATE TRIGGER automation_invoice_triggers
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_invoice_automation_triggers();

-- Trigger for client events
CREATE OR REPLACE FUNCTION handle_client_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Client created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'client_created',
      jsonb_build_object(
        'client_id', NEW.id,
        'client_name', NEW.name,
        'client_email', NEW.email,
        'client_phone', NEW.phone,
        'client_address', NEW.address,
        'created_at', NEW.created_at
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for clients table
DROP TRIGGER IF EXISTS automation_client_triggers ON clients;
CREATE TRIGGER automation_client_triggers
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_client_automation_triggers();

-- Create function to process pending automation executions
CREATE OR REPLACE FUNCTION process_pending_automations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pending_execution RECORD;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get Supabase configuration
  supabase_url := current_setting('app.supabase_url', true);
  service_key := current_setting('app.supabase_service_key', true);
  
  -- Process pending automation executions
  FOR pending_execution IN 
    SELECT * FROM automation_execution_logs 
    WHERE status = 'pending' 
    AND created_at > NOW() - INTERVAL '1 hour'
    LIMIT 10
  LOOP
    BEGIN
      -- Call the automation executor edge function
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/automation-executor',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
          'action', 'execute',
          'workflowId', pending_execution.workflow_id,
          'triggerData', pending_execution.trigger_data
        )
      );
      
      -- Mark as processing
      UPDATE automation_execution_logs 
      SET status = 'processing', started_at = NOW()
      WHERE id = pending_execution.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Mark as failed if there's an error
      UPDATE automation_execution_logs 
      SET status = 'failed', error_message = SQLERRM
      WHERE id = pending_execution.id;
    END;
  END LOOP;
END;
$$;

-- Create a scheduled job to process automations every minute (requires pg_cron extension)
-- Note: This would typically be enabled in production
-- SELECT cron.schedule('process-automations', '* * * * *', 'SELECT process_pending_automations();');