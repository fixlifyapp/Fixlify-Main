-- Fix payment recording bug
-- The payment_automation_trigger was referencing NEW.created_by which doesn't exist in payments table
-- This trigger was from archived automation system and should be dropped

-- Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS payment_automation_trigger ON payments;

-- Drop the function if it exists (only if not used elsewhere)
-- Note: We can't drop the function safely without checking dependencies,
-- but dropping the trigger is enough to fix the immediate issue

-- Also ensure the job revenue trigger is the only trigger on payments
-- (the one that actually works correctly)

-- Verify no other problematic triggers exist
-- SELECT * FROM pg_trigger WHERE tgrelid = 'payments'::regclass;

-- Comment: The update_job_revenue_from_payments trigger from
-- 20251231000002_auto_update_job_revenue.sql is the correct trigger
-- and it doesn't reference created_by
