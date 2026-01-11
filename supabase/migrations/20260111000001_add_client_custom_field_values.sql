-- Create client_custom_field_values table (similar to job_custom_field_values)
CREATE TABLE IF NOT EXISTS client_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, custom_field_id)
);

-- Add indexes
CREATE INDEX idx_client_custom_field_values_client ON client_custom_field_values(client_id);
CREATE INDEX idx_client_custom_field_values_field ON client_custom_field_values(custom_field_id);

-- RLS policies
ALTER TABLE client_custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client custom field values in their org"
ON client_custom_field_values FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert client custom field values in their org"
ON client_custom_field_values FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM clients
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update client custom field values in their org"
ON client_custom_field_values FOR UPDATE
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete client custom field values in their org"
ON client_custom_field_values FOR DELETE
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);
