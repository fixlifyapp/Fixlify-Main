-- Cleanup orphaned triggers on tags table that cause error 42703
-- Error: "record 'new' has no field 'organization_id'" during UPDATE operations
--
-- These triggers were created by archived automation migrations but never properly cleaned up
-- The cleanup_automation migration (20251227240000) only dropped handle_client_tag_automation_triggers
-- but missed handle_tag_automation_triggers and its triggers

-- Drop the triggers first (they reference the function)
DROP TRIGGER IF EXISTS tag_automation_trigger ON tags;
DROP TRIGGER IF EXISTS automation_tag_triggers ON tags;

-- Drop the orphaned function
DROP FUNCTION IF EXISTS handle_tag_automation_triggers() CASCADE;

-- Also cleanup any remaining triggers on other config tables that might have same issue
DROP TRIGGER IF EXISTS job_type_automation_trigger ON job_types;
DROP TRIGGER IF EXISTS lead_source_automation_trigger ON lead_sources;
DROP TRIGGER IF EXISTS job_status_automation_trigger ON job_statuses;

-- Cleanup any other orphaned automation trigger functions
DROP FUNCTION IF EXISTS handle_job_type_automation_triggers() CASCADE;
DROP FUNCTION IF EXISTS handle_lead_source_automation_triggers() CASCADE;
DROP FUNCTION IF EXISTS handle_job_status_automation_triggers() CASCADE;

-- Verify the cleanup by checking for remaining triggers (this is just for logging)
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_table IN ('tags', 'job_types', 'lead_sources', 'job_statuses')
    AND trigger_name LIKE '%automation%';

  IF trigger_count > 0 THEN
    RAISE NOTICE 'Warning: % automation triggers still exist on config tables', trigger_count;
  ELSE
    RAISE NOTICE 'Success: All automation triggers cleaned up from config tables';
  END IF;
END $$;
