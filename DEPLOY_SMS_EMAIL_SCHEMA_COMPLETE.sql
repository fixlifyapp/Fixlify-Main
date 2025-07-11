-- SMS/Email Complete Schema Deployment
-- Run this entire script in Supabase SQL Editor
-- https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new

-- Drop existing tables if needed (uncomment if you want to start fresh)
-- DROP TABLE IF EXISTS communication_logs CASCADE;
-- DROP TABLE IF EXISTS phone_numbers CASCADE;
-- DROP TABLE IF EXISTS message_templates CASCADE;
-- DROP TABLE IF EXISTS organization_communication_settings CASCADE;

-- STEP 1: Create Tables
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
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'bounced')
  )
);

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email')),
  category TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

CREATE TABLE IF NOT EXISTS organization_communication_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL UNIQUE,
  default_from_email TEXT,
  default_from_name TEXT,
  mailgun_domain TEXT,
  sms_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create Indexes
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone_number ON phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_client_id ON communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_job_id ON communication_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);

-- STEP 3: Enable RLS
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_communication_settings ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create RLS Policies
-- Phone numbers policies
CREATE POLICY "Users can view own phone numbers" ON phone_numbers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phone numbers" ON phone_numbers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own phone numbers" ON phone_numbers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own phone numbers" ON phone_numbers
  FOR DELETE USING (auth.uid() = user_id);

-- Communication logs policies
CREATE POLICY "Users can view own communications" ON communication_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own communications" ON communication_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Message templates policies
CREATE POLICY "Users can view own templates" ON message_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON message_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON message_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON message_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Organization settings policy
CREATE POLICY "Users can view organization settings" ON organization_communication_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organization_communication_settings.organization_id
    )
  );

-- STEP 5: Create Functions
CREATE OR REPLACE FUNCTION get_user_primary_phone(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT phone_number FROM phone_numbers
  WHERE user_id = p_user_id AND is_active = true
  ORDER BY is_primary DESC, created_at DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_communication(
  p_user_id UUID,
  p_type TEXT,
  p_from TEXT,
  p_to TEXT,
  p_content TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO communication_logs (
    user_id, type, direction, from_address, to_address, content, metadata
  ) VALUES (
    p_user_id, p_type, 'outbound', p_from, p_to, p_content, p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Create Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_phone_numbers_updated_at 
  BEFORE UPDATE ON phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
  BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_communication_settings_updated_at 
  BEFORE UPDATE ON organization_communication_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 7: Grant Permissions
GRANT ALL ON phone_numbers TO authenticated;
GRANT ALL ON communication_logs TO authenticated;
GRANT ALL ON message_templates TO authenticated;
GRANT ALL ON organization_communication_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_primary_phone TO authenticated;
GRANT EXECUTE ON FUNCTION log_communication TO authenticated;

-- STEP 8: Verify Deployment
SELECT 'Deployment Complete!' as status;
SELECT table_name, 'Created' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
ORDER BY table_name;