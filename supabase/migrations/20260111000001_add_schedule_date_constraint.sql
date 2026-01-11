-- Add CHECK constraint to prevent end_date before start_date in jobs
-- This ensures data integrity at the database level

-- First, fix any existing invalid rows by setting end = start + 1 hour
UPDATE jobs
SET schedule_end = schedule_start + INTERVAL '1 hour'
WHERE schedule_end IS NOT NULL
  AND schedule_start IS NOT NULL
  AND schedule_end < schedule_start;

-- Now add the constraint
ALTER TABLE jobs
ADD CONSTRAINT jobs_schedule_dates_valid
CHECK (
  schedule_end IS NULL
  OR schedule_start IS NULL
  OR schedule_end >= schedule_start
);

-- Comment explaining the constraint
COMMENT ON CONSTRAINT jobs_schedule_dates_valid ON jobs IS
'Ensures schedule_end is not before schedule_start. Allows NULL values for either field.';
