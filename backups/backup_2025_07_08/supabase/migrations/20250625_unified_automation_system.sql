-- Enhanced Automation System - Unified Migration
-- This migration creates the complete automation system infrastructure

-- Create automation_workflows table (enhanced version)
DROP TABLE IF EXISTS automation_workflows CASCADE;
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft', 'archived')),
    
    -- Trigger Configuration
    trigger_type VARCHAR(50) NOT NULL,
    trigger_conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Action Configuration
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Conditions (optional)
    conditions JSONB DEFAULT '{"operator": "AND", "rules": []}'::jsonb,
    
    -- Delivery Window Settings
    delivery_window JSONB DEFAULT '{
        "businessHoursOnly": false,
        "allowedDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        "timeRange": {"start": "09:00", "end": "17:00"}
    }'::jsonb,
    
    -- Multi-Channel Configuration
    multi_channel_config JSONB DEFAULT '{
        "primaryChannel": "sms",
        "fallbackEnabled": false,
        "fallbackChannel": "email",
        "fallbackDelayHours": 2
    }'::jsonb,
    
    -- Performance Metrics
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    
    -- AI Enhancement Flag
    ai_enhanced BOOLEAN DEFAULT false,
    
    -- Legacy support (keep for compatibility)
    visual_config JSONB,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    category VARCHAR(50),
    template_id UUID,
    
    -- Audit fields
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_messages table for tracking sent messages
CREATE TABLE IF NOT EXISTS automation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    
    -- Contact Information
    contact_id UUID,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    
    -- Message Details
    primary_channel VARCHAR(10) NOT NULL CHECK (primary_channel IN ('sms', 'email')),
    primary_status VARCHAR(20) NOT NULL CHECK (primary_status IN ('sent', 'delivered', 'failed', 'pending')),
    fallback_channel VARCHAR(10) CHECK (fallback_channel IN ('sms', 'email')),
    fallback_status VARCHAR(20) CHECK (fallback_status IN ('scheduled', 'sent', 'delivered', 'failed')),
    fallback_scheduled_for TIMESTAMPTZ,
    
    -- Content
    message_content TEXT NOT NULL,
    subject VARCHAR(255),
    variables_used JSONB DEFAULT '{}'::jsonb,
    
    -- Tracking
    message_id VARCHAR(255), -- External provider message ID
    cost DECIMAL(10,4) DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_fallback_jobs table for scheduled fallbacks
CREATE TABLE IF NOT EXISTS automation_fallback_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    
    -- Contact and Message Details
    contact_id UUID,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    channel VARCHAR(10) NOT NULL CHECK (channel IN ('sms', 'email')),
    message TEXT NOT NULL,
    subject VARCHAR(255),
    variables_used JSONB DEFAULT '{}'::jsonb,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    processed_at TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_executions table for detailed execution tracking
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    
    -- Trigger Information
    trigger_event_id UUID, -- ID of the job, invoice, etc. that triggered this
    trigger_data JSONB DEFAULT '{}'::jsonb,
    
    -- Execution Details
    execution_status VARCHAR(20) NOT NULL CHECK (execution_status IN ('success', 'failed', 'partial')),
    execution_time_ms INTEGER,
    variables_resolved JSONB DEFAULT '{}'::jsonb,
    
    -- Results
    actions_executed JSONB DEFAULT '[]'::jsonb,
    messages_sent INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    
    -- Error handling
    error_details JSONB,
    
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_templates table for pre-built templates
CREATE TABLE IF NOT EXISTS automation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    
    -- Template Configuration
    template_config JSONB NOT NULL,
    
    -- Metadata
    icon VARCHAR(50),
    preview_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    -- Performance Data
    average_success_rate NUMERIC(5,2),
    average_response_rate NUMERIC(5,2),
    estimated_time_saved VARCHAR(50),
    estimated_revenue_impact NUMERIC(10,2),
    
    -- Requirements
    required_integrations TEXT[] DEFAULT '{}',
    business_types TEXT[] DEFAULT '{}', -- hvac, plumbing, electrical, etc.
    tags TEXT[] DEFAULT '{}',
    
    -- AI Enhancement
    ai_optimized BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_ai_insights table for AI recommendations
