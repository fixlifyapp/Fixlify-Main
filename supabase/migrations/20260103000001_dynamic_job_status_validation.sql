-- Dynamic Job Status Validation
-- Problem: jobs_status_check constraint uses hardcoded values instead of organization's job_statuses table
-- Solution: Remove hardcoded constraint - frontend validates against job_statuses table dynamically
--
-- This allows each organization to define their own job statuses through Settings > Configuration

-- =====================================================
-- STEP 1: Drop the hardcoded CHECK constraint
-- =====================================================

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- =====================================================
-- STEP 2: Update is_valid_job_status function (keep for compatibility)
-- =====================================================

CREATE OR REPLACE FUNCTION is_valid_job_status(p_status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Real validation happens on the frontend against the job_statuses table
    -- This function just checks the status is not empty
    RETURN p_status IS NOT NULL AND LENGTH(TRIM(p_status)) > 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- NOTE: Frontend Validation
-- =====================================================
-- The JobStatusBadge component validates against job_statuses table
-- using useJobStatuses hook from useConfigItems.ts
-- This ensures only organization-configured statuses can be selected
--
