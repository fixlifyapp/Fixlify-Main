-- Comprehensive Workflow Automation System Tables
-- This migration creates tables for the advanced multi-step workflow automation

-- Create comprehensive_workflows table
CREATE TABLE IF NOT EXISTS comprehensive_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES profiles(organization_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger configuration (supports multiple triggers)
    triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Workflow steps (array of step configurations)
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Settings and timing
    settings JSONB NOT NULL DEFAULT '{
        "timezone": "customer_local",
        "businessHours": {
            "enabled": true,
            "start": "09:00",
            "end": "17:00",
            "days": ["mon", "tue", "wed", "thu", "fri"]
        },
        "quietHours": {
            "enabled": true,
            "start": "21:00",
            "end": "08:00"
        },
        "advancedTriggers": {}
    }'::jsonb,
    
    -- Status and metadata
    enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_workflow_name_per_org UNIQUE (organization_id, name)
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES comprehensive_workflows(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES profiles(organization_id),
    
    -- Execution details
    trigger_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    current_step INTEGER DEFAULT 0,
    
    -- Execution log (array of step results)
    execution_log JSONB DEFAULT '[]'::jsonb,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Error tracking
    error TEXT,
    error_step INTEGER,
    
    -- Context data (customer info, job info, etc.)
    context_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflow_templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    
    -- Template configuration
    workflow_config JSONB NOT NULL,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES profiles(organization_id),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_template_name UNIQUE (name, organization_id)
);

-- Create workflow_step_results table for detailed step tracking
CREATE TABLE IF NOT EXISTS workflow_step_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    step_name VARCHAR(255),
    step_type VARCHAR(50),
    
    -- Result details
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Input/Output
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    
    -- Error tracking
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_comprehensive_workflows_org ON comprehensive_workflows(organization_id);
CREATE INDEX idx_comprehensive_workflows_enabled ON comprehensive_workflows(enabled);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_started ON workflow_executions(started_at DESC);
CREATE INDEX idx_workflow_step_results_execution ON workflow_step_results(execution_id);
CREATE INDEX idx_workflow_templates_public ON workflow_templates(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE comprehensive_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comprehensive_workflows
CREATE POLICY "Users can view own org workflows" ON comprehensive_workflows
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create workflows" ON comprehensive_workflows
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update own org workflows" ON comprehensive_workflows
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete own org workflows" ON comprehensive_workflows
    FOR DELETE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view own org executions" ON workflow_executions
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create executions" ON workflow_executions
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for workflow_templates
CREATE POLICY "Users can view public templates" ON workflow_templates
    FOR SELECT USING (is_public = true OR organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create templates" ON workflow_templates
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update own templates" ON workflow_templates
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for workflow_step_results
CREATE POLICY "Users can view own org step results" ON workflow_step_results
    FOR SELECT USING (execution_id IN (
        SELECT id FROM workflow_executions WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Create functions for workflow execution
CREATE OR REPLACE FUNCTION execute_workflow_step(
    p_execution_id UUID,
    p_step_index INTEGER,
    p_step_config JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_step_type TEXT;
BEGIN
    -- Extract step type
    v_step_type := p_step_config->>'type';
    
    -- Create step result record
    INSERT INTO workflow_step_results (
        execution_id,
        step_index,
        step_name,
        step_type,
        status,
        input_data
    ) VALUES (
        p_execution_id,
        p_step_index,
        p_step_config->>'name',
        v_step_type,
        'running',
        p_step_config->'config'
    );
    
    -- Here you would implement the actual step execution logic
    -- For now, we'll just return a success result
    v_result := jsonb_build_object(
        'success', true,
        'message', format('Step %s executed successfully', p_step_config->>'name')
    );
    
    -- Update step result
    UPDATE workflow_step_results
    SET status = 'completed',
        completed_at = NOW(),
        output_data = v_result
    WHERE execution_id = p_execution_id
    AND step_index = p_step_index;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comprehensive_workflows_timestamp
    BEFORE UPDATE ON comprehensive_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_executions_timestamp
    BEFORE UPDATE ON workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_timestamp
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default workflow templates
INSERT INTO workflow_templates (name, description, category, is_public, workflow_config) VALUES
(
    'New Client Onboarding',
    'Multi-step workflow for welcoming and educating new clients',
    'onboarding',
    true,
    '{
        "triggers": [{
            "type": "customer_created",
            "name": "New Customer",
            "config": {}
        }],
        "steps": [
            {
                "type": "email",
                "name": "Send Welcome Email",
                "config": {
                    "template": "welcome_email",
                    "subject": "Welcome to {{company_name}}!",
                    "message": "Thank you for choosing us. Here''s what to expect..."
                }
            },
            {
                "type": "delay",
                "name": "Wait 2 Days",
                "config": {
                    "delayValue": 2,
                    "delayUnit": "days"
                }
            },
            {
                "type": "sms",
                "name": "Service Guide SMS",
                "config": {
                    "message": "Hi {{first_name}}, here''s your service guide: {{guide_link}}"
                }
            }
        ],
        "settings": {
            "timezone": "customer_local",
            "businessHours": {
                "enabled": true,
                "start": "09:00",
                "end": "17:00",
                "days": ["mon", "tue", "wed", "thu", "fri"]
            }
        }
    }'
),
(
    'Invoice Thank You with Gift Card',
    'Automatically send thank you with gift card for large invoices',
    'loyalty',
    true,
    '{
        "triggers": [{
            "type": "invoice_threshold",
            "name": "Invoice Above Threshold",
            "config": {
                "threshold": 500
            }
        }],
        "steps": [
            {
                "type": "gift_card",
                "name": "Send Gift Card",
                "config": {
                    "giftCardAmount": 25,
                    "message": "Thank you for your business!"
                }
            },
            {
                "type": "email",
                "name": "Send Thank You Email",
                "config": {
                    "subject": "Thank You - Gift Card Enclosed!",
                    "message": "We appreciate your business! Please enjoy this $25 gift card as our thank you."
                }
            }
        ],
        "settings": {
            "timezone": "customer_local",
            "businessHours": {
                "enabled": true,
                "start": "09:00",
                "end": "17:00",
                "days": ["mon", "tue", "wed", "thu", "fri"]
            }
        }
    }'
);