-- Automation System Database Consolidation
-- This script consolidates the 16 automation tables into 3 core tables

-- 1. First, backup any important data from old tables
-- (Run these queries to check what data exists)

-- Check what tables have data
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.tables t2 
        WHERE t2.table_name = t1.table_name) as has_data
FROM information_schema.tables t1
WHERE table_schema = 'public' 
AND table_name LIKE '%automation%'
ORDER BY table_name;

-- 2. Core tables we're keeping:
-- - automation_workflows (main automation definitions)
-- - automation_execution_logs (execution history)
-- - automation_templates (pre-built templates)

-- 3. Ensure core tables have all needed columns
ALTER TABLE automation_workflows 
ADD COLUMN IF NOT EXISTS workflow_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger_type ON automation_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_organization ON automation_workflows(organization_id);

CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_workflow ON automation_execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_status ON automation_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_created ON automation_execution_logs(created_at);

-- 5. Function to safely migrate data from old tables
CREATE OR REPLACE FUNCTION migrate_automation_data()
RETURNS void AS $$
BEGIN
  -- Migrate from automations table if it exists and has different structure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automations') THEN
    INSERT INTO automation_workflows (
      name, description, trigger_type, status, created_by, organization_id,
      workflow_config, trigger_config
    )
    SELECT 
      name, description, trigger_type, 
      CASE WHEN enabled THEN 'active' ELSE 'inactive' END,
      created_by, organization_id,
      jsonb_build_object(
        'triggers', COALESCE(triggers, '[]'::jsonb),
        'steps', COALESCE(actions, '[]'::jsonb)
      ),
      COALESCE(trigger_conditions, '{}'::jsonb)
    FROM automations a
    WHERE NOT EXISTS (
      SELECT 1 FROM automation_workflows w 
      WHERE w.name = a.name AND w.organization_id = a.organization_id
    );
  END IF;
  
  -- Migrate execution logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_runs') THEN
    INSERT INTO automation_execution_logs (
      workflow_id, status, started_at, completed_at, error_message
    )
    SELECT 
      automation_id, status, created_at, completed_at, error
    FROM automation_runs r
    WHERE NOT EXISTS (
      SELECT 1 FROM automation_execution_logs l 
      WHERE l.workflow_id = r.automation_id 
      AND l.started_at = r.created_at
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Run migration
SELECT migrate_automation_data();

-- 7. Create helper views for easier querying
CREATE OR REPLACE VIEW automation_workflow_stats AS
SELECT 
  w.id,
  w.name,
  w.status,
  w.trigger_type,
  w.execution_count,
  w.success_count,
  CASE 
    WHEN w.execution_count > 0 
    THEN ROUND((w.success_count::numeric / w.execution_count) * 100, 2)
    ELSE 0 
  END as success_rate,
  w.last_executed_at,
  COUNT(l.id) as recent_executions,
  COUNT(CASE WHEN l.status = 'completed' THEN 1 END) as recent_successes
FROM automation_workflows w
LEFT JOIN automation_execution_logs l ON w.id = l.workflow_id 
  AND l.created_at > NOW() - INTERVAL '7 days'
GROUP BY w.id;

-- 8. Drop redundant tables (ONLY after verifying data is migrated!)
-- IMPORTANT: Uncomment these ONLY after confirming all data is safely migrated
/*
DROP TABLE IF EXISTS automation_actions CASCADE;
DROP TABLE IF EXISTS automation_conditions CASCADE;
DROP TABLE IF EXISTS automation_triggers CASCADE;
DROP TABLE IF EXISTS automation_messages CASCADE;
DROP TABLE IF EXISTS automation_message_templates CASCADE;
DROP TABLE IF EXISTS automation_message_queue CASCADE;
DROP TABLE IF EXISTS automation_variables CASCADE;
DROP TABLE IF EXISTS automation_performance CASCADE;
DROP TABLE IF EXISTS automation_history CASCADE;
DROP TABLE IF EXISTS automation_runs CASCADE;
DROP TABLE IF EXISTS automation_communication_logs CASCADE;
DROP TABLE IF EXISTS automation_template_usage CASCADE;
DROP TABLE IF EXISTS automations CASCADE;
*/

-- 9. Grant appropriate permissions
GRANT ALL ON automation_workflows TO authenticated;
GRANT ALL ON automation_execution_logs TO authenticated;
GRANT ALL ON automation_templates TO authenticated;
GRANT SELECT ON automation_workflow_stats TO authenticated;

-- 10. Add RLS policies if not exists
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;

-- Workflow policies
CREATE POLICY "Users can view their org workflows" ON automation_workflows
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create workflows" ON automation_workflows
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their org workflows" ON automation_workflows
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their org workflows" ON automation_workflows
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));