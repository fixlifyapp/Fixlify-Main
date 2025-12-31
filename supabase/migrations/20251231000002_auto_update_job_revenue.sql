-- Auto-Update Job Revenue from Payments
-- When a payment is added, updated, or deleted, automatically recalculate the job's revenue
--
-- Business Logic:
-- - Job revenue = SUM of all payments for invoices/estimates linked to that job
-- - Trigger fires on: INSERT, UPDATE, DELETE on payments table
-- - Ensures revenue is always accurate and up-to-date

-- =====================================================
-- FUNCTION: Calculate and Update Job Revenue
-- =====================================================

CREATE OR REPLACE FUNCTION update_job_revenue_from_payments()
RETURNS TRIGGER AS $$
DECLARE
    v_job_id TEXT;
    v_total_revenue NUMERIC;
BEGIN
    -- Determine which job_id to update based on the trigger operation
    IF (TG_OP = 'DELETE') THEN
        -- For DELETE, use OLD record
        -- Get job_id from the invoice associated with this payment
        SELECT i.job_id INTO v_job_id
        FROM invoices i
        WHERE i.id = OLD.invoice_id;
    ELSE
        -- For INSERT and UPDATE, use NEW record
        SELECT i.job_id INTO v_job_id
        FROM invoices i
        WHERE i.id = NEW.invoice_id;
    END IF;

    -- Only proceed if we found a job_id
    IF v_job_id IS NULL THEN
        -- This payment might be for an estimate without a job, or orphaned
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calculate total revenue for this job
    -- Sum all payments from all invoices linked to this job
    SELECT COALESCE(SUM(p.amount), 0) INTO v_total_revenue
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.job_id = v_job_id;

    -- Update the job's revenue field
    UPDATE jobs
    SET revenue = v_total_revenue,
        updated_at = NOW()
    WHERE id = v_job_id;

    -- Log the revenue update to job history (if job_history table exists)
    BEGIN
        INSERT INTO job_history (
            job_id,
            type,
            title,
            description,
            visibility,
            user_id
        ) VALUES (
            v_job_id,
            'revenue-update',
            'Revenue Updated',
            'Job revenue automatically updated to $' || v_total_revenue::TEXT || ' based on payment changes',
            'restricted',
            auth.uid()
        );
    EXCEPTION WHEN OTHERS THEN
        -- If job_history doesn't exist or insert fails, just continue
        -- This is not critical - the revenue update is what matters
        NULL;
    END;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-update job revenue on payment changes
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_job_revenue_on_payment ON payments;

CREATE TRIGGER trigger_update_job_revenue_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_job_revenue_from_payments();

-- =====================================================
-- MIGRATION: Update existing jobs with calculated revenue
-- =====================================================

-- One-time update to fix all existing jobs
-- This ensures historical data is correct

UPDATE jobs j
SET revenue = (
    SELECT COALESCE(SUM(p.amount), 0)
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.job_id = j.id
)
WHERE EXISTS (
    SELECT 1
    FROM invoices i
    WHERE i.job_id = j.id
);

-- =====================================================
-- OPTIONAL: Function to manually recalculate revenue
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_job_revenue(p_job_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_revenue NUMERIC;
BEGIN
    -- Calculate total revenue
    SELECT COALESCE(SUM(p.amount), 0) INTO v_total_revenue
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.job_id = p_job_id;

    -- Update the job
    UPDATE jobs
    SET revenue = v_total_revenue,
        updated_at = NOW()
    WHERE id = p_job_id;

    RETURN v_total_revenue;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION recalculate_job_revenue TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
--
-- After migration, verify with these queries:
--
-- 1. Check if trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_job_revenue_on_payment';
--
-- 2. Verify job revenues match payment totals:
-- SELECT
--     j.id,
--     j.revenue as current_revenue,
--     COALESCE(SUM(p.amount), 0) as calculated_revenue,
--     j.revenue - COALESCE(SUM(p.amount), 0) as difference
-- FROM jobs j
-- LEFT JOIN invoices i ON i.job_id = j.id
-- LEFT JOIN payments p ON p.invoice_id = i.id
-- GROUP BY j.id, j.revenue
-- HAVING ABS(j.revenue - COALESCE(SUM(p.amount), 0)) > 0.01;
--
-- 3. Test manual recalculation:
-- SELECT recalculate_job_revenue('your-job-id-here');
--

