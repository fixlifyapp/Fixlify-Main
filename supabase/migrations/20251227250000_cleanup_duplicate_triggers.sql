-- Final cleanup: Remove duplicate automation triggers from all tables
-- Keep only the universal trigger (automation_trigger_*) on each table

-- Step 1: Clean up JOBS table triggers (keep automation_trigger_jobs)
DROP TRIGGER IF EXISTS job_automation_direct_trigger ON jobs;
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
DROP TRIGGER IF EXISTS trigger_job_automation_insert ON jobs;
DROP TRIGGER IF EXISTS trigger_job_automation_update ON jobs;

-- Clean up duplicate user_id triggers on jobs
DROP TRIGGER IF EXISTS ensure_user_id_jobs ON jobs;
DROP TRIGGER IF EXISTS set_user_id_on_jobs ON jobs;
-- Keep: set_jobs_user_id

-- Step 2: Clean up ESTIMATES table triggers (keep automation_trigger_estimates)
DROP TRIGGER IF EXISTS ensure_user_id_estimates ON estimates;
-- Keep: set_estimates_user_id

-- Step 3: Clean up INVOICES table triggers (keep automation_trigger_invoices)
DROP TRIGGER IF EXISTS automation_invoice_triggers ON invoices;
DROP TRIGGER IF EXISTS invoice_automation_trigger ON invoices;
DROP TRIGGER IF EXISTS trigger_invoice_automation ON invoices;

-- Step 4: Verify the universal trigger function exists
-- This should have been created by cleanup_automation.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_universal_automation_triggers'
  ) THEN
    RAISE EXCEPTION 'handle_universal_automation_triggers function not found';
  END IF;
END $$;

-- Step 5: Add helpful comment
COMMENT ON TRIGGER automation_trigger_clients ON clients IS 'Universal automation trigger for client events';
COMMENT ON TRIGGER automation_trigger_jobs ON jobs IS 'Universal automation trigger for job events';
COMMENT ON TRIGGER automation_trigger_estimates ON estimates IS 'Universal automation trigger for estimate events';
COMMENT ON TRIGGER automation_trigger_invoices ON invoices IS 'Universal automation trigger for invoice events';
