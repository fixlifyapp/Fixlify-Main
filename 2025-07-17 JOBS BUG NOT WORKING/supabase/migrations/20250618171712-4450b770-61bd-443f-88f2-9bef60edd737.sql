
-- Add portal access token columns to estimates and invoices tables
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS portal_access_token TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS portal_access_token TEXT;
