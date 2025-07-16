
-- Remove all remaining client portal related tables and functions
DROP TABLE IF EXISTS public.secure_document_access CASCADE;

-- Remove any remaining client portal functions
DROP FUNCTION IF EXISTS public.generate_secure_document_access(text, uuid, text, integer);
DROP FUNCTION IF EXISTS public.validate_document_access(text);

-- Clean up any remaining client portal related data from other tables
-- Remove portal-related columns from estimate_communications if they exist
ALTER TABLE public.estimate_communications DROP COLUMN IF EXISTS portal_link_included;

-- Remove portal-related columns from invoice_communications if they exist  
ALTER TABLE public.invoice_communications DROP COLUMN IF EXISTS portal_link_included;

-- Remove any client portal related settings from company_settings
UPDATE public.company_settings 
SET client_portal_url = NULL, 
    custom_domain = NULL,
    custom_domain_name = NULL
WHERE client_portal_url IS NOT NULL 
   OR custom_domain IS NOT NULL 
   OR custom_domain_name IS NOT NULL;
