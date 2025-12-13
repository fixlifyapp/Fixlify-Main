-- Add automation triggers for tags, job types, tasks, and other entities

-- Tags automation triggers
CREATE OR REPLACE FUNCTION handle_tag_automation_triggers()
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
  
  -- Tag created trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'tag_id', NEW.id,
      'tag_name', NEW.name,
      'category', NEW.category,
      'color', NEW.color,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('tag_created', trigger_data, org_id);
  END IF;
  
  -- Tag updated trigger
  IF TG_OP = 'UPDATE' THEN
    trigger_data := jsonb_build_object(
      'tag_id', NEW.id,
      'tag_name', NEW.name,
      'old_name', OLD.name,
      'category', NEW.category,
      'old_category', OLD.category,
      'color', NEW.color,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('tag_updated', trigger_data, org_id);
  END IF;
  
  -- Tag deleted trigger
  IF TG_OP = 'DELETE' THEN
    trigger_data := jsonb_build_object(
      'tag_id', OLD.id,
      'tag_name', OLD.name,
      'category', OLD.category,
      'user_id', OLD.user_id
    );
    
    PERFORM execute_automation_for_record('tag_deleted', trigger_data, org_id);
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tags table
DROP TRIGGER IF EXISTS tag_automation_trigger ON tags;
CREATE TRIGGER tag_automation_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tags
  FOR EACH ROW EXECUTE FUNCTION handle_tag_automation_triggers();

-- Job types automation triggers
CREATE OR REPLACE FUNCTION handle_job_type_automation_triggers()
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
  
  -- Job type created trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'job_type_id', NEW.id,
      'job_type_name', NEW.name,
      'description', NEW.description,
      'color', NEW.color,
      'is_default', NEW.is_default,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('job_type_created', trigger_data, org_id);
  END IF;
  
  -- Job type updated trigger
  IF TG_OP = 'UPDATE' THEN
    trigger_data := jsonb_build_object(
      'job_type_id', NEW.id,
      'job_type_name', NEW.name,
      'old_name', OLD.name,
      'description', NEW.description,
      'color', NEW.color,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('job_type_updated', trigger_data, org_id);
  END IF;
  
  -- Job type deleted trigger
  IF TG_OP = 'DELETE' THEN
    trigger_data := jsonb_build_object(
      'job_type_id', OLD.id,
      'job_type_name', OLD.name,
      'description', OLD.description,
      'user_id', OLD.user_id
    );
    
    PERFORM execute_automation_for_record('job_type_deleted', trigger_data, org_id);
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job_types table
DROP TRIGGER IF EXISTS job_type_automation_trigger ON job_types;
CREATE TRIGGER job_type_automation_trigger
  AFTER INSERT OR UPDATE OR DELETE ON job_types
  FOR EACH ROW EXECUTE FUNCTION handle_job_type_automation_triggers();

-- Tasks automation triggers (enhanced)
CREATE OR REPLACE FUNCTION handle_task_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  trigger_data JSONB;
BEGIN
  -- Get organization ID from user's profile or task record
  IF NEW IS NOT NULL THEN
    org_id := NEW.organization_id;
  ELSE
    org_id := OLD.organization_id;
  END IF;
  
  -- Task created trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'task_id', NEW.id,
      'task_description', NEW.description,
      'job_id', NEW.job_id,
      'client_id', NEW.client_id,
      'assigned_to', NEW.assigned_to,
      'due_date', NEW.due_date,
      'priority', NEW.priority,
      'status', NEW.status,
      'created_by', NEW.created_by
    );
    
    PERFORM execute_automation_for_record('task_created', trigger_data, org_id);
  END IF;
  
  -- Task status changed trigger
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    trigger_data := jsonb_build_object(
      'task_id', NEW.id,
      'task_description', NEW.description,
      'job_id', NEW.job_id,
      'client_id', NEW.client_id,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'assigned_to', NEW.assigned_to,
      'priority', NEW.priority
    );
    
    PERFORM execute_automation_for_record('task_status_changed', trigger_data, org_id);
    
    -- Task completed trigger
    IF NEW.status = 'completed' THEN
      trigger_data := jsonb_build_object(
        'task_id', NEW.id,
        'task_description', NEW.description,
        'job_id', NEW.job_id,
        'client_id', NEW.client_id,
        'completed_by', NEW.completed_by,
        'completed_at', NEW.completed_at,
        'priority', NEW.priority
      );
      
      PERFORM execute_automation_for_record('task_completed', trigger_data, org_id);
    END IF;
  END IF;
  
  -- Task assignment changed trigger
  IF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    trigger_data := jsonb_build_object(
      'task_id', NEW.id,
      'task_description', NEW.description,
      'job_id', NEW.job_id,
      'client_id', NEW.client_id,
      'old_assigned_to', OLD.assigned_to,
      'new_assigned_to', NEW.assigned_to,
      'priority', NEW.priority
    );
    
    PERFORM execute_automation_for_record('task_assigned', trigger_data, org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tasks table
DROP TRIGGER IF EXISTS task_automation_trigger ON tasks;
CREATE TRIGGER task_automation_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_task_automation_triggers();

-- Products automation triggers
CREATE OR REPLACE FUNCTION handle_product_automation_triggers()
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
  
  -- Product created trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'product_id', NEW.id,
      'product_name', NEW.name,
      'description', NEW.description,
      'category', NEW.category,
      'price', NEW.price,
      'cost', NEW.cost,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('product_created', trigger_data, org_id);
  END IF;
  
  -- Product updated trigger
  IF TG_OP = 'UPDATE' THEN
    trigger_data := jsonb_build_object(
      'product_id', NEW.id,
      'product_name', NEW.name,
      'old_name', OLD.name,
      'price', NEW.price,
      'old_price', OLD.price,
      'category', NEW.category,
      'user_id', NEW.user_id
    );
    
    PERFORM execute_automation_for_record('product_updated', trigger_data, org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for products table
DROP TRIGGER IF EXISTS product_automation_trigger ON products;
CREATE TRIGGER product_automation_trigger
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION handle_product_automation_triggers();

-- Payments automation triggers
CREATE OR REPLACE FUNCTION handle_payment_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  trigger_data JSONB;
BEGIN
  -- Get organization ID from user's profile
  SELECT organization_id INTO org_id
  FROM profiles 
  WHERE id = COALESCE(NEW.processed_by, OLD.processed_by, NEW.created_by, OLD.created_by)
  LIMIT 1;
  
  IF org_id IS NULL THEN
    org_id := COALESCE(NEW.processed_by, OLD.processed_by, NEW.created_by, OLD.created_by);
  END IF;
  
  -- Payment created trigger
  IF TG_OP = 'INSERT' THEN
    trigger_data := jsonb_build_object(
      'payment_id', NEW.id,
      'invoice_id', NEW.invoice_id,
      'amount', NEW.amount,
      'payment_method', NEW.payment_method,
      'status', NEW.status,
      'processed_by', NEW.processed_by
    );
    
    PERFORM execute_automation_for_record('payment_created', trigger_data, org_id);
  END IF;
  
  -- Payment status changed trigger
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    trigger_data := jsonb_build_object(
      'payment_id', NEW.id,
      'invoice_id', NEW.invoice_id,
      'amount', NEW.amount,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'payment_method', NEW.payment_method
    );
    
    PERFORM execute_automation_for_record('payment_status_changed', trigger_data, org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payments table
DROP TRIGGER IF EXISTS payment_automation_trigger ON payments;
CREATE TRIGGER payment_automation_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION handle_payment_automation_triggers();