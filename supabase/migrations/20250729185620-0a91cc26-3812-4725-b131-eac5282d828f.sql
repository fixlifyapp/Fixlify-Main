-- Add organization_id column to jobs table
ALTER TABLE jobs ADD COLUMN organization_id UUID;

-- Set organization_id for existing jobs based on user's organization
UPDATE jobs SET organization_id = (
  SELECT organization_id 
  FROM profiles 
  WHERE profiles.id = jobs.user_id
) WHERE organization_id IS NULL;

-- Set default organization_id for jobs where user doesn't have org in profile
UPDATE jobs SET organization_id = '00000000-0000-0000-0000-000000000001' 
WHERE organization_id IS NULL;

-- Add index for performance
CREATE INDEX idx_jobs_organization_id ON jobs(organization_id);

-- Add trigger to auto-set organization_id for new jobs
CREATE OR REPLACE FUNCTION set_job_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Fallback to default org if no profile org found
    IF NEW.organization_id IS NULL THEN
      NEW.organization_id := '00000000-0000-0000-0000-000000000001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_job_organization_id
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_organization_id();