-- Fix custom fields missing organization_id
-- This was caused by the useConfigItems hook not setting organization_id when creating new fields

UPDATE custom_fields cf
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = cf.created_by),
  '00000000-0000-0000-0000-000000000001'
)
WHERE cf.organization_id IS NULL;
