-- Phase 1: Database Schema Fixes for Jobs System
-- Add missing columns and fix schema inconsistencies

-- 1. Add missing service column to jobs table for backward compatibility
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS service TEXT;

-- 2. Add missing sent_at column to invoices table for document operations  
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- 3. Add missing sent_at column to estimates table for document operations
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- 4. Add missing ourPrice field to line_items table
ALTER TABLE line_items ADD COLUMN IF NOT EXISTS our_price NUMERIC DEFAULT 0;

-- 5. Add property-related fields to job_overview table
ALTER TABLE job_overview ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'Residential';
ALTER TABLE job_overview ADD COLUMN IF NOT EXISTS property_age TEXT;
ALTER TABLE job_overview ADD COLUMN IF NOT EXISTS property_size TEXT;
ALTER TABLE job_overview ADD COLUMN IF NOT EXISTS previous_service_date DATE;

-- 6. Create telnyx_calls table if it doesn't exist (referenced in dashboard widgets)
CREATE TABLE IF NOT EXISTS telnyx_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_control_id TEXT,
  phone_number TEXT,
  caller_phone TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'completed',
  duration INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  appointment_scheduled BOOLEAN DEFAULT FALSE,
  call_status TEXT DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add area_code column to phone_numbers table if missing
ALTER TABLE phone_numbers ADD COLUMN IF NOT EXISTS area_code TEXT;

-- 8. Update job_overview to have proper organization_id if missing
ALTER TABLE job_overview ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_service ON jobs(service);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sent_at ON invoices(sent_at);
CREATE INDEX IF NOT EXISTS idx_estimates_sent_at ON estimates(sent_at);
CREATE INDEX IF NOT EXISTS idx_telnyx_calls_user_id ON telnyx_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_job_overview_organization_id ON job_overview(organization_id);

-- 10. Add RLS policies for telnyx_calls table
ALTER TABLE telnyx_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call logs" ON telnyx_calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs" ON telnyx_calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call logs" ON telnyx_calls
  FOR UPDATE USING (auth.uid() = user_id);

-- 11. Create conversations table as sms_conversations alias for backward compatibility
CREATE OR REPLACE VIEW conversations AS 
SELECT 
  id,
  client_id,
  phone_number,
  last_message_at,
  last_message_preview,
  unread_count,
  created_at,
  updated_at
FROM sms_conversations;

-- 12. Update job_overview to populate organization_id from jobs
UPDATE job_overview 
SET organization_id = (
  SELECT j.organization_id 
  FROM jobs j 
  WHERE j.id = job_overview.job_id
) 
WHERE organization_id IS NULL;

-- 13. Populate service field in jobs from job_types or default
UPDATE jobs 
SET service = COALESCE(
  (SELECT jt.name FROM job_types jt WHERE jt.id::text = jobs.job_type),
  'General Service'
)
WHERE service IS NULL;