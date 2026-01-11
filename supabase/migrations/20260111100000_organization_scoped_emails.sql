-- Migration: Organization-Scoped Emails with RBAC
-- This migration migrates email system from user-scoped to organization-scoped
-- with role-based visibility (Admin sees all, others by permission)
-- FIXED: Uses profiles.organization_id and JSONB permissions

-- ============================================
-- STEP 1: Add organization_email_address to organization_communication_settings
-- ============================================

ALTER TABLE organization_communication_settings
ADD COLUMN IF NOT EXISTS organization_email_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email_visibility_mode TEXT DEFAULT 'role_based'
  CHECK (email_visibility_mode IN ('admin_only', 'role_based', 'all_members'));

COMMENT ON COLUMN organization_communication_settings.organization_email_address
IS 'Unique @fixlify.app email address for receiving inbound emails';

COMMENT ON COLUMN organization_communication_settings.email_visibility_mode
IS 'Controls who can see emails: admin_only, role_based, or all_members';

-- ============================================
-- STEP 2: Add organization_id to email_conversations
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_conversations'
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE email_conversations
    ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_conversations'
    AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE email_conversations
    ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_conversations_org_id
ON email_conversations(organization_id);

CREATE INDEX IF NOT EXISTS idx_email_conversations_assigned_to
ON email_conversations(assigned_to);

-- ============================================
-- STEP 3: Add organization_id to email_messages
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_messages'
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE email_messages
    ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_messages_org_id
ON email_messages(organization_id);

-- ============================================
-- STEP 4: Backfill organization_id from user profiles
-- ============================================

UPDATE email_conversations ec
SET organization_id = p.organization_id
FROM profiles p
WHERE ec.user_id = p.id
AND ec.organization_id IS NULL
AND p.organization_id IS NOT NULL;

UPDATE email_messages em
SET organization_id = ec.organization_id
FROM email_conversations ec
WHERE em.conversation_id = ec.id
AND em.organization_id IS NULL
AND ec.organization_id IS NOT NULL;

-- ============================================
-- STEP 5: Create helper function for email access check
-- Uses JSONB for permissions check
-- ============================================

CREATE OR REPLACE FUNCTION can_access_organization_email(
  p_organization_id UUID,
  p_conversation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_permissions JSONB;
  v_email_visibility TEXT;
  v_assigned_to UUID;
  v_client_id TEXT;
BEGIN
  v_user_id := auth.uid();

  -- Check if user belongs to organization (via profiles table)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = v_user_id
    AND organization_id = p_organization_id
  ) THEN
    RETURN FALSE;
  END IF;

  -- Get user's role and permissions from profiles + custom_roles
  SELECT
    p.role,
    COALESCE(cr.permissions, '[]'::jsonb)
  INTO v_user_role, v_permissions
  FROM profiles p
  LEFT JOIN custom_roles cr ON p.custom_role_id = cr.id
  WHERE p.id = v_user_id;

  -- Admin has full access
  IF v_user_role = 'admin' OR v_permissions @> '"emails.view.all"'::jsonb THEN
    RETURN TRUE;
  END IF;

  -- Get organization email visibility mode
  SELECT email_visibility_mode INTO v_email_visibility
  FROM organization_communication_settings
  WHERE organization_id = p_organization_id::TEXT;

  -- If visibility is all_members, everyone in org can see
  IF v_email_visibility = 'all_members' THEN
    RETURN TRUE;
  END IF;

  -- If admin_only, only admin can see (already checked above)
  IF v_email_visibility = 'admin_only' THEN
    RETURN FALSE;
  END IF;

  -- Role-based: check specific conversation access
  IF p_conversation_id IS NOT NULL THEN
    SELECT assigned_to, client_id INTO v_assigned_to, v_client_id
    FROM email_conversations
    WHERE id = p_conversation_id;

    -- Check if assigned to this user
    IF v_assigned_to = v_user_id THEN
      RETURN TRUE;
    END IF;

    -- Check if user has permission to view assigned emails (JSONB contains)
    IF v_permissions @> '"emails.view.assigned"'::jsonb
       OR v_permissions @> '"communication.view.assigned"'::jsonb THEN
      IF EXISTS (
        SELECT 1 FROM jobs j
        WHERE j.client_id = v_client_id
        AND j.technician_id = v_user_id
      ) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 6: Update RLS Policies for email_conversations
-- ============================================

DROP POLICY IF EXISTS "Users can view own email conversations" ON email_conversations;
DROP POLICY IF EXISTS "Users can insert own email conversations" ON email_conversations;
DROP POLICY IF EXISTS "Users can update own email conversations" ON email_conversations;
DROP POLICY IF EXISTS "org_email_conversations_select" ON email_conversations;
DROP POLICY IF EXISTS "org_email_conversations_insert" ON email_conversations;
DROP POLICY IF EXISTS "org_email_conversations_update" ON email_conversations;

