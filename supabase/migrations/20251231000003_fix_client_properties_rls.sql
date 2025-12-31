-- Fix Client Properties RLS Policies
-- Problem: Policies only check c.user_id, but clients table has BOTH user_id AND created_by
-- Solution: Update policies to check BOTH fields using OR logic
--
-- Business Context:
-- - Clients can be created with either user_id or created_by (or both)
-- - Properties should be accessible if user owns client via EITHER field
-- - This matches the pattern used in frontend (useClientsOptimized.ts)

-- =====================================================
-- DROP EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view properties of their clients" ON client_properties;
DROP POLICY IF EXISTS "Users can create properties for their clients" ON client_properties;
DROP POLICY IF EXISTS "Users can update properties of their clients" ON client_properties;
DROP POLICY IF EXISTS "Users can delete properties of their clients" ON client_properties;

-- =====================================================
-- CREATE FIXED POLICIES
-- =====================================================

-- SELECT: Users can view properties of clients they own (via user_id OR created_by)
CREATE POLICY "Users can view properties of their clients"
ON client_properties
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
  )
);

-- INSERT: Users can create properties for clients they own (via user_id OR created_by)
CREATE POLICY "Users can create properties for their clients"
ON client_properties
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
  )
);

-- UPDATE: Users can update properties of clients they own (via user_id OR created_by)
CREATE POLICY "Users can update properties of their clients"
ON client_properties
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
  )
);

-- DELETE: Users can delete properties of clients they own (via user_id OR created_by)
CREATE POLICY "Users can delete properties of their clients"
ON client_properties
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_properties.client_id
    AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
  )
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
--
-- After migration, verify policies with:
-- SELECT * FROM pg_policies WHERE tablename = 'client_properties';
--
-- Test access with:
-- SELECT * FROM client_properties WHERE client_id = 'your-client-id';
--
