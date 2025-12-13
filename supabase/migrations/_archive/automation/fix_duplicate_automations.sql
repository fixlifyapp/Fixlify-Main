-- Drop the problematic trigger that's causing duplicates
DROP TRIGGER IF EXISTS on_job_status_change ON jobs;
DROP FUNCTION IF EXISTS handle_job_status_change();

-- Create a simple function to track job updates without triggering automations
CREATE OR REPLACE FUNCTION track_job_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Just update the timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple trigger for tracking updates
CREATE TRIGGER job_update_tracker
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION track_job_update();
