-- Fix Job Status Validation Inconsistency
-- Problem: Status field has no database constraint, and code uses mixed formats
-- Solution: Standardize on hyphenated format and add CHECK constraint
--
-- Issue Details:
-- 1. Database: jobs.status is TEXT with NO constraint
-- 2. Code uses hyphens 28 times: 'in-progress', 'on-hold'
-- 3. TypeScript enum uses underscores 11 times: 'in_progress', 'on_hold'
-- 4. This mismatch causes bugs and validation issues
--
-- Standard Format (hyphenated, matches majority of codebase):
-- - 'scheduled'
-- - 'in-progress'
-- - 'completed'
-- - 'cancelled'
-- - 'on-hold'

-- =====================================================
-- STEP 1: Update existing data to standard format
-- =====================================================

-- Convert ALL non-standard statuses to hyphenated format
UPDATE jobs
SET status = CASE
    WHEN status = 'in_progress' THEN 'in-progress'
    WHEN status = 'on_hold' THEN 'on-hold'
    WHEN status = 'pending' THEN 'scheduled'
    WHEN status = 'open' THEN 'scheduled'
    WHEN status = 'new' THEN 'scheduled'
    WHEN status = 'done' THEN 'completed'
    WHEN status = 'finished' THEN 'completed'
    WHEN status = 'closed' THEN 'completed'
    WHEN status = 'canceled' THEN 'cancelled'
    WHEN status = 'waiting' THEN 'on-hold'
    WHEN status = 'paused' THEN 'on-hold'
    WHEN status = 'active' THEN 'in-progress'
    WHEN status = 'working' THEN 'in-progress'
    WHEN status IS NULL THEN 'scheduled'
    WHEN status NOT IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'on-hold') THEN 'scheduled'
    ELSE status
END;

-- =====================================================
-- STEP 2: Add CHECK constraint
-- =====================================================

-- Drop constraint if it already exists
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add constraint to enforce valid status values
ALTER TABLE jobs
ADD CONSTRAINT jobs_status_check
CHECK (status IN (
    'scheduled',
    'in-progress',
    'completed',
    'cancelled',
    'on-hold'
));

-- =====================================================
-- STEP 3: Create helper function for status validation
-- =====================================================

CREATE OR REPLACE FUNCTION is_valid_job_status(p_status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN p_status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'on-hold');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_valid_job_status TO authenticated;

-- =====================================================
-- STEP 4: Create status transition validation function
-- =====================================================

-- Function to validate status transitions (optional, for future use)
CREATE OR REPLACE FUNCTION validate_job_status_transition(
    p_old_status TEXT,
    p_new_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- All transitions are allowed for now
    -- This function can be enhanced later to enforce specific transition rules
    -- Example: completed -> in-progress might not make sense

    RETURN is_valid_job_status(p_new_status);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION validate_job_status_transition TO authenticated;

-- =====================================================
-- STEP 5: Add index for performance
-- =====================================================

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
--
-- Check constraint exists:
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name = 'jobs_status_check';
--
-- Verify all statuses are valid:
-- SELECT DISTINCT status, COUNT(*) as count
-- FROM jobs
-- WHERE deleted_at IS NULL
-- GROUP BY status
-- ORDER BY count DESC;
--
-- Test validation function:
-- SELECT is_valid_job_status('in-progress'); -- Should return true
-- SELECT is_valid_job_status('invalid');     -- Should return false
--

