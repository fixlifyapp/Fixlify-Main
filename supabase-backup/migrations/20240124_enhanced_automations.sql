-- Enhanced Automation System Tables

-- Create automation_templates table if not exists
CREATE TABLE IF NOT EXISTS automation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    icon VARCHAR(50),
    preview_image_url TEXT,
    template_config JSONB NOT NULL DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    success_rate NUMERIC(5,2),
    average_revenue NUMERIC(10,2),
    estimated_time_saved VARCHAR(50),
    required_integrations TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_workflows table if not exists
CREATE TABLE IF NOT EXISTS automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'draft', 'archived')),
    category VARCHAR(50),
    template_id UUID REFERENCES automation_templates(id) ON DELETE SET NULL,
    visual_config JSONB,
    performance_metrics JSONB DEFAULT '{}',
    last_triggered_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_history table if not exists
CREATE TABLE IF NOT EXISTS automation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
    trigger_id UUID REFERENCES automation_triggers(id) ON DELETE SET NULL,
    execution_status VARCHAR(20) CHECK (execution_status IN ('success', 'failed', 'partial')),
    execution_time_ms INTEGER,
    error_details JSONB,
    variables_used JSONB,
    actions_executed JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create communication_templates table if not exists
CREATE TABLE IF NOT EXISTS communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('sms', 'email', 'voice')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB,
    preview_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_template_usage table for analytics
CREATE TABLE IF NOT EXISTS automation_template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES automation_templates(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to communication_logs if they don't exist
ALTER TABLE communication_logs 
ADD COLUMN IF NOT EXISTS created_by_automation UUID REFERENCES automation_workflows(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS response_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_received_at TIMESTAMPTZ;

-- Add missing columns to jobs if they don't exist  
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS created_by_automation UUID REFERENCES automation_workflows(id) ON DELETE SET NULL;

-- Add missing columns to tasks if they don't exist
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS created_by_automation UUID REFERENCES automation_workflows(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_history_workflow_id ON automation_history(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_history_created_at ON automation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_automation_templates_category ON automation_templates(category);
CREATE INDEX IF NOT EXISTS idx_automation_templates_usage ON automation_templates(usage_count);
CREATE INDEX IF NOT EXISTS idx_communication_logs_automation ON communication_logs(created_by_automation);

-- Create RPC function to increment workflow metrics
CREATE OR REPLACE FUNCTION increment_workflow_metrics(
    workflow_id UUID,
    execution_count INT DEFAULT 0,
    success_count INT DEFAULT 0
)
RETURNS void AS $$
BEGIN
    UPDATE automation_workflows
    SET 
        execution_count = automation_workflows.execution_count + increment_workflow_metrics.execution_count,
        success_count = automation_workflows.success_count + increment_workflow_metrics.success_count,
        last_triggered_at = NOW()
    WHERE id = workflow_id;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_automation_templates_updated_at BEFORE UPDATE ON automation_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at BEFORE UPDATE ON automation_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_template_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_templates
CREATE POLICY "Public templates are viewable by all authenticated users" ON automation_templates
    FOR SELECT USING (auth.role() = 'authenticated' AND (organization_id IS NULL OR is_featured = true));

CREATE POLICY "Organization templates are viewable by organization members" ON automation_templates
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_templates.organization_id
    ));

CREATE POLICY "Organization members can create templates" ON automation_templates
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_templates.organization_id
    ));

CREATE POLICY "Organization members can update their templates" ON automation_templates
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_templates.organization_id
    ));

-- RLS Policies for automation_workflows
CREATE POLICY "Users can view their organization's workflows" ON automation_workflows
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_workflows.organization_id
    ));

CREATE POLICY "Users can create workflows for their organization" ON automation_workflows
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_workflows.organization_id
    ));

CREATE POLICY "Users can update their organization's workflows" ON automation_workflows
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_workflows.organization_id
    ));

CREATE POLICY "Users can delete their organization's workflows" ON automation_workflows
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_workflows.organization_id
    ));

