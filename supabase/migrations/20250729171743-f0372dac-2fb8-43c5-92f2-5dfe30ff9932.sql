-- Add missing database triggers for all automation events
-- and fix JSON parsing issues

-- Client automation triggers
CREATE OR REPLACE FUNCTION handle_client_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  trigger_data JSONB;
BEGIN
  -- Get organization ID from user's profile
  SELECT organization_id INTO org_id
  FROM profiles 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id, NEW.created_by, OLD.created_by)
  LIMIT 1;
  
  IF org_id IS NULL THEN
    org_id := COALESCE(NEW.user_id, OLD.user_id, NEW.created_by, OLD.created_by);
  END IF;
  
  -- Client created trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'client_id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'phone', NEW.phone,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('client_created', trigger_data, org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for clients table
DROP TRIGGER IF EXISTS client_automation_trigger ON clients;
CREATE TRIGGER client_automation_trigger
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION handle_client_automation_triggers();

-- Estimate automation triggers
CREATE OR REPLACE FUNCTION handle_estimate_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  trigger_data JSONB;
BEGIN
  -- Get organization ID from user's profile
  SELECT organization_id INTO org_id
  FROM profiles 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;
  
  IF org_id IS NULL THEN
    org_id := COALESCE(NEW.user_id, OLD.user_id);
  END IF;
  
  -- Estimate created/sent trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'estimate_id', NEW.id,
      'estimate_number', NEW.estimate_number,
      'client_id', NEW.client_id,
      'total', NEW.total,
      'status', NEW.status,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('estimate_sent', trigger_data, org_id);
  END IF;
  
  -- Estimate status changed trigger
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    trigger_data := jsonb_build_object(
      'estimate_id', NEW.id,
      'estimate_number', NEW.estimate_number,
      'client_id', NEW.client_id,
      'total', NEW.total,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('estimate_status_changed', trigger_data, org_id);
    
    -- Specific status triggers
    IF NEW.status = 'accepted' THEN
      PERFORM execute_automation_for_record('estimate_accepted', trigger_data, org_id);
    ELSIF NEW.status = 'rejected' THEN
      PERFORM execute_automation_for_record('estimate_rejected', trigger_data, org_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for estimates table
DROP TRIGGER IF EXISTS estimate_automation_trigger ON estimates;
CREATE TRIGGER estimate_automation_trigger
  AFTER INSERT OR UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION handle_estimate_automation_triggers();

-- Invoice automation triggers
CREATE OR REPLACE FUNCTION handle_invoice_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  trigger_data JSONB;
BEGIN
  -- Get organization ID from user's profile
  SELECT organization_id INTO org_id
  FROM profiles 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;
  
  IF org_id IS NULL THEN
    org_id := COALESCE(NEW.user_id, OLD.user_id);
  END IF;
  
  -- Invoice created/sent trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'invoice_id', NEW.id,
      'invoice_number', NEW.invoice_number,
      'client_id', NEW.client_id,
      'total', NEW.total,
      'status', NEW.status,
      'due_date', NEW.due_date,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('invoice_sent', trigger_data, org_id);
  END IF;
  
  -- Payment received trigger (when status changes to paid)
  IF TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid' THEN
    trigger_data := jsonb_build_object(
      'invoice_id', NEW.id,
      'invoice_number', NEW.invoice_number,
      'client_id', NEW.client_id,
      'total', NEW.total,
      'status', NEW.status,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('payment_received', trigger_data, org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invoices table
DROP TRIGGER IF EXISTS invoice_automation_trigger ON invoices;
CREATE TRIGGER invoice_automation_trigger
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION handle_invoice_automation_triggers();

-- Ensure the job trigger exists
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION handle_job_automation_triggers();