-- Add RLS policies for client_properties table
-- Properties are linked to clients via client_id, and clients have user_id

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view properties of their clients" ON client_properties;
DROP POLICY IF EXISTS "Users can create properties for their clients" ON client_properties;
DROP POLICY IF EXISTS "Users can update properties of their clients" ON client_properties;
DROP POLICY IF EXISTS "Users can delete properties of their clients" ON client_properties;

-- SELECT: Users can view properties of clients they own
CREATE POLICY "Users can view properties of their clients"
ON client_properties
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND c.user_id = auth.uid()
  )
);

-- INSERT: Users can create properties for clients they own
CREATE POLICY "Users can create properties for their clients"
ON client_properties
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND c.user_id = auth.uid()
  )
);

-- UPDATE: Users can update properties of clients they own
CREATE POLICY "Users can update properties of their clients"
ON client_properties
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND c.user_id = auth.uid()
  )
);

-- DELETE: Users can delete properties of clients they own
CREATE POLICY "Users can delete properties of their clients"
ON client_properties
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND c.user_id = auth.uid()
  )
);
