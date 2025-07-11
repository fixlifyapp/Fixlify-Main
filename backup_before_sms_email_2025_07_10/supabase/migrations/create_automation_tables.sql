-- Complete database setup for automations
-- Run this in your Supabase SQL editor

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS automation_history CASCADE;
DROP TABLE IF EXISTS automation_workflows CASCADE;
DROP TABLE IF EXISTS automation_templates CASCADE;

-- Create automation templates table
CREATE TABLE automation_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  template_config JSONB,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  average_revenue DECIMAL(10,2),
  estimated_time_saved VARCHAR(100),
  required_integrations TEXT[],
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation workflows table
CREATE TABLE automation_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft', 'archived')),
  category VARCHAR(100),
  template_id UUID REFERENCES automation_templates(id),
  visual_config JSONB,
  performance_metrics JSONB,
  last_triggered_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation history table
CREATE TABLE automation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  execution_status VARCHAR(50) CHECK (execution_status IN ('success', 'failed', 'partial')),
  execution_time_ms INTEGER,
  error_details JSONB,
  variables_used JSONB,
  actions_executed JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_history ENABLE ROW LEVEL SECURITY;

-- Create function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  -- First try to get from profiles table
  RETURN (
    SELECT organization_id 
    FROM profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
  -- If not found, return the user_id as organization_id
  -- This handles cases where organization_id might be the same as user_id
EXCEPTION
  WHEN OTHERS THEN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for automation_workflows
CREATE POLICY "Users can view their organization's workflows" ON automation_workflows
  FOR SELECT USING (
    organization_id = COALESCE(get_user_organization_id(), auth.uid())
  );

CREATE POLICY "Users can create workflows for their organization" ON automation_workflows
  FOR INSERT WITH CHECK (
    organization_id = COALESCE(get_user_organization_id(), auth.uid())
  );

CREATE POLICY "Users can update their organization's workflows" ON automation_workflows
  FOR UPDATE USING (
    organization_id = COALESCE(get_user_organization_id(), auth.uid())
  );

CREATE POLICY "Users can delete their organization's workflows" ON automation_workflows
  FOR DELETE USING (
    organization_id = COALESCE(get_user_organization_id(), auth.uid())
  );

-- RLS Policies for automation_templates (everyone can view)
CREATE POLICY "Everyone can view templates" ON automation_templates
  FOR SELECT USING (true);

-- RLS Policies for automation_history
CREATE POLICY "Users can view their workflow history" ON automation_history
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM automation_workflows 
      WHERE organization_id = COALESCE(get_user_organization_id(), auth.uid())
    )
  );

CREATE POLICY "Users can insert history for their workflows" ON automation_history
  FOR INSERT WITH CHECK (
    workflow_id IN (
      SELECT id FROM automation_workflows 
      WHERE organization_id = COALESCE(get_user_organization_id(), auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX idx_automation_history_workflow_id ON automation_history(workflow_id);
CREATE INDEX idx_automation_history_created_at ON automation_history(created_at DESC);

-- Insert sample automation templates
INSERT INTO automation_templates (name, description, category, template_config, required_integrations, tags, is_featured)
VALUES 
(
  'Welcome Email Series',
  'Automatically send a series of welcome emails to new clients',
  'marketing',
  '{
    "triggers": [{
      "type": "client_created",
      "name": "New Client Added"
    }],
    "actions": [{
      "type": "send_email",
      "delay": "0",
      "template": "welcome_email_1"
    }, {
      "type": "send_email",
      "delay": "3d",
      "template": "welcome_email_2"
    }, {
      "type": "send_email",
      "delay": "7d",
      "template": "welcome_email_3"
    }]
  }',
  ARRAY['mailgun'],
  ARRAY['email', 'onboarding', 'marketing'],
  true
),
(
  'Appointment Reminder SMS',
  'Send SMS reminders 24 hours before scheduled appointments',
  'reminders',
  '{
    "triggers": [{
      "type": "scheduled",
      "timing": "24h_before_appointment"
    }],
    "actions": [{
      "type": "send_sms",
      "template": "appointment_reminder"
    }]
  }',
  ARRAY['telnyx'],
  ARRAY['sms', 'appointments', 'reminders'],
  true
),
(
  'Follow-up After Service',
  'Automatically follow up with clients after job completion',
  'follow-ups',
  '{
    "triggers": [{
      "type": "job_completed",
      "name": "Job Marked Complete"
    }],
    "actions": [{
      "type": "wait",
      "duration": "1d"
    }, {
      "type": "send_email",
      "template": "service_followup"
    }, {
      "type": "send_sms",
      "template": "review_request",
      "delay": "3d"
    }]
  }',
  ARRAY['mailgun', 'telnyx'],
  ARRAY['followup', 'reviews', 'customer-satisfaction'],
  true
),
(
  'Missed Call Auto-Response',
  'Automatically text back when you miss a call from a client',
  'calls',
  '{
    "triggers": [{
      "type": "missed_call",
      "source": "telnyx"
    }],
    "actions": [{
      "type": "send_sms",
      "template": "missed_call_response",
      "immediate": true
    }]
  }',
  ARRAY['telnyx'],
  ARRAY['calls', 'sms', 'response'],
  false
),
(
  'Invoice Payment Reminder',
  'Send payment reminders for overdue invoices',
  'follow-ups',
  '{
    "triggers": [{
      "type": "invoice_overdue",
      "days": 3
    }],
    "actions": [{
      "type": "send_email",
      "template": "payment_reminder"
    }, {
      "type": "send_sms",
      "template": "payment_reminder_sms",
      "delay": "2d"
    }]
  }',
  ARRAY['mailgun', 'telnyx'],
  ARRAY['invoicing', 'payments', 'reminders'],
  false
);

-- Grant necessary permissions
GRANT ALL ON automation_workflows TO authenticated;
GRANT ALL ON automation_templates TO authenticated;
GRANT ALL ON automation_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;

-- Create a sample workflow for the current user
DO $$
DECLARE
  user_org_id UUID;
BEGIN
  -- Get the organization_id for the current user
  SELECT COALESCE(organization_id, user_id) INTO user_org_id
  FROM profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Only insert if we found a user
  IF user_org_id IS NOT NULL THEN
    INSERT INTO automation_workflows (
      organization_id,
      name,
      description,
      status,
      category,
      visual_config,
      execution_count,
      success_count
    )
    VALUES (
      user_org_id,
      'Welcome New Clients',
      'Automatically send welcome emails to new clients when they are added to the system',
      'active',
      'marketing',
      '{
        "nodes": [
          {
            "id": "trigger-1",
            "type": "trigger",
            "data": {
              "type": "client_created",
              "label": "New Client Added"
            },
            "position": {"x": 100, "y": 100}
          },
          {
            "id": "action-1",
            "type": "action",
            "data": {
              "type": "send_email",
              "label": "Send Welcome Email",
              "template": "welcome_email"
            },
            "position": {"x": 300, "y": 100}
          }
        ],
        "edges": [
          {
            "id": "edge-1",
            "source": "trigger-1",
            "target": "action-1"
          }
        ]
      }',
      0,
      0
    );
  END IF;
END $$;