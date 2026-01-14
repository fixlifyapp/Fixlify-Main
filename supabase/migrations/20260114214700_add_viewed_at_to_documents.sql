-- Add viewed_at column to estimates table for tracking when client views the document
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Add viewed_at column to invoices table for tracking when client views the document
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN estimates.viewed_at IS 'Timestamp when client first viewed the estimate in the portal';
COMMENT ON COLUMN invoices.viewed_at IS 'Timestamp when client first viewed the invoice in the portal';
