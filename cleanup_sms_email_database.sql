-- SMS/Email Database Cleanup Script
-- This removes all SMS/Email related tables and functions

-- Drop tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS public.sms_logs CASCADE;
DROP TABLE IF EXISTS public.email_logs CASCADE;
DROP TABLE IF EXISTS public.communication_logs CASCADE;
DROP TABLE IF EXISTS public.mailgun_webhooks CASCADE;
DROP TABLE IF EXISTS public.telnyx_webhooks CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.sms_templates CASCADE;
DROP TABLE IF EXISTS public.communication_templates CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Drop functions related to SMS/Email
DROP FUNCTION IF EXISTS public.send_email CASCADE;
DROP FUNCTION IF EXISTS public.send_sms CASCADE;
DROP FUNCTION IF EXISTS public.log_communication CASCADE;
DROP FUNCTION IF EXISTS public.handle_sms_webhook CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_webhook CASCADE;

-- Drop any triggers
DROP TRIGGER IF EXISTS on_sms_sent ON public.sms_logs;
DROP TRIGGER IF EXISTS on_email_sent ON public.email_logs;

-- Remove columns from existing tables
ALTER TABLE public.estimates DROP COLUMN IF EXISTS last_sent_at;
ALTER TABLE public.estimates DROP COLUMN IF EXISTS sent_via;
ALTER TABLE public.invoices DROP COLUMN IF EXISTS last_sent_at;
ALTER TABLE public.invoices DROP COLUMN IF EXISTS sent_via;

-- Remove Mailgun/Telnyx configuration from company_settings (if exists)
UPDATE public.company_settings 
SET mailgun_api_key = NULL,
    mailgun_domain = NULL,
    telnyx_api_key = NULL,
    telnyx_profile_id = NULL
WHERE mailgun_api_key IS NOT NULL 
   OR telnyx_api_key IS NOT NULL;

-- Clean up any edge function secrets (these need to be removed via Supabase dashboard)
-- List of secrets to remove:
-- MAILGUN_API_KEY
-- MAILGUN_DOMAIN
-- TELNYX_API_KEY
-- TELNYX_PROFILE_ID
-- TELNYX_PUBLIC_KEY

SELECT 'Database cleanup complete!' as status;
