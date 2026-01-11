-- Add organization_id to custom_roles table for multi-tenant support
-- This allows all users in an organization to share the same custom roles

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_roles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.custom_roles ADD COLUMN organization_id uuid;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_roles_organization_id ON public.custom_roles(organization_id);

-- Update existing custom_roles to have organization_id from their creator's profile
UPDATE public.custom_roles cr
SET organization_id = COALESCE(
  (SELECT pr.organization_id FROM profiles pr WHERE pr.id = cr.created_by),
  '00000000-0000-0000-0000-000000000001'  -- Default org if no profile found
)
WHERE cr.organization_id IS NULL;

-- Update the unique constraint to be per-organization instead of per-user
-- First drop the old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'custom_roles_name_created_by_key'
  ) THEN
    ALTER TABLE public.custom_roles DROP CONSTRAINT custom_roles_name_created_by_key;
  END IF;
END $$;

-- Add new unique constraint per organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'custom_roles_name_organization_id_key'
  ) THEN
    ALTER TABLE public.custom_roles ADD CONSTRAINT custom_roles_name_organization_id_key
    UNIQUE(name, organization_id);
  END IF;
END $$;

-- Drop old RLS policies and create new ones based on organization_id
DROP POLICY IF EXISTS "Users can view their custom roles" ON public.custom_roles;
DROP POLICY IF EXISTS "Users can create custom roles" ON public.custom_roles;
DROP POLICY IF EXISTS "Users can update their custom roles" ON public.custom_roles;
DROP POLICY IF EXISTS "Users can delete their custom roles" ON public.custom_roles;

-- Create new organization-based RLS policies
CREATE POLICY "Users can view organization custom roles" ON public.custom_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create organization custom roles" ON public.custom_roles
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update organization custom roles" ON public.custom_roles
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete organization custom roles" ON public.custom_roles
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Add comment explaining the column
COMMENT ON COLUMN public.custom_roles.organization_id IS 'Organization that owns this custom role. All users in the same organization can use this role.';
