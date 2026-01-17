-- Add technician skills system for AI-powered job suggestions
-- Phase 9: Smart AI Job Suggestions

-- 1. Add skills array to profiles (for technicians)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- 2. Add required_skills to job_types for skill matching
ALTER TABLE job_types ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';

-- 3. Deduplicate job_types before adding unique constraint
-- Keep the most recently created one for each name/org combination
DELETE FROM job_types a
USING job_types b
WHERE a.id < b.id
AND a.name = b.name
AND COALESCE(a.organization_id, '00000000-0000-0000-0000-000000000000') = COALESCE(b.organization_id, '00000000-0000-0000-0000-000000000000');

-- 4. Create a unique constraint on job_types (name, organization_id) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_types_name_org_unique'
  ) THEN
    ALTER TABLE job_types
    ADD CONSTRAINT job_types_name_org_unique
    UNIQUE (name, organization_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN unique_violation THEN
    -- If there are still duplicates, just skip creating the constraint
    NULL;
END $$;

-- 5. Update existing common job types with required skills
UPDATE job_types SET required_skills = ARRAY['hvac', 'cooling', 'ac', 'refrigeration']
WHERE LOWER(name) LIKE '%ac%repair%' OR LOWER(name) LIKE '%air condition%' OR LOWER(name) = 'ac repair';

UPDATE job_types SET required_skills = ARRAY['hvac', 'heating', 'furnace', 'boiler']
WHERE LOWER(name) LIKE '%heat%' OR LOWER(name) LIKE '%furnace%' OR LOWER(name) = 'heating repair';

UPDATE job_types SET required_skills = ARRAY['plumbing', 'pipes', 'water', 'drain']
WHERE LOWER(name) LIKE '%plumb%' OR LOWER(name) LIKE '%pipe%' OR LOWER(name) LIKE '%drain%';

UPDATE job_types SET required_skills = ARRAY['electrical', 'wiring', 'panel', 'lights']
WHERE LOWER(name) LIKE '%electric%' OR LOWER(name) LIKE '%wiring%';

UPDATE job_types SET required_skills = ARRAY['general', 'maintenance', 'repair']
WHERE LOWER(name) LIKE '%general%' OR LOWER(name) LIKE '%maintenance%' OR LOWER(name) LIKE '%repair%';

UPDATE job_types SET required_skills = ARRAY['installation', 'setup', 'assembly']
WHERE LOWER(name) LIKE '%install%' OR LOWER(name) LIKE '%setup%';

UPDATE job_types SET required_skills = ARRAY['emergency', 'urgent']
WHERE LOWER(name) LIKE '%emergency%' OR LOWER(name) LIKE '%urgent%';

UPDATE job_types SET required_skills = ARRAY['inspection', 'assessment', 'diagnostic']
WHERE LOWER(name) LIKE '%inspect%' OR LOWER(name) LIKE '%diagnostic%';

-- 6. Create index for skills search
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_job_types_required_skills ON job_types USING GIN (required_skills);

-- 7. Function to calculate skill match score
CREATE OR REPLACE FUNCTION calculate_skill_match(
  technician_skills TEXT[],
  required_job_skills TEXT[]
)
RETURNS FLOAT AS $$
DECLARE
  matching_skills INT;
  total_required INT;
BEGIN
  -- If no required skills, everyone matches
  IF required_job_skills IS NULL OR array_length(required_job_skills, 1) IS NULL THEN
    RETURN 1.0;
  END IF;

  total_required := array_length(required_job_skills, 1);

  -- Count matching skills (case-insensitive)
  SELECT COUNT(*) INTO matching_skills
  FROM unnest(required_job_skills) AS req_skill
  WHERE EXISTS (
    SELECT 1 FROM unnest(technician_skills) AS tech_skill
    WHERE LOWER(tech_skill) = LOWER(req_skill)
  );

  -- Return percentage match (0.0 to 1.0)
  RETURN matching_skills::FLOAT / total_required::FLOAT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Comment for documentation
COMMENT ON COLUMN profiles.skills IS 'Array of skill keywords for technician specialization (e.g., hvac, plumbing, electrical)';
COMMENT ON COLUMN job_types.required_skills IS 'Array of skill keywords required for this job type';
COMMENT ON FUNCTION calculate_skill_match IS 'Calculates skill match score (0-1) between technician skills and job requirements';
