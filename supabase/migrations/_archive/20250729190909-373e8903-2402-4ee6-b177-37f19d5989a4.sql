-- Create automation triggers for jobs table
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization_id
  org_id := NEW.organization_id;
  
  -- Job created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'job_created',
      jsonb_build_object(
        'job_id', NEW.id,
        'job_title', NEW.title,
        'client_id', NEW.client_id,
        'status', NEW.status,
        'technician_id', NEW.technician_id,
        'schedule_start', NEW.schedule_start,
        'schedule_end', NEW.schedule_end,
        'created_by', NEW.created_by
      ),
      org_id
    );
  END IF;
  
  -- Job status changed trigger
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    PERFORM execute_automation_for_record(
      'job_status_changed',
      jsonb_build_object(
        'job_id', NEW.id,
        'job_title', NEW.title,
        'client_id', NEW.client_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'technician_id', NEW.technician_id,
        'schedule_start', NEW.schedule_start,
        'schedule_end', NEW.schedule_end
      ),
      org_id
    );
    
    -- Job completed trigger
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      PERFORM execute_automation_for_record(
        'job_completed',
        jsonb_build_object(
          'job_id', NEW.id,
          'job_title', NEW.title,
          'client_id', NEW.client_id,
          'technician_id', NEW.technician_id,
          'completion_date', NOW(),
          'revenue', NEW.revenue
        ),
        org_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for jobs table
DROP TRIGGER IF EXISTS trigger_job_automation ON jobs;
CREATE TRIGGER trigger_job_automation
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Create automation triggers for invoices table
CREATE OR REPLACE FUNCTION handle_invoice_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization_id from job
  SELECT j.organization_id INTO org_id
  FROM jobs j
  WHERE j.id = NEW.job_id;
  
  -- Invoice created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'invoice_sent',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'invoice_number', NEW.invoice_number,
        'job_id', NEW.job_id,
        'client_id', NEW.client_id,
        'total', NEW.total,
        'status', NEW.status,
        'due_date', NEW.due_date
      ),
      org_id
    );
  END IF;
  
  -- Payment received trigger
  IF TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid' THEN
    PERFORM execute_automation_for_record(
      'payment_received',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'invoice_number', NEW.invoice_number,
        'job_id', NEW.job_id,
        'client_id', NEW.client_id,
        'total', NEW.total,
        'paid_date', NOW()
      ),
      org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invoices table
DROP TRIGGER IF EXISTS trigger_invoice_automation ON invoices;
CREATE TRIGGER trigger_invoice_automation
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_invoice_automation_triggers();

-- Create automation triggers for clients table
CREATE OR REPLACE FUNCTION handle_client_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization_id from user profile
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = NEW.created_by;
  
  -- Client created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'customer_created',
      jsonb_build_object(
        'client_id', NEW.id,
        'client_name', NEW.name,
        'client_email', NEW.email,
        'client_phone', NEW.phone,
        'created_by', NEW.created_by
      ),
      org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for clients table
DROP TRIGGER IF EXISTS trigger_client_automation ON clients;
CREATE TRIGGER trigger_client_automation
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_client_automation_triggers();