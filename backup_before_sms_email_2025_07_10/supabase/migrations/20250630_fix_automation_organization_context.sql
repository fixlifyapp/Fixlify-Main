-- Migration to ensure automation_workflows have both organization_id and user_id
-- This helps with backward compatibility during the transition

-- First, update records that have user_id but no organization_id
UPDATE automation_workflows aw
SET organization_id = p.organization_id
FROM profiles p
WHERE aw.user_id = p.id
  AND aw.organization_id IS NULL
  AND p.organization_id IS NOT NULL;

-- Then, update records that have organization_id but no user_id
-- Use the created_by field if available, otherwise use the first admin of the organization
UPDATE automation_workflows aw
SET user_id = COALESCE(
  aw.created_by,
  (SELECT id FROM profiles WHERE organization_id = aw.organization_id AND role = 'admin' LIMIT 1)
)
WHERE aw.organization_id IS NOT NULL
  AND aw.user_id IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_user_id ON automation_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_user ON automation_workflows(organization_id, user_id);