CREATE POLICY "org_email_conversations_select" ON email_conversations
FOR SELECT USING (
  (organization_id IS NULL AND user_id = auth.uid())
  OR
  (organization_id IS NOT NULL AND can_access_organization_email(organization_id, id))
);

CREATE POLICY "org_email_conversations_insert" ON email_conversations
FOR INSERT WITH CHECK (
  (organization_id IS NULL AND user_id = auth.uid())
  OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = email_conversations.organization_id
  ))
);

CREATE POLICY "org_email_conversations_update" ON email_conversations
FOR UPDATE USING (
  (organization_id IS NULL AND user_id = auth.uid())
  OR
  (organization_id IS NOT NULL AND can_access_organization_email(organization_id, id))
);

-- ============================================
-- STEP 7: Update RLS Policies for email_messages
-- ============================================

DROP POLICY IF EXISTS "Users can view own email messages" ON email_messages;
DROP POLICY IF EXISTS "Users can insert own email messages" ON email_messages;
DROP POLICY IF EXISTS "org_email_messages_select" ON email_messages;
DROP POLICY IF EXISTS "org_email_messages_insert" ON email_messages;

CREATE POLICY "org_email_messages_select" ON email_messages
FOR SELECT USING (
  (organization_id IS NULL AND user_id = auth.uid())
  OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM email_conversations ec
    WHERE ec.id = email_messages.conversation_id
    AND can_access_organization_email(ec.organization_id, ec.id)
  ))
);

CREATE POLICY "org_email_messages_insert" ON email_messages
FOR INSERT WITH CHECK (
  (organization_id IS NULL AND user_id = auth.uid())
  OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN custom_roles cr ON p.custom_role_id = cr.id
    WHERE p.id = auth.uid()
    AND p.organization_id = email_messages.organization_id
    AND (
      p.role = 'admin'
      OR COALESCE(cr.permissions, '[]'::jsonb) @> '"emails.send"'::jsonb
      OR COALESCE(cr.permissions, '[]'::jsonb) @> '"communication.send"'::jsonb
    )
  ))
);

-- ============================================
-- STEP 8: Update organization_communication_settings RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view organization settings" ON organization_communication_settings;
DROP POLICY IF EXISTS "Users can update organization settings" ON organization_communication_settings;
DROP POLICY IF EXISTS "org_comm_settings_select" ON organization_communication_settings;
DROP POLICY IF EXISTS "org_comm_settings_update" ON organization_communication_settings;
DROP POLICY IF EXISTS "org_comm_settings_insert" ON organization_communication_settings;

CREATE POLICY "org_comm_settings_select" ON organization_communication_settings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = organization_communication_settings.organization_id::UUID
  )
);

CREATE POLICY "org_comm_settings_update" ON organization_communication_settings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = organization_communication_settings.organization_id::UUID
    AND p.role = 'admin'
  )
);

CREATE POLICY "org_comm_settings_insert" ON organization_communication_settings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = organization_communication_settings.organization_id::UUID
    AND p.role = 'admin'
  )
);

-- ============================================
-- STEP 9: Create function to generate organization email address
-- ============================================

CREATE OR REPLACE FUNCTION generate_organization_email_address(
  p_organization_id UUID,
  p_company_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_base_email TEXT;
  v_email TEXT;
  v_counter INT := 0;
BEGIN
  v_base_email := lower(regexp_replace(
    regexp_replace(p_company_name, '[^a-zA-Z0-9]', '', 'g'),
    '\s+', '', 'g'
  ));

  IF length(v_base_email) < 3 THEN
    v_base_email := 'org' || substr(p_organization_id::TEXT, 1, 8);
  END IF;

  v_base_email := substr(v_base_email, 1, 30);
  v_email := v_base_email || '@fixlify.app';

  WHILE EXISTS (
    SELECT 1 FROM organization_communication_settings
    WHERE organization_email_address = v_email
    AND organization_id != p_organization_id::TEXT
  ) LOOP
    v_counter := v_counter + 1;
    v_email := v_base_email || v_counter || '@fixlify.app';
  END LOOP;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 10: Create function to find organization by email address
-- ============================================

CREATE OR REPLACE FUNCTION find_organization_by_email_address(
  p_email_address TEXT
)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id::UUID,
    o.name
  FROM organization_communication_settings ocs
  JOIN organizations o ON o.id::TEXT = ocs.organization_id
  WHERE ocs.organization_email_address = p_email_address
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION can_access_organization_email TO authenticated;
GRANT EXECUTE ON FUNCTION generate_organization_email_address TO authenticated;
GRANT EXECUTE ON FUNCTION find_organization_by_email_address TO authenticated;
GRANT EXECUTE ON FUNCTION find_organization_by_email_address TO service_role;

SELECT 'Organization-scoped email migration complete!' as status;
