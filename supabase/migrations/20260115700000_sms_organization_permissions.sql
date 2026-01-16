-- SMS Organization Permissions & Technician Access Control
-- This migration:
-- 1. Adds organization_id to sms_conversations
-- 2. Updates RLS policies for organization-based access
-- 3. Creates function for technician filtering (assigned clients only)

-- ============================================
-- 1. Add organization_id to sms_conversations
-- ============================================

ALTER TABLE sms_conversations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Backfill organization_id from the user's profile
UPDATE sms_conversations sc
SET organization_id = (
  SELECT p.organization_id
  FROM profiles p
  WHERE p.id = sc.user_id
  LIMIT 1
)
WHERE sc.organization_id IS NULL;

-- Create index for organization filtering
CREATE INDEX IF NOT EXISTS idx_sms_conversations_org_id
  ON sms_conversations(organization_id);

CREATE INDEX IF NOT EXISTS idx_sms_conversations_org_last_msg
  ON sms_conversations(organization_id, last_message_at DESC);

-- ============================================
-- 2. Update RLS Policies for sms_conversations
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sms_conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Users can insert own sms_conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Users can update own sms_conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Org members can view sms_conversations" ON sms_conversations;

-- Enable RLS if not already enabled
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can view conversations
-- Admin/Manager: All org conversations
-- Technician: Only conversations for their assigned clients
CREATE POLICY "Org members view sms_conversations"
  ON sms_conversations FOR SELECT
  USING (
    -- Owner always has access
    user_id = auth.uid()
    OR
    -- Organization member access (via profiles table)
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.organization_id = sms_conversations.organization_id
        AND (
          -- Admins and managers see all
          p.role IN ('admin', 'manager', 'owner', 'dispatcher')
          OR
          -- Technicians only see assigned clients
          (p.role = 'technician' AND EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.client_id = sms_conversations.client_id
              AND j.technician_id = auth.uid()
          ))
        )
    )
  );

-- Policy: Organization members can create conversations
CREATE POLICY "Org members insert sms_conversations"
  ON sms_conversations FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.organization_id = sms_conversations.organization_id
    )
  );

-- Policy: Organization members can update conversations
CREATE POLICY "Org members update sms_conversations"
  ON sms_conversations FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.organization_id = sms_conversations.organization_id
    )
  );

-- ============================================
-- 3. Update RLS Policies for sms_messages
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their sms_messages" ON sms_messages;
DROP POLICY IF EXISTS "Users can view sms_messages" ON sms_messages;
DROP POLICY IF EXISTS "Users can insert sms_messages" ON sms_messages;
DROP POLICY IF EXISTS "Org members can view sms_messages" ON sms_messages;

-- Enable RLS
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Can view messages if can view the conversation
CREATE POLICY "Org members view sms_messages"
  ON sms_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sms_conversations sc
      WHERE sc.id = sms_messages.conversation_id
        AND (
          sc.user_id = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
              AND p.organization_id = sc.organization_id
              AND (
                p.role IN ('admin', 'manager', 'owner', 'dispatcher')
                OR
                (p.role = 'technician' AND EXISTS (
                  SELECT 1 FROM jobs j
                  WHERE j.client_id = sc.client_id
                    AND j.technician_id = auth.uid()
                ))
              )
          )
        )
    )
  );

-- Policy: Can insert messages if can view the conversation
CREATE POLICY "Org members insert sms_messages"
  ON sms_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sms_conversations sc
      WHERE sc.id = sms_messages.conversation_id
        AND (
          sc.user_id = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
              AND p.organization_id = sc.organization_id
          )
        )
    )
  );

-- ============================================
-- 4. Helper Function: Get Technician's Assigned Clients
-- ============================================

CREATE OR REPLACE FUNCTION get_technician_assigned_clients(p_user_id UUID)
RETURNS TABLE (client_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT j.client_id
  FROM jobs j
  WHERE j.technician_id = p_user_id
    AND j.client_id IS NOT NULL;
END;
$$;

-- ============================================
-- 5. Helper Function: Check User's Messaging Permissions
-- ============================================

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
  -- Get user's role from profiles
  SELECT role INTO v_role
  FROM profiles
  WHERE id = p_user_id
    AND organization_id = p_organization_id;

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

-- ============================================
-- 6. Update unified_conversations view
-- ============================================

DROP VIEW IF EXISTS unified_conversations CASCADE;

CREATE OR REPLACE VIEW unified_conversations AS
SELECT
  'sms'::text as channel,
  sc.id,
  sc.user_id,
  sc.client_id,
  sc.organization_id,
  sc.client_phone as contact_identifier,
  sc.phone_number as business_identifier,
  NULL::text as subject,
  sc.last_message_at,
  sc.last_message_preview,
  COALESCE(sc.unread_count, 0) as unread_count,
  sc.status,
  false as is_archived,
  false as is_starred,
  NULL::uuid as assigned_to,
  sc.created_at,
  sc.updated_at,
  -- Client info
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone_formatted
FROM sms_conversations sc
LEFT JOIN clients c ON sc.client_id = c.id

UNION ALL

SELECT
  'email'::text as channel,
  ec.id,
  ec.user_id,
  ec.client_id,
  ec.organization_id,
  ec.client_email as contact_identifier,
  NULL::text as business_identifier,
  ec.subject,
  ec.last_message_at,
  ec.last_message_preview,
  COALESCE(ec.unread_count, 0) as unread_count,
  CASE WHEN ec.is_archived THEN 'archived' ELSE 'active' END as status,
  COALESCE(ec.is_archived, false) as is_archived,
  COALESCE(ec.is_starred, false) as is_starred,
  ec.assigned_to,
  ec.created_at,
  ec.updated_at,
  -- Client info
  COALESCE(c.name, ec.client_name) as client_name,
  ec.client_email as client_email,
  c.phone as client_phone_formatted
FROM email_conversations ec
LEFT JOIN clients c ON ec.client_id = c.id;

COMMENT ON VIEW unified_conversations IS 'Unified view of all SMS and Email conversations with organization support';

-- ============================================
-- 7. Function: Get Organization Conversations with Role Filtering
-- ============================================

CREATE OR REPLACE FUNCTION get_org_conversations(
  p_user_id UUID,
  p_organization_id UUID,
  p_channel TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
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
  WHERE id = p_user_id
    AND organization_id = p_organization_id;

  -- Get technician's assigned clients if applicable
  IF v_role = 'technician' THEN
    SELECT ARRAY_AGG(DISTINCT j.client_id) INTO v_assigned_clients
    FROM jobs j
    WHERE j.technician_id = p_user_id
      AND j.client_id IS NOT NULL;
  END IF;

  RETURN QUERY
  SELECT
    uc.id,
    uc.channel,
    uc.client_id,
    uc.client_name,
    uc.contact_identifier,
    uc.last_message_at,
    uc.last_message_preview,
    uc.unread_count::int
  FROM unified_conversations uc
  WHERE (uc.organization_id = p_organization_id OR uc.user_id = p_user_id)
    AND (p_channel IS NULL OR uc.channel = p_channel)
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

-- Done!
COMMENT ON FUNCTION get_technician_assigned_clients IS 'Returns list of client IDs assigned to a technician via jobs';
COMMENT ON FUNCTION can_view_client_messages IS 'Checks if a user can view messages for a specific client';
COMMENT ON FUNCTION get_org_conversations IS 'Gets filtered conversations based on user role in organization';
