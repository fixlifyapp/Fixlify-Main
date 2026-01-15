-- =====================================================
-- JOB COUNT TRIGGER
-- Auto-increment job count when a new job is created
-- =====================================================

-- Trigger function to increment job count on job creation
CREATE OR REPLACE FUNCTION trigger_increment_job_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count if this is a new job (not an update)
  IF TG_OP = 'INSERT' THEN
    -- Increment job count for the organization
    UPDATE organization_subscriptions
    SET jobs_used_this_period = jobs_used_this_period + 1,
        updated_at = now()
    WHERE organization_id = NEW.organization_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_count_new_job ON jobs;

-- Create trigger on jobs table
CREATE TRIGGER trigger_count_new_job
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_increment_job_count();

-- =====================================================
-- BACKFILL: Count existing jobs for this billing period
-- =====================================================

-- Update job counts for all organizations based on jobs created this period
DO $$
DECLARE
  v_org RECORD;
  v_job_count INTEGER;
BEGIN
  FOR v_org IN
    SELECT organization_id, current_period_start
    FROM organization_subscriptions
  LOOP
    -- Count jobs created since the current period started
    SELECT COUNT(*) INTO v_job_count
    FROM jobs
    WHERE organization_id = v_org.organization_id
      AND created_at >= v_org.current_period_start;

    -- Update the subscription with the correct count
    UPDATE organization_subscriptions
    SET jobs_used_this_period = v_job_count,
        updated_at = now()
    WHERE organization_id = v_org.organization_id;
  END LOOP;
END $$;

-- Grant execute on trigger function
GRANT EXECUTE ON FUNCTION trigger_increment_job_count TO service_role;
