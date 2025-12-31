-- Recreate all automation triggers to ensure they use the updated function
-- This fixes any triggers that might have failed during initial migration

-- Drop and recreate triggers on all tables
DROP TRIGGER IF EXISTS automation_trigger_jobs ON jobs;
CREATE TRIGGER automation_trigger_jobs
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

DROP TRIGGER IF EXISTS automation_trigger_clients ON clients;
CREATE TRIGGER automation_trigger_clients
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

DROP TRIGGER IF EXISTS automation_trigger_estimates ON estimates;
CREATE TRIGGER automation_trigger_estimates
  AFTER INSERT OR UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

DROP TRIGGER IF EXISTS automation_trigger_invoices ON invoices;
CREATE TRIGGER automation_trigger_invoices
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_universal_automation_triggers();

-- SMS and Email triggers - only create if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sms_messages' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS automation_trigger_sms ON sms_messages;
    CREATE TRIGGER automation_trigger_sms
      AFTER INSERT ON sms_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_universal_automation_triggers();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_messages' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS automation_trigger_email ON email_messages;
    CREATE TRIGGER automation_trigger_email
      AFTER INSERT ON email_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_universal_automation_triggers();
  END IF;
END $$;

-- Verify triggers exist
DO $$
DECLARE
  trigger_count INT;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_proc p ON t.tgfoid = p.oid
  WHERE NOT t.tgisinternal
  AND p.proname = 'handle_universal_automation_triggers';

  RAISE NOTICE 'Total automation triggers created: %', trigger_count;
END $$;
