-- Add GST/HST Number and Insurance Policy Number to organization_settings
-- These fields are optional and used for Canadian tax compliance on invoices/estimates

-- Add gst_hst_number column
ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS gst_hst_number TEXT;

-- Add insurance_policy_number column
ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;

-- Add company_city, company_state, company_zip, company_country columns if not exist
ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS company_city TEXT;

ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS company_state TEXT;

ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS company_zip TEXT;

ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS company_country TEXT;

-- Also add to company_settings table for backward compatibility
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS gst_hst_number TEXT;

ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN organization_settings.gst_hst_number IS 'GST/HST Registration Number for Canadian tax compliance (optional)';
COMMENT ON COLUMN organization_settings.insurance_policy_number IS 'Business insurance policy number (optional)';
COMMENT ON COLUMN company_settings.gst_hst_number IS 'GST/HST Registration Number for Canadian tax compliance (optional)';
COMMENT ON COLUMN company_settings.insurance_policy_number IS 'Business insurance policy number (optional)';
