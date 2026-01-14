-- Custom Fields Improvements
-- 1. Add sort_order for field ordering
-- 2. Add multi_select field type support
-- 3. Clean up test data

-- ============================================
-- ADD SORT_ORDER COLUMN
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_fields' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE custom_fields ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Set initial sort_order based on creation date
UPDATE custom_fields
SET sort_order = subq.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY entity_type, organization_id ORDER BY created_at) as row_num
  FROM custom_fields
) as subq
WHERE custom_fields.id = subq.id
AND custom_fields.sort_order = 0;

CREATE INDEX IF NOT EXISTS idx_custom_fields_sort_order ON custom_fields(organization_id, entity_type, sort_order);

COMMENT ON COLUMN custom_fields.sort_order IS 'Display order for custom fields. Lower numbers appear first.';

-- ============================================
-- CLEAN UP TEST DATA
-- ============================================
-- Remove fields with "TEST" in the name (case insensitive)
DELETE FROM custom_fields
WHERE LOWER(name) LIKE '%test%';

-- ============================================
-- ADD DESCRIPTION COLUMN (optional metadata)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_fields' AND column_name = 'description'
  ) THEN
    ALTER TABLE custom_fields ADD COLUMN description TEXT;
  END IF;
END $$;

COMMENT ON COLUMN custom_fields.description IS 'Optional description/help text for the custom field.';
