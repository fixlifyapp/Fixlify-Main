-- Remove property-related columns from job_overview table
ALTER TABLE public.job_overview 
DROP COLUMN IF EXISTS property_type,
DROP COLUMN IF EXISTS property_age,
DROP COLUMN IF EXISTS property_size,
DROP COLUMN IF EXISTS previous_service_date;