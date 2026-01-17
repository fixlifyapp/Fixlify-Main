-- Update existing technicians with skills based on their names or assign mixed skills
-- Phase 9: Smart AI Job Suggestions - Add skills to existing technicians

-- Add HVAC skills to technicians with HVAC-related names
UPDATE profiles
SET skills = ARRAY['hvac', 'cooling', 'heating', 'ac', 'refrigeration']
WHERE role = 'technician'
  AND (skills IS NULL OR skills = '{}')
  AND (LOWER(name) LIKE '%hvac%' OR LOWER(name) LIKE '%ac%' OR LOWER(name) LIKE '%heat%');

-- Add plumbing skills to technicians with plumbing-related names
UPDATE profiles
SET skills = ARRAY['plumbing', 'pipes', 'water', 'drain', 'fixtures']
WHERE role = 'technician'
  AND (skills IS NULL OR skills = '{}')
  AND (LOWER(name) LIKE '%plumb%' OR LOWER(name) LIKE '%pipe%');

-- Add electrical skills to technicians with electrical-related names
UPDATE profiles
SET skills = ARRAY['electrical', 'wiring', 'panel', 'lights', 'circuits']
WHERE role = 'technician'
  AND (skills IS NULL OR skills = '{}')
  AND (LOWER(name) LIKE '%electric%' OR LOWER(name) LIKE '%wire%');

-- For remaining technicians without skills, assign general repair skills
UPDATE profiles
SET skills = ARRAY['general', 'maintenance', 'repair', 'inspection']
WHERE role = 'technician'
  AND (skills IS NULL OR skills = '{}');

-- Also update admin/manager profiles to have broad skills (they can do anything)
UPDATE profiles
SET skills = ARRAY['hvac', 'plumbing', 'electrical', 'general', 'maintenance', 'repair', 'emergency']
WHERE role IN ('admin', 'manager')
  AND (skills IS NULL OR skills = '{}');
