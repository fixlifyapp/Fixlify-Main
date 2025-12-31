-- Phase 2: Phone Number Pool System
-- Numbers are purchased by admin into a pool, then assigned to organizations

-- Add pool_status column to distinguish pool vs assigned numbers
ALTER TABLE phone_numbers
ADD COLUMN IF NOT EXISTS pool_status TEXT DEFAULT 'assigned'
CHECK (pool_status IN ('available', 'assigned'));

-- Add assignment tracking columns
ALTER TABLE phone_numbers
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id);

-- Add admin flag to track if number was bulk-purchased by admin
ALTER TABLE phone_numbers
ADD COLUMN IF NOT EXISTS is_admin_purchased BOOLEAN DEFAULT false;

-- Create index for pool queries (fast lookup of available numbers)
CREATE INDEX IF NOT EXISTS idx_phone_numbers_pool_status ON phone_numbers(pool_status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_pool_available ON phone_numbers(pool_status, organization_id)
WHERE pool_status = 'available';

-- Update existing numbers: those without org are in pool, those with org are assigned
UPDATE phone_numbers
SET pool_status = CASE
  WHEN organization_id IS NULL AND user_id IS NULL THEN 'available'
  ELSE 'assigned'
END,
assigned_at = CASE
  WHEN organization_id IS NOT NULL THEN COALESCE(purchased_at, NOW())
  ELSE NULL
END
WHERE pool_status IS NULL OR pool_status = 'assigned';

-- Drop old policies that may conflict
DROP POLICY IF EXISTS "Users can view available and own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can purchase available phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can update their own phone numbers" ON phone_numbers;
DROP POLICY IF EXISTS "Users can insert purchased phone numbers" ON phone_numbers;

-- New RLS Policies for pool system

-- Users can view: pool numbers (available) + their organization's numbers
CREATE POLICY "phone_numbers_select_policy" ON phone_numbers
  FOR SELECT
  USING (
    pool_status = 'available'  -- Anyone can see available pool numbers
    OR organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only service role can insert (admin bulk purchase)
-- Regular users cannot directly insert phone numbers
CREATE POLICY "phone_numbers_insert_admin_only" ON phone_numbers
  FOR INSERT
  WITH CHECK (false);  -- Blocked for regular users, service role bypasses RLS

-- Users can update their organization's numbers (set primary, friendly name, etc.)
CREATE POLICY "phone_numbers_update_org" ON phone_numbers
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create function to assign a pool number to an organization
CREATE OR REPLACE FUNCTION assign_phone_to_organization(
  p_phone_number TEXT,
  p_organization_id UUID,
  p_assigned_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  UPDATE phone_numbers
  SET
    pool_status = 'assigned',
    organization_id = p_organization_id,
    assigned_at = NOW(),
    assigned_by = p_assigned_by,
    status = 'active'
  WHERE phone_number = p_phone_number
    AND pool_status = 'available'
    AND organization_id IS NULL;

  IF FOUND THEN
    v_success := true;

    -- Check if org has a primary number, if not set this as primary
    IF NOT EXISTS (
      SELECT 1 FROM phone_numbers
      WHERE organization_id = p_organization_id
        AND is_primary = true
    ) THEN
      UPDATE phone_numbers
      SET is_primary = true
      WHERE phone_number = p_phone_number;
    END IF;
  END IF;

  RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to release a number back to the pool
CREATE OR REPLACE FUNCTION release_phone_to_pool(
  p_phone_number TEXT,
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
  v_was_primary BOOLEAN;
BEGIN
  -- Check if this was the primary number
  SELECT is_primary INTO v_was_primary
  FROM phone_numbers
  WHERE phone_number = p_phone_number
    AND organization_id = p_organization_id;

  UPDATE phone_numbers
  SET
    pool_status = 'available',
    organization_id = NULL,
    user_id = NULL,
    assigned_at = NULL,
    assigned_by = NULL,
    is_primary = false,
    status = 'available'
  WHERE phone_number = p_phone_number
    AND organization_id = p_organization_id;

  IF FOUND THEN
    v_success := true;

    -- If was primary, set another number as primary
    IF v_was_primary THEN
      UPDATE phone_numbers
      SET is_primary = true
      WHERE phone_number = (
        SELECT phone_number FROM phone_numbers
        WHERE organization_id = p_organization_id
          AND pool_status = 'assigned'
          AND is_primary = false
        LIMIT 1
      );
    END IF;
  END IF;

  RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get organization's primary phone number
CREATE OR REPLACE FUNCTION get_org_primary_phone(p_organization_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_phone TEXT;
BEGIN
  SELECT phone_number INTO v_phone
  FROM phone_numbers
  WHERE organization_id = p_organization_id
    AND pool_status = 'assigned'
    AND is_primary = true
    AND status IN ('active', 'purchased')
  LIMIT 1;

  -- Fallback: get any active number for the org
  IF v_phone IS NULL THEN
    SELECT phone_number INTO v_phone
    FROM phone_numbers
    WHERE organization_id = p_organization_id
      AND pool_status = 'assigned'
      AND status IN ('active', 'purchased')
    LIMIT 1;
  END IF;

  RETURN v_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION assign_phone_to_organization TO authenticated;
GRANT EXECUTE ON FUNCTION release_phone_to_pool TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_primary_phone TO authenticated;

COMMENT ON COLUMN phone_numbers.pool_status IS 'available = in admin pool, assigned = assigned to an organization';
COMMENT ON COLUMN phone_numbers.is_admin_purchased IS 'true if purchased via admin bulk purchase';
COMMENT ON FUNCTION assign_phone_to_organization IS 'Assigns an available pool number to an organization';
COMMENT ON FUNCTION release_phone_to_pool IS 'Releases an organization number back to the available pool';
COMMENT ON FUNCTION get_org_primary_phone IS 'Gets the primary phone number for an organization';
