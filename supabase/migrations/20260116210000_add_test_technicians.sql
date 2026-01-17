-- Update job types with required skills for AI-powered suggestions
-- Phase 9: Smart AI Job Suggestions
-- Note: Test technicians should be created through the app UI since profiles require auth.users

-- Update existing job_types with required_skills based on name patterns
-- HVAC related
UPDATE job_types SET required_skills = ARRAY['hvac', 'cooling', 'ac', 'refrigeration']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND (LOWER(name) LIKE '%ac%' OR LOWER(name) LIKE '%air condition%' OR LOWER(name) LIKE '%cooling%');

UPDATE job_types SET required_skills = ARRAY['hvac', 'heating', 'furnace', 'boiler']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND (LOWER(name) LIKE '%heat%' OR LOWER(name) LIKE '%furnace%');

-- Plumbing
UPDATE job_types SET required_skills = ARRAY['plumbing', 'pipes', 'water', 'drain']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND LOWER(name) LIKE '%plumb%';

-- Electrical
UPDATE job_types SET required_skills = ARRAY['electrical', 'wiring', 'panel', 'lights']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND LOWER(name) LIKE '%electric%';

-- General/Maintenance
UPDATE job_types SET required_skills = ARRAY['general', 'maintenance', 'repair']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND (LOWER(name) LIKE '%general%' OR LOWER(name) LIKE '%maintenance%');

-- Installation
UPDATE job_types SET required_skills = ARRAY['installation', 'setup', 'assembly']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND LOWER(name) LIKE '%install%';

-- Emergency
UPDATE job_types SET required_skills = ARRAY['emergency', 'urgent']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND LOWER(name) LIKE '%emergency%';

-- Inspection/Diagnostic
UPDATE job_types SET required_skills = ARRAY['inspection', 'diagnostic', 'assessment']
WHERE (required_skills IS NULL OR required_skills = '{}')
  AND (LOWER(name) LIKE '%inspect%' OR LOWER(name) LIKE '%diagnostic%');