CREATE TABLE IF NOT EXISTS automation_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Insight Details
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('opportunity', 'optimization', 'warning', 'suggestion')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Action
    recommended_action JSONB,
    automation_template_id UUID REFERENCES automation_templates(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'acting', 'completed', 'dismissed')),
    acted_on_at TIMESTAMPTZ,
    
    -- AI Context
    ai_confidence NUMERIC(3,2), -- 0.00 to 1.00
    data_sources JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_status ON automation_workflows(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger ON automation_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_created ON automation_workflows(created_at);

CREATE INDEX IF NOT EXISTS idx_automation_messages_workflow ON automation_messages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_messages_org ON automation_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_messages_sent_at ON automation_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_automation_messages_status ON automation_messages(primary_status);

CREATE INDEX IF NOT EXISTS idx_automation_fallback_jobs_scheduled ON automation_fallback_jobs(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_automation_fallback_jobs_org ON automation_fallback_jobs(organization_id);

CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_org ON automation_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_executed_at ON automation_executions(executed_at);

CREATE INDEX IF NOT EXISTS idx_automation_templates_category ON automation_templates(category);
CREATE INDEX IF NOT EXISTS idx_automation_templates_featured ON automation_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_automation_templates_usage ON automation_templates(usage_count);

CREATE INDEX IF NOT EXISTS idx_automation_ai_insights_org_status ON automation_ai_insights(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_ai_insights_priority ON automation_ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_automation_ai_insights_created ON automation_ai_insights(created_at);

-- Insert default automation templates
INSERT INTO automation_templates (name, description, category, template_config, is_featured, icon, tags, business_types, ai_optimized) VALUES

-- Customer Communication Templates
('Appointment Reminder - 24 Hours', 'Send SMS reminder 24 hours before scheduled appointment', 'customer_communication', 
'{
  "name": "Appointment Reminder - 24 Hours",
  "description": "Automatic reminder sent day before scheduled appointment",
  "status": "draft",
  "trigger": {"type": "appointment_tomorrow", "conditions": []},
  "conditions": {"operator": "AND", "rules": []},
  "action": {
    "type": "send_sms",
    "config": {
      "message": "Hi {{client_name}}! Reminder: {{technician_name}} will be at {{client_address}} tomorrow at {{scheduled_time}} for {{job_title}}. Call {{company_phone}} if you need to reschedule."
    },
    "delay": {"type": "immediate"}
  },
  "deliveryWindow": {
    "businessHoursOnly": false,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  },
  "multiChannel": {
    "primaryChannel": "sms",
    "fallbackEnabled": false,
    "fallbackDelayHours": 2
  }
}'::jsonb, true, 'calendar', ARRAY['reminder', 'appointment', 'customer'], ARRAY['hvac', 'plumbing', 'electrical', 'general'], true),

('Job Completion Thank You', 'Thank you message sent after job completion', 'customer_communication',
'{
  "name": "Job Completion Thank You",
  "description": "Thank you message sent after job completion",
  "status": "draft",
  "trigger": {"type": "job_completed", "conditions": []},
  "conditions": {"operator": "AND", "rules": []},
  "action": {
    "type": "send_sms",
    "config": {
      "message": "Thank you {{client_name}}! Your {{job_title}} is complete. How did we do? Reply with feedback or call {{company_phone}} if you need anything."
    },
    "delay": {"type": "hours", "value": 2}
  },
  "deliveryWindow": {
    "businessHoursOnly": true,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "timeRange": {"start": "09:00", "end": "17:00"}
  },
  "multiChannel": {
    "primaryChannel": "sms",
    "fallbackEnabled": true,
    "fallbackChannel": "email",
    "fallbackDelayHours": 4
  }
}'::jsonb, true, 'check-circle', ARRAY['thank-you', 'completion', 'feedback'], ARRAY['hvac', 'plumbing', 'electrical', 'general'], true),

('7-Day Follow-up Check', 'Follow-up message 7 days after job completion', 'customer_communication',
'{
  "name": "7-Day Follow-up Check",
  "description": "Follow-up message sent 7 days after job completion",
  "status": "draft",
  "trigger": {"type": "job_anniversary", "conditions": []},
  "conditions": {"operator": "AND", "rules": [{"field": "days_since_completion", "operator": "equals", "value": "7"}]},
  "action": {
    "type": "send_sms",
    "config": {
      "message": "Hi {{client_name}}! Just checking - how is your {{job_title}} working? Any issues? Call {{company_phone}} if you need anything."
    },
    "delay": {"type": "immediate"}
  },
  "deliveryWindow": {
    "businessHoursOnly": true,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
    "timeRange": {"start": "09:00", "end": "17:00"}
  },
  "multiChannel": {
    "primaryChannel": "sms",
    "fallbackEnabled": false,
    "fallbackDelayHours": 2
  }
}'::jsonb, true, 'clock', ARRAY['follow-up', 'quality-check', 'maintenance'], ARRAY['hvac', 'plumbing', 'electrical'], true),

-- Payment & Billing Templates
('Payment Reminder - 3 Days Overdue', 'Professional payment reminder for overdue invoices', 'payment_billing',
'{
  "name": "Payment Reminder - 3 Days Overdue",
  "description": "Professional payment reminder sent 3 days after invoice due date",
  "status": "draft",
  "trigger": {"type": "invoice_overdue", "conditions": []},
  "conditions": {"operator": "AND", "rules": [{"field": "days_overdue", "operator": "equals", "value": "3"}]},
  "action": {
    "type": "send_email",
    "config": {
      "subject": "Payment Reminder - {{company_name}}",
      "message": "Hi {{client_name}},\\n\\nThis is a friendly reminder that your invoice for {{total_amount}} is now 3 days overdue.\\n\\nPlease visit {{payment_link}} to pay online or call {{company_phone}} if you have any questions.\\n\\nThank you,\\n{{company_name}}"
    },
    "delay": {"type": "immediate"}
  },
  "deliveryWindow": {
    "businessHoursOnly": true,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
    "timeRange": {"start": "09:00", "end": "17:00"}
  },
  "multiChannel": {
    "primaryChannel": "email",
    "fallbackEnabled": true,
    "fallbackChannel": "sms",
    "fallbackDelayHours": 24
  }
}'::jsonb, true, 'dollar-sign', ARRAY['payment', 'reminder', 'overdue'], ARRAY['hvac', 'plumbing', 'electrical', 'general'], true),

-- Lead Generation Templates
('Missed Call Auto-Response', 'Immediate response to missed calls with booking link', 'lead_generation',
'{
  "name": "Missed Call Auto-Response",
  "description": "Instant response when calls are missed",
  "status": "draft",
  "trigger": {"type": "missed_call", "conditions": []},
  "conditions": {"operator": "AND", "rules": []},
  "action": {
    "type": "send_sms",
    "config": {
      "message": "Hi! Sorry we missed your call. How can we help you today? Book online at {{booking_link}} or call back at {{company_phone}}."
    },
    "delay": {"type": "immediate"}
  },
  "deliveryWindow": {
    "businessHoursOnly": false,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  },
  "multiChannel": {
    "primaryChannel": "sms",
    "fallbackEnabled": false,
    "fallbackDelayHours": 2
  }
}'::jsonb, true, 'phone', ARRAY['missed-call', 'lead', 'booking'], ARRAY['hvac', 'plumbing', 'electrical', 'general'], true),

('Estimate Follow-up - 3 Days', 'Follow-up message 3 days after sending estimate', 'lead_generation',
'{
  "name": "Estimate Follow-up - 3 Days",
  "description": "Follow-up message sent 3 days after estimate is sent",
  "status": "draft",
  "trigger": {"type": "estimate_sent", "conditions": []},
  "conditions": {"operator": "AND", "rules": []},
  "action": {
    "type": "send_email",
    "config": {
      "subject": "Following up on your estimate - {{company_name}}",
      "message": "Hi {{client_name}},\\n\\nJust following up on the estimate we sent for {{job_title}}.\\n\\nDo you have any questions? We''re here to help!\\n\\nCall {{company_phone}} or reply to this email.\\n\\nBest regards,\\n{{company_name}}"
    },
    "delay": {"type": "days", "value": 3}
  },
  "deliveryWindow": {
    "businessHoursOnly": true,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
    "timeRange": {"start": "09:00", "end": "17:00"}
  },
  "multiChannel": {
    "primaryChannel": "email",
    "fallbackEnabled": true,
    "fallbackChannel": "sms",
    "fallbackDelayHours": 8
  }
}'::jsonb, true, 'mail', ARRAY['estimate', 'follow-up', 'sales'], ARRAY['hvac', 'plumbing', 'electrical', 'general'], true),

-- Maintenance & Upsell Templates
('Seasonal HVAC Maintenance Reminder', 'Seasonal maintenance reminder for HVAC systems', 'maintenance_upsell',
'{
  "name": "Seasonal HVAC Maintenance Reminder",
  "description": "Automatic seasonal maintenance reminder",
  "status": "draft",
  "trigger": {"type": "seasonal_reminder", "conditions": []},
  "conditions": {"operator": "AND", "rules": [{"field": "job_type", "operator": "contains", "value": "hvac"}]},
  "action": {
    "type": "send_email",
    "config": {
      "subject": "Time for your seasonal HVAC maintenance - {{company_name}}",
      "message": "Hi {{client_name}},\\n\\nWith the season changing, it''s time for your HVAC system maintenance!\\n\\nRegular maintenance helps:\\n• Prevent breakdowns\\n• Lower energy bills\\n• Extend system life\\n\\nSchedule now: {{booking_link}}\\n\\nCall {{company_phone}} with questions.\\n\\nBest regards,\\n{{company_name}}"
    },
    "delay": {"type": "immediate"}
  },
  "deliveryWindow": {
    "businessHoursOnly": true,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
    "timeRange": {"start": "09:00", "end": "17:00"}
  },
  "multiChannel": {
    "primaryChannel": "email",
    "fallbackEnabled": false,
    "fallbackDelayHours": 2
  }
}'::jsonb, true, 'calendar', ARRAY['seasonal', 'maintenance', 'hvac'], ARRAY['hvac'], true);

-- Insert some sample AI insights
INSERT INTO automation_ai_insights (organization_id, insight_type, title, description, priority, recommended_action, ai_confidence) VALUES

-- This would normally be populated by AI analysis, but adding samples for demonstration
('00000000-0000-0000-0000-000000000000', 'opportunity', 'High-Impact Automation Opportunity', 
'Based on your job completion data, adding a 7-day follow-up automation could increase customer satisfaction by 25% and catch service issues early.',
'high', 
'{"action": "create_automation", "template": "7-day-followup", "estimated_impact": "25% satisfaction increase"}'::jsonb,
0.89),

('00000000-0000-0000-0000-000000000000', 'optimization', 'Appointment Reminder Timing', 
'Your current appointment reminders have an 85% response rate. Sending them 24 hours earlier could improve this to 95%.',
'medium',
'{"action": "adjust_timing", "current": "same_day", "recommended": "24_hours", "expected_improvement": "10%"}'::jsonb,
0.76),

('00000000-0000-0000-0000-000000000000', 'suggestion', 'Payment Reminder Optimization', 
'Consider adding a friendly payment reminder 3 days after invoice due date. This typically reduces overdue payments by 40%.',
'medium',
'{"action": "create_automation", "template": "payment-reminder", "estimated_impact": "40% reduction in overdue"}'::jsonb,
0.82);

-- Add RLS (Row Level Security) policies
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_fallback_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_workflows
CREATE POLICY "Users can view own automations" ON automation_workflows
    FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Users can insert own automations" ON automation_workflows
    FOR INSERT WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update own automations" ON automation_workflows
    FOR UPDATE USING (organization_id = auth.uid());

CREATE POLICY "Users can delete own automations" ON automation_workflows
    FOR DELETE USING (organization_id = auth.uid());

-- RLS Policies for automation_messages
CREATE POLICY "Users can view own automation messages" ON automation_messages
    FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Users can insert own automation messages" ON automation_messages
    FOR INSERT WITH CHECK (organization_id = auth.uid());

-- RLS Policies for automation_fallback_jobs
CREATE POLICY "Users can view own fallback jobs" ON automation_fallback_jobs
    FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Users can insert own fallback jobs" ON automation_fallback_jobs
    FOR INSERT WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update own fallback jobs" ON automation_fallback_jobs
    FOR UPDATE USING (organization_id = auth.uid());

-- RLS Policies for automation_executions
CREATE POLICY "Users can view own automation executions" ON automation_executions
    FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Users can insert own automation executions" ON automation_executions
    FOR INSERT WITH CHECK (organization_id = auth.uid());

-- RLS Policies for automation_ai_insights
CREATE POLICY "Users can view own AI insights" ON automation_ai_insights
    FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Users can update own AI insights" ON automation_ai_insights
    FOR UPDATE USING (organization_id = auth.uid());

-- Templates are public (no RLS needed)
-- automation_templates table doesn't need RLS as templates are shared

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_automation_workflows_updated_at BEFORE UPDATE ON automation_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_templates_updated_at BEFORE UPDATE ON automation_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
