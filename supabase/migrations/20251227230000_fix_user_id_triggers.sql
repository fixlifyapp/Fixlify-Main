-- Fix the broken user_id triggers
-- PROBLEM: set_client_user_id() unconditionally sets user_id = auth.uid(), overwriting any passed value

-- Step 1: Drop ALL the duplicate/broken triggers on clients
DROP TRIGGER IF EXISTS ensure_client_user_id ON clients;
DROP TRIGGER IF EXISTS ensure_user_id_clients ON clients;
DROP TRIGGER IF EXISTS set_client_user_id_trigger ON clients;
DROP TRIGGER IF EXISTS set_clients_user_id ON clients;
DROP TRIGGER IF EXISTS set_user_id_on_clients ON clients;

-- Also drop duplicate automation triggers (keep only automation_trigger_clients)
DROP TRIGGER IF EXISTS automation_client_triggers ON clients;
DROP TRIGGER IF EXISTS client_automation_trigger ON clients;
DROP TRIGGER IF EXISTS trigger_client_automation ON clients;
-- Keep: automation_trigger_clients (uses handle_universal_automation_triggers)
-- Keep: automation_client_tag_triggers (for tag changes)

-- Step 2: Fix the set_client_user_id function to NOT overwrite existing user_id
CREATE OR REPLACE FUNCTION set_client_user_id()
RETURNS trigger AS $$
BEGIN
  -- Only set user_id if it's NULL and we have a valid auth.uid()
  IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a single, clean trigger for user_id
CREATE OR REPLACE TRIGGER set_clients_user_id
  BEFORE INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION set_client_user_id();

-- Step 4: Verify we now have only the triggers we need
-- Run this query to verify: SELECT tgname FROM pg_trigger WHERE tgrelid = 'clients'::regclass;
