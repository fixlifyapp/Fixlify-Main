-- Fix automation table relationships and RLS policies

-- First, ensure the profiles table has the organization_id column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Update the organization_id to be the user_id if not set
UPDATE profiles 
SET organization_id = user_id 
WHERE organization_id IS NULL;

-- Drop existing foreign key constraints if they exist
ALTER TABLE automation_workflows 
DROP CONSTRAINT IF EXISTS automation_workflows_organization_id_fkey;

ALTER TABLE automation_templates 
DROP CONSTRAINT IF EXISTS automation_templates_organization_id_fkey;

-- Update automation_workflows to use UUID for organization_id if not already
ALTER TABLE automation_workflows 
ALTER COLUMN organization_id TYPE UUID USING organization_id::UUID;

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Drop and recreate the get_user_organization_id function
DROP FUNCTION IF EXISTS get_user_organization_id();

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization_id from profiles table
  SELECT organization_id INTO org_id
  FROM profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- If not found or null, use the user_id as organization_id
  IF org_id IS NULL THEN
    RETURN auth.uid();
  END IF;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their organization's workflows" ON automation_workflows;
DROP POLICY IF EXISTS "Users can create workflows for their organization" ON automation_workflows;
DROP POLICY IF EXISTS "Users can update their organization's workflows" ON automation_workflows;
DROP POLICY IF EXISTS "Users can delete their organization's workflows" ON automation_workflows;

-- Create new RLS policies for automation_workflows
CREATE POLICY "Users can view their workflows" ON automation_workflows
  FOR SELECT USING (
    organization_id = auth.uid() OR 
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can create workflows" ON automation_workflows
  FOR INSERT WITH CHECK (
    organization_id = auth.uid() OR 
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can update their workflows" ON automation_workflows
  FOR UPDATE USING (
    organization_id = auth.uid() OR 
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can delete their workflows" ON automation_workflows
  FOR DELETE USING (
    organization_id = auth.uid() OR 
    organization_id = get_user_organization_id()
  );

-- Drop existing RLS policies for automation_history
DROP POLICY IF EXISTS "Users can view their workflow history" ON automation_history;
DROP POLICY IF EXISTS "Users can insert history for their workflows" ON automation_history;

-- Create new RLS policies for automation_history
CREATE POLICY "Users can view their workflow history" ON automation_history
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM automation_workflows 
      WHERE organization_id = auth.uid() OR 
            organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can insert history" ON automation_history
  FOR INSERT WITH CHECK (
    workflow_id IN (
      SELECT id FROM automation_workflows 
      WHERE organization_id = auth.uid() OR 
            organization_id = get_user_organization_id()
    )
  );

-- Ensure service role can manage automation history
CREATE POLICY "Service role can manage history" ON automation_history
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON automation_workflows TO authenticated;
GRANT ALL ON automation_templates TO authenticated;
GRANT ALL ON automation_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;

-- Add a helper function to get workflows for current user
CREATE OR REPLACE FUNCTION get_user_workflows()
RETURNS SETOF automation_workflows AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM automation_workflows
  WHERE organization_id = auth.uid() 
     OR organization_id = get_user_organization_id()
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_workflows() TO authenticated; 