-- =====================================================
-- SUBSCRIPTION CRON JOBS
-- Monthly billing period reset and credit allocation
-- =====================================================

-- Note: pg_cron extension is already enabled on Supabase

-- Function to process all subscriptions that need renewal
CREATE OR REPLACE FUNCTION process_subscription_renewals()
RETURNS TABLE(
  processed_count INTEGER,
  credits_allocated INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  v_subscription RECORD;
  v_processed INTEGER := 0;
  v_credits INTEGER := 0;
  v_errors TEXT[] := '{}';
  v_result RECORD;
BEGIN
  -- Find subscriptions where current_period_end has passed
  FOR v_subscription IN
    SELECT os.*, sp.included_credits_monthly, sp.display_name as plan_name
    FROM organization_subscriptions os
    JOIN subscription_plans sp ON sp.id = os.plan_id
    WHERE os.current_period_end <= now()
      AND os.status = 'active'
      AND NOT os.cancel_at_period_end
  LOOP
    BEGIN
      -- Reset the billing period
      PERFORM reset_subscription_period(v_subscription.organization_id);

      -- Allocate monthly credits if plan includes them
      IF v_subscription.included_credits_monthly > 0 THEN
        SELECT * INTO v_result
        FROM allocate_monthly_credits(v_subscription.organization_id);

        IF v_result.success THEN
          v_credits := v_credits + v_result.credits_added;
        END IF;
      END IF;

      v_processed := v_processed + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors,
        'Org ' || v_subscription.organization_id::TEXT || ': ' || SQLERRM);
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_credits, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle canceled subscriptions at period end
CREATE OR REPLACE FUNCTION process_subscription_cancellations()
RETURNS TABLE(processed_count INTEGER, errors TEXT[]) AS $$
DECLARE
  v_subscription RECORD;
  v_processed INTEGER := 0;
  v_errors TEXT[] := '{}';
  v_free_plan_id UUID;
BEGIN
  -- Get free plan ID
  SELECT id INTO v_free_plan_id FROM subscription_plans WHERE name = 'free';

  -- Find subscriptions marked for cancellation where period has ended
  FOR v_subscription IN
    SELECT *
    FROM organization_subscriptions
    WHERE cancel_at_period_end = true
      AND current_period_end <= now()
      AND status = 'active'
  LOOP
    BEGIN
      -- Downgrade to free plan
      UPDATE organization_subscriptions
      SET
        plan_id = v_free_plan_id,
        status = 'active',
        cancel_at_period_end = false,
        extra_users = 0,
        current_period_start = now(),
        current_period_end = now() + interval '1 month',
        jobs_used_this_period = 0,
        credits_allocated_this_period = false,
        updated_at = now()
      WHERE organization_id = v_subscription.organization_id;

      v_processed := v_processed + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors,
        'Org ' || v_subscription.organization_id::TEXT || ': ' || SQLERRM);
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle trial expirations
CREATE OR REPLACE FUNCTION process_trial_expirations()
RETURNS TABLE(processed_count INTEGER, errors TEXT[]) AS $$
DECLARE
  v_subscription RECORD;
  v_processed INTEGER := 0;
  v_errors TEXT[] := '{}';
  v_free_plan_id UUID;
BEGIN
  -- Get free plan ID
  SELECT id INTO v_free_plan_id FROM subscription_plans WHERE name = 'free';

  -- Find expired trials
  FOR v_subscription IN
    SELECT *
    FROM organization_subscriptions
    WHERE status = 'trialing'
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at <= now()
  LOOP
    BEGIN
      -- Convert trial to active or downgrade to free
      -- For now, downgrade to free (payment integration will handle upgrades)
      UPDATE organization_subscriptions
      SET
        plan_id = v_free_plan_id,
        status = 'active',
        trial_ends_at = NULL,
        current_period_start = now(),
        current_period_end = now() + interval '1 month',
        updated_at = now()
      WHERE organization_id = v_subscription.organization_id;

      v_processed := v_processed + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors,
        'Org ' || v_subscription.organization_id::TEXT || ': ' || SQLERRM);
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Master function that runs all subscription processing
CREATE OR REPLACE FUNCTION run_subscription_maintenance()
RETURNS JSONB AS $$
DECLARE
  v_renewals RECORD;
  v_cancellations RECORD;
  v_trials RECORD;
  v_result JSONB;
BEGIN
  -- Process renewals (including credit allocation)
  SELECT * INTO v_renewals FROM process_subscription_renewals();

  -- Process cancellations
  SELECT * INTO v_cancellations FROM process_subscription_cancellations();

  -- Process trial expirations
  SELECT * INTO v_trials FROM process_trial_expirations();

  -- Build result
  v_result := jsonb_build_object(
    'timestamp', now(),
    'renewals', jsonb_build_object(
      'processed', v_renewals.processed_count,
      'credits_allocated', v_renewals.credits_allocated,
      'errors', v_renewals.errors
    ),
    'cancellations', jsonb_build_object(
      'processed', v_cancellations.processed_count,
      'errors', v_cancellations.errors
    ),
    'trials', jsonb_build_object(
      'processed', v_trials.processed_count,
      'errors', v_trials.errors
    )
  );

  -- Log the result
  RAISE NOTICE 'Subscription maintenance completed: %', v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CRON SCHEDULE
-- Run every hour to catch subscriptions as they expire
-- =====================================================

-- Remove existing job if it exists
SELECT cron.unschedule('subscription-maintenance')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'subscription-maintenance');

-- Schedule the maintenance job to run every hour
SELECT cron.schedule(
  'subscription-maintenance',
  '0 * * * *',  -- Every hour at minute 0
  $$SELECT run_subscription_maintenance()$$
);

-- =====================================================
-- GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION process_subscription_renewals TO service_role;
GRANT EXECUTE ON FUNCTION process_subscription_cancellations TO service_role;
GRANT EXECUTE ON FUNCTION process_trial_expirations TO service_role;
GRANT EXECUTE ON FUNCTION run_subscription_maintenance TO service_role;
