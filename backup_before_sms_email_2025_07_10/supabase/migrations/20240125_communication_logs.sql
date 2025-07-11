-- Create communication_logs table if not exists
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('sms', 'email', 'voice')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    to_number VARCHAR(50),
    from_number VARCHAR(50),
    to_email VARCHAR(255),
    from_email VARCHAR(255),
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50),
    external_id VARCHAR(255),
    provider VARCHAR(50),
    cost NUMERIC(10,4),
    error_details JSONB,
    metadata JSONB,
    created_by_automation UUID REFERENCES automation_workflows(id) ON DELETE SET NULL,
    response_received BOOLEAN DEFAULT false,
    response_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_communication_logs_org_id ON communication_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_communication_logs_external_id ON communication_logs(external_id);

-- Enable RLS
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
-- RLS Policies
CREATE POLICY "Users can view their organization's communication logs" ON communication_logs
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_logs.organization_id
    ));

CREATE POLICY "Users can create communication logs" ON communication_logs
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_logs.organization_id
    ));

CREATE POLICY "Users can update their organization's communication logs" ON communication_logs
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE organization_id = communication_logs.organization_id
    ));

-- Create trigger for updated_at
CREATE TRIGGER update_communication_logs_updated_at BEFORE UPDATE ON communication_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create automation_triggers table if not exists
CREATE TABLE IF NOT EXISTS automation_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(50),
    conditions JSONB DEFAULT '{}',
    schedule_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_actions table if not exists
CREATE TABLE IF NOT EXISTS automation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB DEFAULT '{}',
    sequence_order INTEGER NOT NULL,
    delay_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_automation_triggers_automation_id ON automation_triggers(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_actions_automation_id ON automation_actions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_actions_sequence ON automation_actions(sequence_order);

-- Enable RLS
ALTER TABLE automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_triggers
CREATE POLICY "Users can view their organization's triggers" ON automation_triggers
    FOR SELECT USING (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can create triggers" ON automation_triggers
    FOR INSERT WITH CHECK (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can update triggers" ON automation_triggers
    FOR UPDATE USING (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete triggers" ON automation_triggers
    FOR DELETE USING (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));
-- RLS Policies for automation_actions
CREATE POLICY "Users can view their organization's actions" ON automation_actions
    FOR SELECT USING (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can create actions" ON automation_actions
    FOR INSERT WITH CHECK (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can update actions" ON automation_actions
    FOR UPDATE USING (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete actions" ON automation_actions
    FOR DELETE USING (automation_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));