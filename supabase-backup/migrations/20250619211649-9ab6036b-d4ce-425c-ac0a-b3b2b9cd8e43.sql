
-- Drop unused client portal tables that are causing confusion
DROP TABLE IF EXISTS public.client_portal_sessions CASCADE;
DROP TABLE IF EXISTS public.client_portal_users CASCADE;
DROP TABLE IF EXISTS public.secure_document_access CASCADE;

-- Drop any related functions that might reference these tables
DROP FUNCTION IF EXISTS public.validate_client_portal_session(text);
DROP FUNCTION IF EXISTS public.generate_client_portal_access(text, text, uuid, integer);
DROP FUNCTION IF EXISTS public.log_client_portal_activity(uuid, text, text, text, jsonb, text, text);
