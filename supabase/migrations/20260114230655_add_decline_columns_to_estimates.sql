-- Add decline tracking columns to estimates table
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN estimates.declined_at IS 'Timestamp when client declined the estimate via portal';
COMMENT ON COLUMN estimates.decline_reason IS 'Optional reason provided by client for declining';
