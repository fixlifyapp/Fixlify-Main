-- Add CHECK constraint to prevent end_date before start_date in jobs
-- This ensures data integrity at the database level

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
