-- Comprehensive fixes for messaging, products, and niche issues
-- Run this script in your Supabase SQL Editor

-- 1. Fix products RLS policies and ensure proper user_id handling
-- ================================================================

-- First ensure the products table has the user_id column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Update existing products to have user_id from created_by if not set
UPDATE products 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- For products without created_by, set to the current user
UPDATE products 
SET user_id = auth.uid()
WHERE user_id IS NULL AND auth.uid() IS NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can create their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Create new policies that handle user_id properly
CREATE POLICY "Users can view their products" ON products
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their products" ON products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Fix the niche data loading to properly set user_id
CREATE OR REPLACE FUNCTION ensure_niche_products_have_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not set, use the current user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  
  -- If created_by is not set, use user_id
  IF NEW.created_by IS NULL THEN
    NEW.created_by = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_products_user_id_trigger ON products;

-- Create trigger to ensure user_id is always set
CREATE TRIGGER ensure_products_user_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION ensure_niche_products_have_user_id();

-- Grant necessary permissions
GRANT ALL ON products TO authenticated;

-- 2. Apply automation fixes from previous session
-- ===============================================

-- Ensure the profiles table has the organization_id column
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

-- Drop existing RLS policies for automation_workflows
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

-- 3. Verify Telnyx phone number exists
-- ====================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM telnyx_phone_numbers WHERE status = 'active' LIMIT 1) THEN
    RAISE NOTICE 'No active Telnyx phone numbers found. You need to add one for SMS to work.';
  ELSE
    RAISE NOTICE 'Active Telnyx phone number found. SMS should work.';
  END IF;
END $$;

-- Show current active phone numbers
SELECT phone_number, status, connection_id 
FROM telnyx_phone_numbers 
WHERE status = 'active';

-- Done!
-- ====
-- After running this script:
-- 1. Make sure you have TELNYX_API_KEY and MAILGUN_API_KEY set in Edge Functions secrets
-- 2. Deploy your edge functions: npx supabase functions deploy
-- 3. Create .env.local file as described in ENVIRONMENT_SETUP.md
-- 4. Restart your development server 