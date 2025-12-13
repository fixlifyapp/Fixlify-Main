-- Add comprehensive automation triggers for estimates, tags, job statuses, and lead sources

-- Trigger for estimate events
CREATE OR REPLACE FUNCTION handle_estimate_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Estimate created/sent trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'estimate_sent',
      jsonb_build_object(
        'estimate_id', NEW.id,
        'estimate_number', NEW.estimate_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
        'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
        'job_id', NEW.job_id,
        'total', NEW.total,
        'valid_until', NEW.valid_until,
        'created_at', NEW.created_at
      ),
      NEW.organization_id
    );
  END IF;
  
  -- Estimate status changed trigger
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM execute_automation_for_record(
      'estimate_status_changed',
      jsonb_build_object(
        'estimate_id', NEW.id,
        'estimate_number', NEW.estimate_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
        'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
        'job_id', NEW.job_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'total', NEW.total,
        'updated_at', NEW.updated_at
      ),
      NEW.organization_id
    );
    
    -- Estimate accepted trigger
    IF NEW.status = 'accepted' THEN
      PERFORM execute_automation_for_record(
        'estimate_accepted',
        jsonb_build_object(
          'estimate_id', NEW.id,
          'estimate_number', NEW.estimate_number,
          'client_id', NEW.client_id,
          'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
          'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
          'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
          'job_id', NEW.job_id,
          'total', NEW.total,
          'accepted_at', NEW.updated_at
        ),
        NEW.organization_id
      );
    END IF;
    
    -- Estimate rejected trigger
    IF NEW.status = 'rejected' THEN
      PERFORM execute_automation_for_record(
        'estimate_rejected',
        jsonb_build_object(
          'estimate_id', NEW.id,
          'estimate_number', NEW.estimate_number,
          'client_id', NEW.client_id,
          'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
          'client_email', (SELECT email FROM clients WHERE id = NEW.client_id),
          'client_phone', (SELECT phone FROM clients WHERE id = NEW.client_id),
          'job_id', NEW.job_id,
          'total', NEW.total,
          'rejected_at', NEW.updated_at
        ),
        NEW.organization_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for estimates table
DROP TRIGGER IF EXISTS automation_estimate_triggers ON estimates;
CREATE TRIGGER automation_estimate_triggers
  AFTER INSERT OR UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION handle_estimate_automation_triggers();

-- Trigger for job status configuration changes
CREATE OR REPLACE FUNCTION handle_job_status_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Job status created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'job_status_created',
      jsonb_build_object(
        'status_id', NEW.id,
        'status_name', NEW.name,
        'status_color', NEW.color,
        'sequence', NEW.sequence,
        'created_by', NEW.created_by,
        'created_at', NEW.created_at
      ),
      NEW.user_id::uuid
    );
  END IF;
  
  -- Job status updated trigger
  IF TG_OP = 'UPDATE' AND (OLD.name != NEW.name OR OLD.color != NEW.color OR OLD.sequence != NEW.sequence) THEN
    PERFORM execute_automation_for_record(
      'job_status_updated',
      jsonb_build_object(
        'status_id', NEW.id,
        'old_name', OLD.name,
        'new_name', NEW.name,
        'old_color', OLD.color,
        'new_color', NEW.color,
        'old_sequence', OLD.sequence,
        'new_sequence', NEW.sequence,
        'updated_at', NEW.updated_at
      ),
      NEW.user_id::uuid
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for job_statuses table
DROP TRIGGER IF EXISTS automation_job_status_triggers ON job_statuses;
CREATE TRIGGER automation_job_status_triggers
  AFTER INSERT OR UPDATE ON job_statuses
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_status_automation_triggers();

-- Trigger for tag events
CREATE OR REPLACE FUNCTION handle_tag_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tag created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'tag_created',
      jsonb_build_object(
        'tag_id', NEW.id,
        'tag_name', NEW.name,
        'tag_category', NEW.category,
        'tag_color', NEW.color,
        'created_by', NEW.created_by,
        'created_at', NEW.created_at
      ),
      NEW.user_id::uuid
    );
  END IF;
  
  -- Tag updated trigger
  IF TG_OP = 'UPDATE' AND (OLD.name != NEW.name OR OLD.category != NEW.category OR OLD.color != NEW.color) THEN
    PERFORM execute_automation_for_record(
      'tag_updated',
      jsonb_build_object(
        'tag_id', NEW.id,
        'old_name', OLD.name,
        'new_name', NEW.name,
        'old_category', OLD.category,
        'new_category', NEW.category,
        'old_color', OLD.color,
        'new_color', NEW.color,
        'updated_at', NEW.updated_at
      ),
      NEW.user_id::uuid
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tags table
DROP TRIGGER IF EXISTS automation_tag_triggers ON tags;
CREATE TRIGGER automation_tag_triggers
  AFTER INSERT OR UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION handle_tag_automation_triggers();

-- Trigger for lead source events
CREATE OR REPLACE FUNCTION handle_lead_source_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lead source created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record(
      'lead_source_created',
      jsonb_build_object(
        'lead_source_id', NEW.id,
        'lead_source_name', NEW.name,
        'created_at', NEW.created_at
      ),
      NEW.user_id::uuid
    );
  END IF;
  
  -- Lead source updated trigger
  IF TG_OP = 'UPDATE' AND OLD.name != NEW.name THEN
    PERFORM execute_automation_for_record(
      'lead_source_updated',
      jsonb_build_object(
        'lead_source_id', NEW.id,
        'old_name', OLD.name,
        'new_name', NEW.name,
        'updated_at', NEW.updated_at
      ),
      NEW.user_id::uuid
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for lead_sources table
DROP TRIGGER IF EXISTS automation_lead_source_triggers ON lead_sources;
CREATE TRIGGER automation_lead_source_triggers
  AFTER INSERT OR UPDATE ON lead_sources
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_source_automation_triggers();

-- Trigger for job tags assignment/removal
CREATE OR REPLACE FUNCTION handle_job_tag_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Job tag added trigger
  IF TG_OP = 'UPDATE' AND OLD.tags != NEW.tags THEN
    -- Check for new tags
    PERFORM execute_automation_for_record(
      'job_tags_changed',
      jsonb_build_object(
        'job_id', NEW.id,
        'job_number', NEW.job_number,
        'client_id', NEW.client_id,
        'client_name', (SELECT name FROM clients WHERE id = NEW.client_id),
        'old_tags', OLD.tags,
        'new_tags', NEW.tags,
        'updated_at', NEW.updated_at
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for job tags changes
DROP TRIGGER IF EXISTS automation_job_tag_triggers ON jobs;
CREATE TRIGGER automation_job_tag_triggers
  AFTER UPDATE OF tags ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_tag_automation_triggers();

-- Trigger for client tags assignment/removal
CREATE OR REPLACE FUNCTION handle_client_tag_automation_triggers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Client tag changed trigger
  IF TG_OP = 'UPDATE' AND OLD.tags != NEW.tags THEN
    PERFORM execute_automation_for_record(
      'client_tags_changed',
      jsonb_build_object(
        'client_id', NEW.id,
        'client_name', NEW.name,
        'client_email', NEW.email,
        'client_phone', NEW.phone,
        'old_tags', OLD.tags,
        'new_tags', NEW.tags,
        'updated_at', NEW.updated_at
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for client tags changes
DROP TRIGGER IF EXISTS automation_client_tag_triggers ON clients;
CREATE TRIGGER automation_client_tag_triggers
  AFTER UPDATE OF tags ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_client_tag_automation_triggers();