-- Fix the job tag automation trigger function that's causing the job_number error
CREATE OR REPLACE FUNCTION public.handle_job_tag_automation_triggers()
RETURNS trigger AS $$
BEGIN
  -- Job tag added trigger
  IF TG_OP = 'UPDATE' AND OLD.tags != NEW.tags THEN
    -- Check for new tags
    PERFORM execute_automation_for_record(
      'job_tags_changed',
      jsonb_build_object(
        'job_id', NEW.id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;