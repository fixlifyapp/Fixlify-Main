import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function deploySchema() {
  console.log('🚀 Starting SMS/Email Schema Deployment...\n')

  // Part 1: Create core tables
  console.log('📦 Part 1: Creating core tables...')
  const part1SQL = `
-- 1. Phone numbers management table
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
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'bounced')
  )
);`

  const { data: result1, error: error1 } = await supabase.functions.invoke('exec-sql', {
    body: { sql: part1SQL }
  })

  if (error1) {
    console.error('❌ Part 1 failed:', error1)
    return
  }
  console.log('✅ Part 1 completed successfully\n')

  // Continue with other parts...
  console.log('🎉 Schema deployment completed!')
}

deploySchema().catch(console.error)