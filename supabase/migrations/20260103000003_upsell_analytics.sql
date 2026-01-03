-- ============================================================================
-- Migration: Upsell Analytics System
-- Description: Create tables for tracking upsell events and analytics
-- ============================================================================

-- Track individual upsell events for detailed analytics
CREATE TABLE IF NOT EXISTS upsell_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('estimate', 'invoice')),
  document_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('shown', 'accepted', 'rejected', 'auto_added', 'removed')),
  job_type TEXT,
  technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated daily stats for fast dashboard queries
CREATE TABLE IF NOT EXISTS upsell_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  shown_count INT DEFAULT 0,
  accepted_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  UNIQUE(company_id, date, product_id, document_type)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_upsell_events_company_date ON upsell_events(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upsell_events_product ON upsell_events(product_id);
CREATE INDEX IF NOT EXISTS idx_upsell_events_document ON upsell_events(document_id);
CREATE INDEX IF NOT EXISTS idx_upsell_events_technician ON upsell_events(technician_id);
CREATE INDEX IF NOT EXISTS idx_upsell_daily_stats_lookup ON upsell_daily_stats(company_id, date DESC);

-- Extend products table with cost_price, is_featured, conversion_hint
ALTER TABLE products
ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS conversion_hint TEXT;

-- Comment on columns
COMMENT ON COLUMN products.cost_price IS 'Cost price for profit margin calculation';
COMMENT ON COLUMN products.is_featured IS 'Whether this product should be highlighted as a top seller';
COMMENT ON COLUMN products.conversion_hint IS 'Hint text shown to technicians (e.g., "High adoption rate")';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE upsell_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS for upsell_events - users can see their company's events
CREATE POLICY "Users can view own company upsell events"
  ON upsell_events FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company upsell events"
  ON upsell_events FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS for upsell_daily_stats - users can see their company's stats
CREATE POLICY "Users can view own company upsell stats"
  ON upsell_daily_stats FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company upsell stats"
  ON upsell_daily_stats FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company upsell stats"
  ON upsell_daily_stats FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- Function to aggregate daily stats (called by trigger or scheduled job)
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_upsell_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO upsell_daily_stats (company_id, date, product_id, document_type, shown_count, accepted_count, rejected_count, total_revenue)
  VALUES (
    NEW.company_id,
    DATE(NEW.created_at),
    NEW.product_id,
    NEW.document_type,
    CASE WHEN NEW.event_type = 'shown' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('accepted', 'auto_added') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('rejected', 'removed') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('accepted', 'auto_added') THEN NEW.product_price ELSE 0 END
  )
  ON CONFLICT (company_id, date, product_id, document_type)
  DO UPDATE SET
    shown_count = upsell_daily_stats.shown_count + CASE WHEN NEW.event_type = 'shown' THEN 1 ELSE 0 END,
    accepted_count = upsell_daily_stats.accepted_count + CASE WHEN NEW.event_type IN ('accepted', 'auto_added') THEN 1 ELSE 0 END,
    rejected_count = upsell_daily_stats.rejected_count + CASE WHEN NEW.event_type IN ('rejected', 'removed') THEN 1 ELSE 0 END,
    total_revenue = upsell_daily_stats.total_revenue + CASE WHEN NEW.event_type IN ('accepted', 'auto_added') THEN NEW.product_price ELSE 0 END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-aggregate stats on new events
CREATE TRIGGER trigger_aggregate_upsell_stats
  AFTER INSERT ON upsell_events
  FOR EACH ROW
  EXECUTE FUNCTION aggregate_upsell_daily_stats();
