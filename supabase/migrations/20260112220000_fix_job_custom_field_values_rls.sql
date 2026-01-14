-- Fix RLS policies for job_custom_field_values table
-- Ensure users can insert and update custom field values for jobs in their organization

-- Drop existing policies if they exist (avoid duplicates)
DROP POLICY IF EXISTS "Users can view job custom field values in their org" ON job_custom_field_values;
DROP POLICY IF EXISTS "Users can insert job custom field values in their org" ON job_custom_field_values;
DROP POLICY IF EXISTS "Users can update job custom field values in their org" ON job_custom_field_values;
DROP POLICY IF EXISTS "Users can delete job custom field values in their org" ON job_custom_field_values;

-- Ensure RLS is enabled
ALTER TABLE job_custom_field_values ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view job custom field values for jobs in their organization
CREATE POLICY "Users can view job custom field values in their org"
ON job_custom_field_values FOR SELECT
USING (
  job_id IN (
    SELECT id FROM jobs
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- INSERT policy: Users can insert job custom field values for jobs in their organization
CREATE POLICY "Users can insert job custom field values in their org"
ON job_custom_field_values FOR INSERT
WITH CHECK (
  job_id IN (
    SELECT id FROM jobs
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- UPDATE policy: Users can update job custom field values for jobs in their organization
CREATE POLICY "Users can update job custom field values in their org"
ON job_custom_field_values FOR UPDATE
USING (
  job_id IN (
    SELECT id FROM jobs
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- DELETE policy: Users can delete job custom field values for jobs in their organization
CREATE POLICY "Users can delete job custom field values in their org"
ON job_custom_field_values FOR DELETE
USING (
  job_id IN (
    SELECT id FROM jobs
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);
