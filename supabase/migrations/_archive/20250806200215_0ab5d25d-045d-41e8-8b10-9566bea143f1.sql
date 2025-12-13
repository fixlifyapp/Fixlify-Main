-- Phase 1: Clean up cron jobs and create unified automation system

-- Remove all existing cron jobs to avoid conflicts
SELECT cron.unschedule('process-pending-automations');
SELECT cron.unschedule('check-automation-triggers');
SELECT cron.unschedule('cleanup-stuck-automations');

-- Create a unified automation processing function
CREATE OR REPLACE FUNCTION process_automation_system()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stuck_count INTEGER;
  processed_count INTEGER;
BEGIN
  -- Step 1: Clean up stuck automations (older than 5 minutes)
  UPDATE automation_execution_logs
  SET status = 'failed',
      error_message = 'Timeout - stuck in running state for over 5 minutes',
      completed_at = NOW()
  WHERE status = 'running'
    AND started_at < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS stuck_count = ROW_COUNT;
  
  -- Step 2: Process pending automations by calling the scheduler
  PERFORM net.http_post(
    url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU5MTcwNSwiZXhwIjoyMDYzMTY3NzA1fQ.pN1vD4lGdJ3G7wgPY0dGqFqY2q3Y8dY5dY9dY8dY0dQ"}'::jsonb,
    body := '{"source": "cron_job"}'::jsonb
  );

  -- Log the cleanup activity
  RAISE NOTICE 'Automation system processed: % stuck automations cleaned up', stuck_count;
  
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the cron job
  RAISE NOTICE 'Error in automation system processing: %', SQLERRM;
END;
$$;