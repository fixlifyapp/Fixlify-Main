-- Fix RLS policies for client_custom_field_values table
-- Ensure users can access custom field values for clients in their organization
-- Clients use user_id to link to profiles, which has organization_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view client custom field values" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can insert client custom field values" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can update client custom field values" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can delete client custom field values" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can view client custom field values in their org" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can insert client custom field values in their org" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can update client custom field values in their org" ON client_custom_field_values;
DROP POLICY IF EXISTS "Users can delete client custom field values in their org" ON client_custom_field_values;

-- Ensure RLS is enabled
ALTER TABLE client_custom_field_values ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view client custom field values for clients in their organization
-- Uses the pattern: clients.user_id -> profiles.organization_id
CREATE POLICY "Users can view client custom field values in their org"
ON client_custom_field_values FOR SELECT
USING (
  client_id IN (
    SELECT c.id FROM clients c
    WHERE c.user_id IN (
      SELECT id FROM profiles WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- INSERT policy: Users can insert client custom field values for clients in their organization
CREATE POLICY "Users can insert client custom field values in their org"
ON client_custom_field_values FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT c.id FROM clients c
    WHERE c.user_id IN (
      SELECT id FROM profiles WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- UPDATE policy: Users can update client custom field values for clients in their organization
CREATE POLICY "Users can update client custom field values in their org"
ON client_custom_field_values FOR UPDATE
USING (
  client_id IN (
    SELECT c.id FROM clients c
    WHERE c.user_id IN (
      SELECT id FROM profiles WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- DELETE policy: Users can delete client custom field values for clients in their organization
CREATE POLICY "Users can delete client custom field values in their org"
ON client_custom_field_values FOR DELETE
USING (
  client_id IN (
    SELECT c.id FROM clients c
    WHERE c.user_id IN (
      SELECT id FROM profiles WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);
