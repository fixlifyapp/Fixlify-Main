-- =====================================================
-- SUBSCRIPTION PLANS SYSTEM
-- Fixlify Plans: Free, Pro, Business
-- Based on CREDIT_SYSTEM_PLAN.md v2.1
-- =====================================================

-- 1. Subscription Plans Definition
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0, -- Monthly price in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  -- Limits
  max_users INTEGER NOT NULL DEFAULT 1,
  max_jobs_per_month INTEGER, -- NULL = unlimited
  max_clients INTEGER, -- NULL = unlimited
  included_phone_numbers INTEGER NOT NULL DEFAULT 0,
  -- Credits
  included_credits_monthly INTEGER NOT NULL DEFAULT 0,
  extra_user_price_cents INTEGER NOT NULL DEFAULT 0, -- Price per extra user
  -- Features
  features JSONB DEFAULT '[]', -- List of feature keys enabled
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Organization Subscriptions (current plan per org)
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
  -- Billing
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 month'),
  -- Extra users
  extra_users INTEGER NOT NULL DEFAULT 0,
  -- Payment
  payment_provider TEXT, -- 'rainforest', 'stripe', etc.
  payment_provider_subscription_id TEXT,
  payment_provider_customer_id TEXT,
  -- Usage tracking for current period
  jobs_used_this_period INTEGER NOT NULL DEFAULT 0,
  credits_allocated_this_period BOOLEAN NOT NULL DEFAULT false,
  -- Trial
  trial_ends_at TIMESTAMPTZ,
  -- Cancellation
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_plan ON organization_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_period_end ON organization_subscriptions(current_period_end);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Org members can view their subscription
CREATE POLICY "Users can view own org subscription"
  ON organization_subscriptions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Only admins can update subscription
CREATE POLICY "Admins can update own org subscription"
  ON organization_subscriptions FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- =====================================================
-- SEED DATA: Subscription Plans
-- =====================================================

