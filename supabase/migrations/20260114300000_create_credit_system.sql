-- =====================================================
-- CREDIT SYSTEM MIGRATION
-- Fixlify Usage-Based Billing System
-- =====================================================

-- 1. Credit Balances (per organization)
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  lifetime_bonus INTEGER NOT NULL DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'none' CHECK (loyalty_tier IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- 2. Credit Transactions (audit log)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund', 'plan_included', 'referral', 'adjustment')),
  amount INTEGER NOT NULL, -- positive = credit added, negative = credit used
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'sms', 'call', 'ai_dispatcher', 'ai_text', 'phone_number', etc.
  reference_id UUID, -- job_id, message_id, call_id, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Credit Packages (purchasable bundles)
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL, -- price in cents (e.g., 2500 = $25)
  currency TEXT NOT NULL DEFAULT 'usd',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Auto Top-Up Settings
CREATE TABLE IF NOT EXISTS auto_topup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  trigger_threshold INTEGER NOT NULL DEFAULT 20, -- credits
  topup_package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
  max_monthly_spend_cents INTEGER NOT NULL DEFAULT 20000, -- $200 default
  current_month_spend_cents INTEGER NOT NULL DEFAULT 0,
  spend_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  stripe_payment_method_id TEXT,
  stripe_customer_id TEXT,
  last_topup_at TIMESTAMPTZ,
  last_topup_failed_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- 5. Credit Usage Rates (configurable pricing)
CREATE TABLE IF NOT EXISTS credit_usage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE, -- 'sms_outbound', 'ai_dispatcher', etc.
  feature_name TEXT NOT NULL,
  credits_per_unit INTEGER NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'each', -- 'each', 'minute', 'month'
  category TEXT NOT NULL, -- 'messaging', 'voice', 'ai', 'documents', 'phone_numbers'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_credit_balances_org ON credit_balances(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_org ON credit_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_ref ON credit_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_auto_topup_org ON auto_topup_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active, sort_order);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_topup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_rates ENABLE ROW LEVEL SECURITY;

-- Credit Balances: Org members can view their org's balance
CREATE POLICY "Users can view own org credit balance"
  ON credit_balances FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Credit Transactions: Org members can view their org's transactions
CREATE POLICY "Users can view own org credit transactions"
  ON credit_transactions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Credit Packages: Everyone can view active packages
CREATE POLICY "Anyone can view active credit packages"
  ON credit_packages FOR SELECT
  USING (is_active = true);

-- Auto Top-Up Settings: Org admins can manage
CREATE POLICY "Admins can view own org auto topup settings"
  ON auto_topup_settings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update own org auto topup settings"
  ON auto_topup_settings FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- Credit Usage Rates: Everyone can view
CREATE POLICY "Anyone can view credit usage rates"
  ON credit_usage_rates FOR SELECT
  USING (is_active = true);

-- =====================================================
-- SEED DATA: Credit Packages
-- =====================================================

INSERT INTO credit_packages (name, description, credits, bonus_credits, price_cents, is_featured, sort_order) VALUES
  ('Starter', 'Try it out', 50, 0, 500, false, 1),
  ('Basic', 'Light users', 100, 0, 1000, false, 2),
  ('Popular', 'Most users choose this', 300, 60, 2500, true, 3),
  ('Value', 'Active users', 700, 200, 5000, false, 4),
  ('Pro', 'Power users', 1500, 500, 10000, false, 5),
  ('Business', 'High volume', 5000, 2000, 30000, false, 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Credit Usage Rates
-- =====================================================

INSERT INTO credit_usage_rates (feature_key, feature_name, credits_per_unit, unit_type, category, description) VALUES
  -- Messaging
  ('sms_outbound', 'SMS Outbound', 2, 'each', 'messaging', 'Send SMS to client'),
  ('sms_inbound', 'SMS Inbound', 1, 'each', 'messaging', 'Receive SMS from client'),
  ('ai_email', 'AI Email', 1, 'each', 'messaging', 'AI-generated email'),

  -- Voice
  ('voice_call', 'Voice Call', 2, 'minute', 'voice', 'Outbound voice call'),
  ('ai_dispatcher', 'AI Dispatcher', 10, 'minute', 'voice', 'AI-powered call answering'),
  ('voicemail_transcription', 'Voicemail Transcription', 2, 'each', 'voice', 'Transcribe voicemail'),
  ('call_recording', 'Call Recording', 1, 'minute', 'voice', 'Record call'),

  -- AI Features
  ('ai_text_generation', 'AI Text Generation', 1, 'each', 'ai', 'Generate text with AI'),
  ('ai_job_summary', 'AI Job Summary', 1, 'each', 'ai', 'AI-generated job summary'),
  ('ai_chat_response', 'AI Chat Response', 1, 'each', 'ai', 'AI chat response'),
  ('route_optimization', 'Route Optimization', 3, 'each', 'ai', 'Optimize technician routes'),
  ('ai_suggestions', 'AI Suggestions', 1, 'each', 'ai', 'AI-powered suggestions'),

  -- Documents
  ('branded_pdf', 'Branded PDF', 1, 'each', 'documents', 'PDF with custom branding'),
  ('ai_contract', 'AI Contract Generation', 2, 'each', 'documents', 'AI-generated contract'),

  -- Phone Numbers
  ('phone_number_local', 'Local Phone Number', 50, 'month', 'phone_numbers', 'Local phone number rental'),
  ('phone_number_tollfree', 'Toll-Free Phone Number', 80, 'month', 'phone_numbers', 'Toll-free number rental')
ON CONFLICT (feature_key) DO UPDATE SET
  credits_per_unit = EXCLUDED.credits_per_unit,
  updated_at = now();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get or create credit balance for an organization
CREATE OR REPLACE FUNCTION get_or_create_credit_balance(p_organization_id UUID)
RETURNS credit_balances AS $$
DECLARE
  v_balance credit_balances;
BEGIN
  SELECT * INTO v_balance FROM credit_balances WHERE organization_id = p_organization_id;

  IF NOT FOUND THEN
    INSERT INTO credit_balances (organization_id, balance)
    VALUES (p_organization_id, 0)
    RETURNING * INTO v_balance;
  END IF;

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (purchase, bonus, plan_included)
CREATE OR REPLACE FUNCTION add_credits(
  p_organization_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS credit_transactions AS $$
DECLARE
  v_balance credit_balances;
  v_transaction credit_transactions;
  v_new_balance INTEGER;
BEGIN
  -- Get or create balance
  SELECT * INTO v_balance FROM get_or_create_credit_balance(p_organization_id);

  -- Calculate new balance
  v_new_balance := v_balance.balance + p_amount;

  -- Update balance
  UPDATE credit_balances
  SET
    balance = v_new_balance,
    lifetime_purchased = CASE WHEN p_type = 'purchase' THEN lifetime_purchased + p_amount ELSE lifetime_purchased END,
    lifetime_bonus = CASE WHEN p_type IN ('bonus', 'referral', 'plan_included') THEN lifetime_bonus + p_amount ELSE lifetime_bonus END,
    updated_at = now()
  WHERE organization_id = p_organization_id;

  -- Create transaction record
  INSERT INTO credit_transactions (
    organization_id, user_id, type, amount, balance_after, description, metadata
  ) VALUES (
    p_organization_id, p_user_id, p_type, p_amount, v_new_balance, p_description, p_metadata
  ) RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use credits (deduct)
CREATE OR REPLACE FUNCTION use_credits(
  p_organization_id UUID,
  p_amount INTEGER,
  p_reference_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(success BOOLEAN, transaction_id UUID, new_balance INTEGER, error_message TEXT) AS $$
DECLARE
  v_balance credit_balances;
  v_transaction credit_transactions;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT * INTO v_balance FROM credit_balances WHERE organization_id = p_organization_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'No credit balance found'::TEXT;
    RETURN;
  END IF;

  -- Check if enough credits
  IF v_balance.balance < p_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, v_balance.balance, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Calculate new balance
  v_new_balance := v_balance.balance - p_amount;

  -- Update balance
  UPDATE credit_balances
  SET
    balance = v_new_balance,
    lifetime_used = lifetime_used + p_amount,
    updated_at = now()
  WHERE organization_id = p_organization_id;

  -- Create transaction record
  INSERT INTO credit_transactions (
    organization_id, user_id, type, amount, balance_after, description,
    reference_type, reference_id, metadata
  ) VALUES (
    p_organization_id, p_user_id, 'usage', -p_amount, v_new_balance, p_description,
    p_reference_type, p_reference_id, p_metadata
  ) RETURNING * INTO v_transaction;

  RETURN QUERY SELECT true, v_transaction.id, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if org has enough credits
CREATE OR REPLACE FUNCTION has_enough_credits(
  p_organization_id UUID,
  p_required_credits INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance FROM credit_balances WHERE organization_id = p_organization_id;
  RETURN COALESCE(v_balance, 0) >= p_required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get credit rate for a feature
CREATE OR REPLACE FUNCTION get_credit_rate(p_feature_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_rate INTEGER;
BEGIN
  SELECT credits_per_unit INTO v_rate FROM credit_usage_rates WHERE feature_key = p_feature_key AND is_active = true;
  RETURN COALESCE(v_rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-create credit balance when organization is created
CREATE OR REPLACE FUNCTION create_credit_balance_for_new_org()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credit_balances (organization_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_credit_balance ON organizations;
CREATE TRIGGER trigger_create_credit_balance
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_credit_balance_for_new_org();

-- Update loyalty tier based on lifetime spending
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
DECLARE
  v_total_spent INTEGER;
  v_new_tier TEXT;
BEGIN
  -- Calculate total spent (lifetime_purchased represents credits bought, multiply by 0.10 to get dollars)
  v_total_spent := NEW.lifetime_purchased; -- In credits, 1 credit = $0.10

  -- Determine tier (thresholds in credits: $50=500, $200=2000, $500=5000, $1000=10000)
  v_new_tier := CASE
    WHEN v_total_spent >= 10000 THEN 'platinum'
    WHEN v_total_spent >= 5000 THEN 'gold'
    WHEN v_total_spent >= 2000 THEN 'silver'
    WHEN v_total_spent >= 500 THEN 'bronze'
    ELSE 'none'
  END;

  IF NEW.loyalty_tier != v_new_tier THEN
    NEW.loyalty_tier := v_new_tier;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loyalty_tier ON credit_balances;
CREATE TRIGGER trigger_update_loyalty_tier
  BEFORE UPDATE ON credit_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- =====================================================
-- GRANT PERMISSIONS FOR SERVICE ROLE
-- =====================================================

GRANT ALL ON credit_balances TO service_role;
GRANT ALL ON credit_transactions TO service_role;
GRANT ALL ON credit_packages TO service_role;
GRANT ALL ON auto_topup_settings TO service_role;
GRANT ALL ON credit_usage_rates TO service_role;

GRANT EXECUTE ON FUNCTION get_or_create_credit_balance TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits TO service_role;
GRANT EXECUTE ON FUNCTION use_credits TO service_role;
GRANT EXECUTE ON FUNCTION has_enough_credits TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_rate TO authenticated;