-- RLS Policies for automation_history
CREATE POLICY "Users can view their organization's automation history" ON automation_history
    FOR SELECT USING (workflow_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "System can insert automation history" ON automation_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for communication_templates
CREATE POLICY "Users can view their organization's communication templates" ON communication_templates
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_templates.organization_id
    ));

CREATE POLICY "Users can create communication templates" ON communication_templates
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_templates.organization_id
    ));

CREATE POLICY "Users can update their organization's communication templates" ON communication_templates
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_templates.organization_id
    ));

CREATE POLICY "Users can delete their organization's communication templates" ON communication_templates
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_templates.organization_id
    ));

-- RLS Policies for automation_template_usage
CREATE POLICY "Organizations can track their template usage" ON automation_template_usage
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_template_usage.organization_id
    ));

CREATE POLICY "Organizations can view their template usage" ON automation_template_usage
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = automation_template_usage.organization_id
    ));

-- Insert some default automation templates
INSERT INTO automation_templates (name, description, category, icon, template_config, is_featured, tags, estimated_time_saved)
VALUES 
(
    'Missed Call Follow-up',
    'Automatically send SMS to customers who called when you were unavailable',
    'missed_call',
    '📞',
    '{
        "triggers": [{
            "trigger_type": "event",
            "event_type": "missed_call",
            "conditions": {}
        }],
        "actions": [{
            "action_type": "send_sms",
            "action_config": {
                "message": "Hi {{client.name}}, we missed your call. We''ll get back to you as soon as possible. Reply URGENT if you need immediate assistance.",
                "delay": 0
            }
        }]
    }',
    true,
    ARRAY['hvac', 'plumbing', 'electrical', 'communication'],
    '5 minutes per call'
),
(
    '24-Hour Appointment Reminder',
    'Send appointment reminders 24 hours before scheduled service',
    'appointment',
    '📅',
    '{
        "triggers": [{
            "trigger_type": "schedule",
            "schedule_config": {
                "type": "before_appointment",
                "hours_before": 24
            }
        }],
        "actions": [{
            "action_type": "send_sms",
            "action_config": {
                "message": "Hi {{client.name}}, this is a reminder about your {{job.title}} appointment tomorrow at {{job.scheduled_time}}. Reply C to confirm or R to reschedule.",
                "delay": 0
            }
        }]
    }',
    true,
    ARRAY['hvac', 'plumbing', 'electrical', 'appointment'],
    '10 minutes per appointment'
),
(
    'Invoice Payment Reminder',
    'Send payment reminders for overdue invoices',
    'payment',
    '💰',
    '{
        "triggers": [{
            "trigger_type": "schedule",
            "schedule_config": {
                "type": "after_invoice_due",
                "days_after": 3
            }
        }],
        "actions": [{
            "action_type": "send_email",
            "action_config": {
                "subject": "Payment Reminder: Invoice #{{invoice.number}}",
                "content": "Dear {{client.name}},\\n\\nThis is a friendly reminder that invoice #{{invoice.number}} for {{invoice.total}} is now past due.\\n\\nPlease click here to pay online: {{invoice.payment_link}}\\n\\nThank you for your business!",
                "delay": 0
            }
        }]
    }',
    true,
    ARRAY['hvac', 'plumbing', 'electrical', 'payment', 'finance'],
    '15 minutes per invoice'
),
(
    'Post-Service Review Request',
    'Request reviews from satisfied customers after job completion',
    'review',
    '⭐',
    '{
        "triggers": [{
            "trigger_type": "event",
            "event_type": "job_completed",
            "conditions": {
                "job_status": "completed",
                "payment_status": "paid"
            }
        }],
        "actions": [{
            "action_type": "send_sms",
            "action_config": {
                "message": "Hi {{client.name}}, thank you for choosing {{company.name}}! We''d love to hear about your experience. Please leave us a review: {{review.link}}",
                "delay": 1440
            }
        }]
    }',
    true,
    ARRAY['hvac', 'plumbing', 'electrical', 'review', 'reputation'],
    '5 minutes per review'
)
ON CONFLICT DO NOTHING;