-- Fix: Add upsell_config column if it doesn't exist
-- This migration re-adds the column that should have been created by 20260103000002_add_upsell_config.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'upsell_config'
  ) THEN
    ALTER TABLE company_settings
    ADD COLUMN upsell_config jsonb DEFAULT '{
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

    COMMENT ON COLUMN company_settings.upsell_config IS
    'Configuration for automatic upsell suggestions on estimates and invoices';

    RAISE NOTICE 'Column upsell_config added to company_settings';
  ELSE
    RAISE NOTICE 'Column upsell_config already exists';
  END IF;
END $$;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_company_settings_upsell_config
ON company_settings USING gin (upsell_config);
