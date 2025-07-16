
-- Remove client portal tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.client_portal_activity_logs CASCADE;
DROP TABLE IF EXISTS public.client_portal_sessions CASCADE;
DROP TABLE IF EXISTS public.client_portal_users CASCADE;

-- Remove all client portal functions if they exist
DROP FUNCTION IF EXISTS public.validate_client_portal_session(text);
DROP FUNCTION IF EXISTS public.generate_client_portal_access(text, text, uuid, integer);
DROP FUNCTION IF EXISTS public.log_client_portal_activity(uuid, text, text, text, jsonb, text, text);
