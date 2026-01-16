-- Unified Messaging System
-- Combines SMS, Email, and In-app messages into unified views

-- ============================================
-- 1. In-App Messages Table (New Channel)
-- ============================================

CREATE TABLE IF NOT EXISTS in_app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Message content
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound', 'system')),
  title VARCHAR(255),
  body TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'notification', -- notification, reminder, alert, update, job_status

  -- Status
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Linking
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- AI enrichment
  ai_intent VARCHAR(50),
  ai_confidence DECIMAL(3,2),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for in_app_messages
CREATE INDEX idx_in_app_messages_user_id ON in_app_messages(user_id);
CREATE INDEX idx_in_app_messages_client_id ON in_app_messages(client_id);
CREATE INDEX idx_in_app_messages_organization_id ON in_app_messages(organization_id);
CREATE INDEX idx_in_app_messages_created_at ON in_app_messages(created_at DESC);
CREATE INDEX idx_in_app_messages_is_read ON in_app_messages(is_read) WHERE is_read = false;

-- RLS for in_app_messages
ALTER TABLE in_app_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own in_app_messages"
  ON in_app_messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view org in_app_messages"
  ON in_app_messages FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert in_app_messages"
  ON in_app_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert in_app_messages"
  ON in_app_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their in_app_messages"
  ON in_app_messages FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- 2. Unified Conversations View
-- ============================================

CREATE OR REPLACE VIEW unified_conversations AS
SELECT
  'sms'::text as channel,
  sc.id,
  sc.user_id,
  sc.client_id,
  NULL::uuid as organization_id,
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

-- ============================================
-- 3. Unified Messages View
-- ============================================

CREATE OR REPLACE VIEW unified_messages AS
SELECT
  'sms'::text as channel,
  sm.id,
  sm.conversation_id,
  NULL::uuid as user_id,
  sm.direction,
  sm.from_number as sender,
  sm.to_number as recipient,
  sm.content as body,
  NULL::text as subject,
  NULL::text as html_body,
  NULL::jsonb as attachments,
  CASE WHEN sm.direction = 'outbound' THEN true ELSE false END as is_read,
  sm.status,
  sm.metadata,
  NULL::text as ai_intent,
  NULL::decimal as ai_confidence,
  sm.created_at
FROM sms_messages sm

UNION ALL

SELECT
  'email'::text as channel,
  em.id,
  em.conversation_id,
  em.user_id,
  em.direction,
  em.from_email as sender,
  em.to_email as recipient,
  em.body,
  em.subject,
  em.html_body,
  em.attachments,
  COALESCE(em.is_read, false) as is_read,
  em.status,
  em.metadata,
  NULL::text as ai_intent,
  NULL::decimal as ai_confidence,
  em.created_at
FROM email_messages em

UNION ALL

SELECT
  'in_app'::text as channel,
  im.id,
  im.client_id as conversation_id, -- For in-app, we group by client
  im.user_id,
  im.direction,
  CASE WHEN im.direction = 'outbound' THEN 'System' ELSE 'Client' END as sender,
  CASE WHEN im.direction = 'outbound' THEN 'Client' ELSE 'System' END as recipient,
  im.body,
  im.title as subject,
  NULL::text as html_body,
  NULL::jsonb as attachments,
  im.is_read,
  'sent' as status,
  im.metadata,
  im.ai_intent,
  im.ai_confidence,
  im.created_at
FROM in_app_messages im;

-- ============================================
-- 4. Helper Functions
-- ============================================

-- Function to get unified conversation count by channel
CREATE OR REPLACE FUNCTION get_unified_conversation_counts(p_user_id UUID)
RETURNS TABLE (
  channel TEXT,
  total_count BIGINT,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.channel,
    COUNT(*)::bigint as total_count,
    COALESCE(SUM(uc.unread_count), 0)::bigint as unread_count
  FROM unified_conversations uc
  WHERE uc.user_id = p_user_id
  GROUP BY uc.channel;
END;
$$;

-- Function to get conversations needing reply
CREATE OR REPLACE FUNCTION get_conversations_needing_reply(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  channel TEXT,
  contact_identifier TEXT,
  client_name TEXT,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.id,
    uc.channel,
    uc.contact_identifier,
    uc.client_name,
    uc.last_message_preview,
    uc.last_message_at
  FROM unified_conversations uc
  WHERE uc.user_id = p_user_id
    AND uc.unread_count > 0
    AND uc.status != 'archived'
  ORDER BY uc.last_message_at DESC;
END;
$$;

-- ============================================
-- 5. Add AI fields to existing messages tables
-- ============================================

-- Add AI enrichment columns to sms_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_messages' AND column_name = 'ai_intent'
  ) THEN
    ALTER TABLE sms_messages ADD COLUMN ai_intent VARCHAR(50);
    ALTER TABLE sms_messages ADD COLUMN ai_confidence DECIMAL(3,2);
    ALTER TABLE sms_messages ADD COLUMN ai_suggested_replies JSONB;
  END IF;
END $$;

-- Add AI enrichment columns to email_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_messages' AND column_name = 'ai_intent'
  ) THEN
    ALTER TABLE email_messages ADD COLUMN ai_intent VARCHAR(50);
    ALTER TABLE email_messages ADD COLUMN ai_confidence DECIMAL(3,2);
    ALTER TABLE email_messages ADD COLUMN ai_suggested_replies JSONB;
  END IF;
END $$;

-- ============================================
-- 6. Indexes for Performance
-- ============================================

-- Ensure proper indexes exist on conversation tables
CREATE INDEX IF NOT EXISTS idx_sms_conversations_user_last_msg
  ON sms_conversations(user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_conversations_user_last_msg
  ON email_conversations(user_id, last_message_at DESC);

-- ============================================
-- 7. Trigger for Updated At
-- ============================================

CREATE OR REPLACE FUNCTION update_in_app_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_in_app_messages_timestamp ON in_app_messages;
CREATE TRIGGER update_in_app_messages_timestamp
  BEFORE UPDATE ON in_app_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_in_app_messages_updated_at();

-- Done!
COMMENT ON VIEW unified_conversations IS 'Unified view of all SMS, Email, and In-app conversations';
COMMENT ON VIEW unified_messages IS 'Unified view of all messages across channels';
COMMENT ON TABLE in_app_messages IS 'In-app notifications and messages for clients';
