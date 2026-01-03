-- Add upsell_config column to company_settings for auto-upsell feature
-- This enables technicians to have warranty products auto-selected on estimates/invoices

ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS upsell_config jsonb DEFAULT '{
  "estimates": {
    "enabled": true,
    "auto_select": true,
    "products": []
  },
  "invoices": {
    "enabled": true,
    "auto_select": false,
    "products": []
  }
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN company_settings.upsell_config IS
'Configuration for automatic upsell suggestions on estimates and invoices. Structure:
{
  estimates: { enabled: bool, auto_select: bool, products: uuid[] },
  invoices: { enabled: bool, auto_select: bool, products: uuid[] }
}';

-- Create index for faster queries on upsell_config
CREATE INDEX IF NOT EXISTS idx_company_settings_upsell_config
ON company_settings USING gin (upsell_config);