INSERT INTO subscription_plans (
  name, display_name, description, price_cents,
  max_users, max_jobs_per_month, max_clients,
  included_phone_numbers, included_credits_monthly,
  extra_user_price_cents, is_featured, sort_order, features
) VALUES
  (
    'free',
    'Free',
    'Get started with basic features',
    0,
    1,      -- 1 user
    30,     -- 30 jobs/month
    20,     -- 20 clients
    0,      -- 0 phone numbers (buy via credits)
    0,      -- 0 credits included
    0,      -- Cannot add extra users
    false,
    1,
    '["scheduling", "invoicing", "estimates", "client_crm", "mobile_app", "basic_reports"]'::jsonb
  ),
  (
    'pro',
    'Pro',
    'Perfect for growing businesses',
    4900,   -- $49/month
    3,      -- 3 users included
    200,    -- 200 jobs/month
    NULL,   -- Unlimited clients
    1,      -- 1 phone number included
    200,    -- 200 credits/month included
    1500,   -- $15/extra user
    true,   -- Featured
    2,
    '["scheduling", "invoicing", "estimates", "client_crm", "mobile_app", "online_booking", "quickbooks_sync", "gps_tracking", "client_portal", "custom_fields", "job_costing", "reports", "automations", "api_access", "ai_features", "sms_calls", "email_support"]'::jsonb
  ),
  (
    'business',
    'Business',
    'For established teams that need more',
    19900,  -- $199/month
    10,     -- 10 users included
    NULL,   -- Unlimited jobs
    NULL,   -- Unlimited clients
    3,      -- 3 phone numbers included
    1000,   -- 1000 credits/month included
    1500,   -- $15/extra user
    false,
    3,
    '["scheduling", "invoicing", "estimates", "client_crm", "mobile_app", "online_booking", "quickbooks_sync", "xero_sync", "gps_tracking", "client_portal", "custom_fields", "job_costing", "advanced_reports", "automations", "api_access", "ai_features", "sms_calls", "priority_support", "dedicated_account_manager"]'::jsonb
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  max_users = EXCLUDED.max_users,
  max_jobs_per_month = EXCLUDED.max_jobs_per_month,
  max_clients = EXCLUDED.max_clients,
  included_phone_numbers = EXCLUDED.included_phone_numbers,
  included_credits_monthly = EXCLUDED.included_credits_monthly,
  extra_user_price_cents = EXCLUDED.extra_user_price_cents,
  features = EXCLUDED.features,
  updated_at = now();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get or create subscription for organization (defaults to Free)
CREATE OR REPLACE FUNCTION get_or_create_org_subscription(p_organization_id UUID)
RETURNS organization_subscriptions AS $$
DECLARE
  v_subscription organization_subscriptions;
  v_free_plan_id UUID;
BEGIN
  -- Try to get existing subscription
  SELECT * INTO v_subscription
  FROM organization_subscriptions
  WHERE organization_id = p_organization_id;

  IF NOT FOUND THEN
    -- Get free plan ID
    SELECT id INTO v_free_plan_id FROM subscription_plans WHERE name = 'free';

    -- Create subscription with free plan
    INSERT INTO organization_subscriptions (
      organization_id,
      plan_id,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      p_organization_id,
      v_free_plan_id,
      'active',
      now(),
      now() + interval '1 month'
    )
    RETURNING * INTO v_subscription;
  END IF;

  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if organization can add more users
CREATE OR REPLACE FUNCTION can_add_user(p_organization_id UUID)
RETURNS TABLE(allowed BOOLEAN, current_users INTEGER, max_users INTEGER, can_add_extra BOOLEAN) AS $$
DECLARE
  v_subscription organization_subscriptions;
  v_plan subscription_plans;
  v_current_users INTEGER;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription FROM get_or_create_org_subscription(p_organization_id);
  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_subscription.plan_id;

  -- Count current users
  SELECT COUNT(*) INTO v_current_users
  FROM profiles
  WHERE organization_id = p_organization_id;

  -- Check if can add
  RETURN QUERY SELECT
    v_current_users < (v_plan.max_users + v_subscription.extra_users),
    v_current_users,
    v_plan.max_users + v_subscription.extra_users,
    v_plan.extra_user_price_cents > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if organization can create more jobs this period
CREATE OR REPLACE FUNCTION can_create_job(p_organization_id UUID)
RETURNS TABLE(allowed BOOLEAN, jobs_used INTEGER, jobs_limit INTEGER, is_unlimited BOOLEAN) AS $$
DECLARE
  v_subscription organization_subscriptions;
  v_plan subscription_plans;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription FROM get_or_create_org_subscription(p_organization_id);
  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_subscription.plan_id;

  -- Check if unlimited
  IF v_plan.max_jobs_per_month IS NULL THEN
    RETURN QUERY SELECT true, v_subscription.jobs_used_this_period, 0, true;
    RETURN;
  END IF;

  -- Check limit
  RETURN QUERY SELECT
    v_subscription.jobs_used_this_period < v_plan.max_jobs_per_month,
    v_subscription.jobs_used_this_period,
    v_plan.max_jobs_per_month,
    false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment job count for organization
CREATE OR REPLACE FUNCTION increment_job_count(p_organization_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE organization_subscriptions
  SET jobs_used_this_period = jobs_used_this_period + 1,
      updated_at = now()
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allocate monthly credits for a subscription
CREATE OR REPLACE FUNCTION allocate_monthly_credits(p_organization_id UUID)
RETURNS TABLE(success BOOLEAN, credits_added INTEGER, message TEXT) AS $$
DECLARE
  v_subscription organization_subscriptions;
  v_plan subscription_plans;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription FROM organization_subscriptions WHERE organization_id = p_organization_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'No subscription found'::TEXT;
    RETURN;
  END IF;

  -- Check if already allocated this period
  IF v_subscription.credits_allocated_this_period THEN
    RETURN QUERY SELECT false, 0, 'Credits already allocated this period'::TEXT;
    RETURN;
  END IF;

  -- Get plan
  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_subscription.plan_id;

  -- Skip if no included credits
  IF v_plan.included_credits_monthly <= 0 THEN
    RETURN QUERY SELECT true, 0, 'Plan has no included credits'::TEXT;
    RETURN;
  END IF;

  -- Add credits using existing add_credits function
  PERFORM add_credits(
    p_organization_id,
    v_plan.included_credits_monthly,
    'plan_included',
    'Monthly included credits (' || v_plan.display_name || ' plan)',
    NULL,
    jsonb_build_object('plan', v_plan.name, 'period_start', v_subscription.current_period_start)
  );

  -- Mark as allocated
  UPDATE organization_subscriptions
  SET credits_allocated_this_period = true,
      updated_at = now()
  WHERE organization_id = p_organization_id;

  RETURN QUERY SELECT true, v_plan.included_credits_monthly, 'Credits allocated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset subscription period (called by cron or on renewal)
CREATE OR REPLACE FUNCTION reset_subscription_period(p_organization_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE organization_subscriptions
  SET
    current_period_start = now(),
    current_period_end = now() + interval '1 month',
    jobs_used_this_period = 0,
    credits_allocated_this_period = false,
    updated_at = now()
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization's current plan details
CREATE OR REPLACE FUNCTION get_org_plan_details(p_organization_id UUID)
RETURNS TABLE(
  plan_name TEXT,
  plan_display_name TEXT,
  price_cents INTEGER,
  max_users INTEGER,
  current_users INTEGER,
  extra_users INTEGER,
  max_jobs INTEGER,
  jobs_used INTEGER,
  included_credits INTEGER,
  included_phone_numbers INTEGER,
  status TEXT,
  period_end TIMESTAMPTZ
) AS $$
DECLARE
  v_subscription organization_subscriptions;
  v_plan subscription_plans;
  v_current_users INTEGER;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription FROM get_or_create_org_subscription(p_organization_id);
  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_subscription.plan_id;

  -- Count users
  SELECT COUNT(*) INTO v_current_users FROM profiles WHERE organization_id = p_organization_id;

  RETURN QUERY SELECT
    v_plan.name,
    v_plan.display_name,
    v_plan.price_cents,
    v_plan.max_users,
    v_current_users,
    v_subscription.extra_users,
    v_plan.max_jobs_per_month,
    v_subscription.jobs_used_this_period,
    v_plan.included_credits_monthly,
    v_plan.included_phone_numbers,
    v_subscription.status,
    v_subscription.current_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-create subscription when organization is created
CREATE OR REPLACE FUNCTION create_subscription_for_new_org()
RETURNS TRIGGER AS $$
DECLARE
  v_free_plan_id UUID;
BEGIN
  SELECT id INTO v_free_plan_id FROM subscription_plans WHERE name = 'free';

  INSERT INTO organization_subscriptions (organization_id, plan_id, status)
  VALUES (NEW.id, v_free_plan_id, 'active')
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_subscription ON organizations;
CREATE TRIGGER trigger_create_subscription
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_for_new_org();

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON subscription_plans TO service_role;
GRANT ALL ON organization_subscriptions TO service_role;
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT ON organization_subscriptions TO authenticated;

GRANT EXECUTE ON FUNCTION get_or_create_org_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION can_add_user TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_job TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_plan_details TO authenticated;
GRANT EXECUTE ON FUNCTION increment_job_count TO service_role;
GRANT EXECUTE ON FUNCTION allocate_monthly_credits TO service_role;
GRANT EXECUTE ON FUNCTION reset_subscription_period TO service_role;
