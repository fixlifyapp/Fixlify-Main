-- Fix permission helper functions

-- Fix get_org_conversations: ambiguous column reference
DROP FUNCTION IF EXISTS get_org_conversations(UUID, UUID, TEXT, INT);

CREATE OR REPLACE FUNCTION get_org_conversations(
  p_user_id UUID,
  p_organization_id UUID,
  p_channel TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  conv_id UUID,
  channel TEXT,
  client_id UUID,
  client_name TEXT,
  contact_identifier TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
  v_assigned_clients UUID[];
BEGIN
  -- Get user's role from profiles
  SELECT role INTO v_role
  FROM profiles
  WHERE profiles.id = p_user_id
    AND profiles.organization_id = p_organization_id;

  -- Get technician's assigned clients if applicable
  IF v_role = 'technician' THEN
    SELECT ARRAY_AGG(DISTINCT j.client_id) INTO v_assigned_clients
    FROM jobs j
    WHERE j.technician_id = p_user_id
      AND j.client_id IS NOT NULL;
  END IF;

  RETURN QUERY
  SELECT
    uc.id as conv_id,
    uc.channel::text,
    uc.client_id,
    uc.client_name::text,
    uc.contact_identifier::text,
    uc.last_message_at,
    uc.last_message_preview::text,
    COALESCE(uc.unread_count, 0)::int as unread_count
  FROM unified_conversations uc
  WHERE (uc.organization_id = p_organization_id OR uc.user_id = p_user_id)
    AND (p_channel IS NULL OR uc.channel::text = p_channel)
    AND (
      -- Admin/manager see all
      v_role IN ('admin', 'manager', 'owner', 'dispatcher')
      -- Technicians see only assigned
      OR (v_role = 'technician' AND uc.client_id = ANY(v_assigned_clients))
      -- Fallback to owner
      OR uc.user_id = p_user_id
    )
  ORDER BY uc.last_message_at DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Fix can_view_client_messages: handle non-UUID client IDs gracefully
DROP FUNCTION IF EXISTS can_view_client_messages(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION can_view_client_messages(
  p_user_id UUID,
  p_client_id UUID,
  p_organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Handle null client_id
  IF p_client_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user's role from profiles
  SELECT role INTO v_role
  FROM profiles
  WHERE profiles.id = p_user_id
    AND profiles.organization_id = p_organization_id;

  -- No role = no access
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Admin/manager/dispatcher can see all
  IF v_role IN ('admin', 'manager', 'owner', 'dispatcher') THEN
    RETURN TRUE;
  END IF;

  -- Technicians can only see assigned clients
  IF v_role = 'technician' THEN
    RETURN EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.client_id = p_client_id
        AND j.technician_id = p_user_id
    );
  END IF;

  -- Default deny
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION get_org_conversations IS 'Gets filtered conversations based on user role in organization (fixed ambiguous column)';
COMMENT ON FUNCTION can_view_client_messages IS 'Checks if a user can view messages for a specific client (handles null gracefully)';
