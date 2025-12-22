-- Add default values for created_at and updated_at columns
-- This allows inserts without explicitly specifying these timestamps

ALTER TABLE client_properties
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE client_properties
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_client_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_client_properties_updated_at ON client_properties;

CREATE TRIGGER update_client_properties_updated_at
BEFORE UPDATE ON client_properties
FOR EACH ROW
EXECUTE FUNCTION update_client_properties_updated_at();
