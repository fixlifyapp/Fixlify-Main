
-- Step 1: Fix Database Relationships
-- Add client_id to estimates where missing by looking up from jobs
UPDATE estimates 
SET client_id = jobs.client_id 
FROM jobs 
WHERE estimates.job_id = jobs.id 
AND estimates.client_id IS NULL;

-- Add constraint to ensure estimates always have client_id
ALTER TABLE estimates 
ADD CONSTRAINT estimates_client_id_not_null 
CHECK (client_id IS NOT NULL);

-- Create function to automatically set client_id on estimates
CREATE OR REPLACE FUNCTION set_estimate_client_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If client_id is not set, get it from the associated job
  IF NEW.client_id IS NULL AND NEW.job_id IS NOT NULL THEN
    SELECT client_id INTO NEW.client_id 
    FROM jobs 
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set client_id on estimate insert/update
DROP TRIGGER IF EXISTS set_estimate_client_id_trigger ON estimates;
CREATE TRIGGER set_estimate_client_id_trigger
  BEFORE INSERT OR UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION set_estimate_client_id();

-- Do the same for invoices
UPDATE invoices 
SET client_id = jobs.client_id 
FROM jobs 
WHERE invoices.job_id = jobs.id 
AND invoices.client_id IS NULL;

ALTER TABLE invoices 
ADD CONSTRAINT invoices_client_id_not_null 
CHECK (client_id IS NOT NULL);

CREATE OR REPLACE FUNCTION set_invoice_client_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If client_id is not set, get it from the associated job
  IF NEW.client_id IS NULL AND NEW.job_id IS NOT NULL THEN
    SELECT client_id INTO NEW.client_id 
    FROM jobs 
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_client_id_trigger ON invoices;
CREATE TRIGGER set_invoice_client_id_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_client_id();
