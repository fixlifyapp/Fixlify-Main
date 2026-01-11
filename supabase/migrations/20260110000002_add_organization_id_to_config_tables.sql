-- Add organization_id to configuration tables for multi-tenant support
-- This allows all users in an organization to share the same configuration settings
-- (tags, job_types, lead_sources, job_statuses, custom_fields, payment_methods)

-- ============================================
-- TAGS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE tags ADD COLUMN organization_id uuid;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tags_organization_id ON tags(organization_id);

UPDATE tags t
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = t.user_id),
  '00000000-0000-0000-0000-000000000001'
)
WHERE t.organization_id IS NULL;

COMMENT ON COLUMN tags.organization_id IS 'Organization that owns this tag. All users in the same organization can see this tag.';

-- ============================================
-- JOB_TYPES TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_types' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE job_types ADD COLUMN organization_id uuid;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_types_organization_id ON job_types(organization_id);

UPDATE job_types jt
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = jt.user_id),
  '00000000-0000-0000-0000-000000000001'
)
WHERE jt.organization_id IS NULL;

COMMENT ON COLUMN job_types.organization_id IS 'Organization that owns this job type. All users in the same organization can see this job type.';

-- ============================================
-- LEAD_SOURCES TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_sources' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE lead_sources ADD COLUMN organization_id uuid;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lead_sources_organization_id ON lead_sources(organization_id);

UPDATE lead_sources ls
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = ls.user_id),
  '00000000-0000-0000-0000-000000000001'
)
WHERE ls.organization_id IS NULL;

COMMENT ON COLUMN lead_sources.organization_id IS 'Organization that owns this lead source. All users in the same organization can see this lead source.';

-- ============================================
-- JOB_STATUSES TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_statuses' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE job_statuses ADD COLUMN organization_id uuid;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_statuses_organization_id ON job_statuses(organization_id);

UPDATE job_statuses js
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = js.user_id),
  '00000000-0000-0000-0000-000000000001'
)
WHERE js.organization_id IS NULL;

COMMENT ON COLUMN job_statuses.organization_id IS 'Organization that owns this job status. All users in the same organization can see this job status.';

-- ============================================
-- CUSTOM_FIELDS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_fields' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE custom_fields ADD COLUMN organization_id uuid;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_custom_fields_organization_id ON custom_fields(organization_id);

-- custom_fields uses created_by instead of user_id
UPDATE custom_fields cf
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = cf.created_by),
  '00000000-0000-0000-0000-000000000001'
)
WHERE cf.organization_id IS NULL;

COMMENT ON COLUMN custom_fields.organization_id IS 'Organization that owns this custom field. All users in the same organization can see this custom field.';

-- ============================================
-- PAYMENT_METHODS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_methods' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE payment_methods ADD COLUMN organization_id uuid;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_methods_organization_id ON payment_methods(organization_id);

UPDATE payment_methods pm
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = pm.user_id),
  '00000000-0000-0000-0000-000000000001'
)
WHERE pm.organization_id IS NULL;

COMMENT ON COLUMN payment_methods.organization_id IS 'Organization that owns this payment method. All users in the same organization can see this payment method.';
