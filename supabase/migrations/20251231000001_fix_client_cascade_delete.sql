-- Fix Client Delete Cascade Issues - Orphaned jobs remain
-- When a client is deleted, all related data should be cascaded appropriately
--
-- Strategy:
-- 1. For critical business data (jobs, invoices, estimates, payments): ADD CASCADE DELETE
-- 2. This ensures when a client is deleted, all their data is properly cleaned up
-- 3. We'll use conditional logic to handle existing constraints

-- =====================================================
-- 1. FIX JOBS TABLE - MOST CRITICAL
-- =====================================================

-- Drop existing constraint if it exists (without cascade)
DO $$
BEGIN
    -- Find and drop the existing foreign key constraint on jobs.client_id
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'jobs'
          AND kcu.column_name = 'client_id'
          AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Get the constraint name and drop it
        EXECUTE (
            SELECT 'ALTER TABLE jobs DROP CONSTRAINT ' || tc.constraint_name || ';'
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'jobs'
              AND kcu.column_name = 'client_id'
              AND tc.constraint_type = 'FOREIGN KEY'
            LIMIT 1
        );
    END IF;
END$$;

-- Add new constraint WITH CASCADE DELETE
ALTER TABLE jobs
ADD CONSTRAINT jobs_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- =====================================================
-- 2. FIX INVOICES TABLE
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'invoices'
          AND kcu.column_name = 'client_id'
          AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE invoices DROP CONSTRAINT ' || tc.constraint_name || ';'
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'invoices'
              AND kcu.column_name = 'client_id'
              AND tc.constraint_type = 'FOREIGN KEY'
            LIMIT 1
        );
    END IF;
END$$;

ALTER TABLE invoices
ADD CONSTRAINT invoices_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- =====================================================
-- 3. FIX ESTIMATES TABLE
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'estimates'
          AND kcu.column_name = 'client_id'
          AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE estimates DROP CONSTRAINT ' || tc.constraint_name || ';'
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'estimates'
              AND kcu.column_name = 'client_id'
              AND tc.constraint_type = 'FOREIGN KEY'
            LIMIT 1
        );
    END IF;
END$$;

ALTER TABLE estimates
ADD CONSTRAINT estimates_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- =====================================================
-- 4. FIX PAYMENTS TABLE
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'payments'
          AND kcu.column_name = 'client_id'
          AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE payments DROP CONSTRAINT ' || tc.constraint_name || ';'
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'payments'
              AND kcu.column_name = 'client_id'
              AND tc.constraint_type = 'FOREIGN KEY'
            LIMIT 1
        );
    END IF;
END$$;

ALTER TABLE payments
ADD CONSTRAINT payments_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE;

-- =====================================================
-- 5. FIX JOB_HISTORY TABLE (if it exists)
-- =====================================================

DO $$
BEGIN
    -- Only proceed if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_history') THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'job_history'
              AND kcu.column_name = 'client_id'
              AND tc.constraint_type = 'FOREIGN KEY'
        ) THEN
            EXECUTE (
                SELECT 'ALTER TABLE job_history DROP CONSTRAINT ' || tc.constraint_name || ';'
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_name = 'job_history'
                  AND kcu.column_name = 'client_id'
                  AND tc.constraint_type = 'FOREIGN KEY'
                LIMIT 1
            );
        END IF;

        EXECUTE 'ALTER TABLE job_history
                 ADD CONSTRAINT job_history_client_id_fkey
                 FOREIGN KEY (client_id)
                 REFERENCES clients(id)
                 ON DELETE CASCADE';
    END IF;
END$$;

-- =====================================================
-- 6. CREATE AUDIT LOG FUNCTION (Optional - for tracking deletions)
-- =====================================================

CREATE OR REPLACE FUNCTION log_client_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Log client deletion for audit purposes
    INSERT INTO admin_audit_log (
        action,
        table_name,
        record_id,
        old_data,
        created_at
    ) VALUES (
        'DELETE',
        'clients',
        OLD.id,
        to_jsonb(OLD),
        NOW()
    );

    RETURN OLD;
EXCEPTION WHEN OTHERS THEN
    -- If audit table doesn't exist, just continue with deletion
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log deletions (only if audit table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_log') THEN
        DROP TRIGGER IF EXISTS client_deletion_audit_trigger ON clients;
        CREATE TRIGGER client_deletion_audit_trigger
            BEFORE DELETE ON clients
            FOR EACH ROW
            EXECUTE FUNCTION log_client_deletion();
    END IF;
END$$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this after migration to verify all constraints are correct:
--
-- SELECT
--     tc.table_name,
--     kcu.column_name,
--     rc.delete_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--   ON rc.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND ccu.table_name = 'clients'
--   AND tc.table_schema = 'public'
-- ORDER BY tc.table_name;
--
-- Expected result: All delete_rule values should be 'CASCADE'

