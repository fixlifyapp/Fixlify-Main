-- =====================================================
-- Fix Organization Architecture Migration
-- =====================================================
-- This migration adds organization_id to tables that need
-- multi-tenant data isolation.
-- =====================================================

-- =====================================================
-- Add organization_id to team_invitations
-- =====================================================
ALTER TABLE team_invitations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill organization_id from invited_by profile
UPDATE team_invitations ti
SET organization_id = p.organization_id
FROM profiles p
WHERE ti.invited_by = p.id
AND ti.organization_id IS NULL
AND p.organization_id IS NOT NULL;

-- =====================================================
-- Add organization_id to line_items (unified items table)
-- =====================================================
ALTER TABLE line_items
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from estimates -> jobs -> profiles
UPDATE line_items li
SET organization_id = p.organization_id
FROM estimates e
JOIN jobs j ON e.job_id = j.id
JOIN profiles p ON j.user_id = p.id
WHERE li.parent_type = 'estimate'
AND li.parent_id = e.id
AND li.organization_id IS NULL
AND p.organization_id IS NOT NULL;

-- Backfill from invoices -> profiles
UPDATE line_items li
SET organization_id = p.organization_id
FROM invoices i
JOIN profiles p ON i.user_id = p.id
WHERE li.parent_type = 'invoice'
AND li.parent_id = i.id
AND li.organization_id IS NULL
AND p.organization_id IS NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_line_items_organization_id
ON line_items(organization_id);

-- =====================================================
-- Add organization_id to payments
-- =====================================================
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from invoices
UPDATE payments pa
SET organization_id = p.organization_id
FROM invoices i
JOIN profiles p ON i.user_id = p.id
WHERE pa.invoice_id = i.id
AND pa.organization_id IS NULL
AND p.organization_id IS NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_payments_organization_id
ON payments(organization_id);

-- =====================================================
-- Add organization_id to job_attachments
-- =====================================================
ALTER TABLE job_attachments
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from jobs
UPDATE job_attachments ja
SET organization_id = p.organization_id
FROM jobs j
JOIN profiles p ON j.user_id = p.id
WHERE ja.job_id = j.id
AND ja.organization_id IS NULL
AND p.organization_id IS NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_job_attachments_organization_id
ON job_attachments(organization_id);

-- =====================================================
-- Add organization_id to company_settings
-- =====================================================
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill from user profiles
UPDATE company_settings cs
SET organization_id = p.organization_id
FROM profiles p
WHERE cs.user_id = p.id
AND cs.organization_id IS NULL
AND p.organization_id IS NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_company_settings_organization_id
ON company_settings(organization_id);

-- =====================================================
-- Helper function to get user's organization
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;

-- =====================================================
-- Add comments
-- =====================================================
COMMENT ON COLUMN team_invitations.organization_id IS 'Organization the user is being invited to';
COMMENT ON COLUMN line_items.organization_id IS 'Organization for data isolation';
COMMENT ON COLUMN payments.organization_id IS 'Organization for data isolation';
COMMENT ON COLUMN job_attachments.organization_id IS 'Organization for data isolation';
COMMENT ON COLUMN company_settings.organization_id IS 'Organization for data isolation';
