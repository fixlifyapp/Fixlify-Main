-- Safe SMS Schema Migration for Supabase
-- Run this in the Supabase SQL Editor instead of using exec-sql

-- =====================================================
-- PART 1: Core SMS Tables
-- =====================================================

-- 1. Phone numbers table
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  telnyx_phone_number_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{"sms": true, "voice": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Communication logs (unified for SMS/Email)
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id TEXT REFERENCES clients(id),
  job_id TEXT REFERENCES jobs(id),
  document_type TEXT,
  document_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'pending',
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Message templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email')),
  category TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 2: SMS Conversation Tables
-- =====================================================

-- 4. SMS Conversations
CREATE TABLE IF NOT EXISTS sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id TEXT REFERENCES clients(id),
  client_phone TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_content TEXT,
  unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SMS Messages
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES sms_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  telnyx_message_id TEXT,
  error_message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 3: Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone ON phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_client_id ON communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_user_id ON sms_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_client_id ON sms_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_conversation_id ON sms_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at);

-- =====================================================
-- PART 4: Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Phone numbers policies
CREATE POLICY "Users can manage their own phone numbers" ON phone_numbers
  FOR ALL USING (auth.uid() = user_id);

-- Communication logs policies
CREATE POLICY "Users can view their own communication logs" ON communication_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own communication logs" ON communication_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Message templates policies
CREATE POLICY "Users can manage their own message templates" ON message_templates
  FOR ALL USING (auth.uid() = user_id);

-- SMS conversations policies
CREATE POLICY "Users can manage their own conversations" ON sms_conversations
  FOR ALL USING (auth.uid() = user_id);

-- SMS messages policies
CREATE POLICY "Users can view messages in their conversations" ON sms_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sms_conversations
      WHERE sms_conversations.id = sms_messages.conversation_id
      AND sms_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON sms_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sms_conversations
      WHERE sms_conversations.id = sms_messages.conversation_id
      AND sms_conversations.user_id = auth.uid()
    )
  );

-- =====================================================
-- PART 5: Functions and Triggers
-- =====================================================

-- Function to update conversation after new message
CREATE OR REPLACE FUNCTION update_conversation_after_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sms_conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    unread_count = CASE 
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation after message insert
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON sms_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_after_message();

-- Function to reset unread count
CREATE OR REPLACE FUNCTION reset_conversation_unread_count(conv_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sms_conversations
  SET unread_count = 0, updated_at = NOW()
  WHERE id = conv_id AND user_id = auth.uid();
  
  UPDATE sms_messages
  SET read = true
  WHERE conversation_id = conv_id 
  AND direction = 'inbound' 
  AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION QUERIES (Run these to check)
-- =====================================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'sms_conversations', 'sms_messages');

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('phone_numbers', 'communication_logs', 'message_templates', 'sms_conversations', 'sms_messages');
