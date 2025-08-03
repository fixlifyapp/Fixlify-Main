-- Drop and recreate the function to handle all entity types
DROP FUNCTION IF EXISTS get_next_document_number(TEXT);

CREATE OR REPLACE FUNCTION get_next_document_number(
    p_entity_type text,
    p_user_id uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_number bigint;
    v_prefix text;
    v_actual_user_id uuid;
BEGIN
    -- Get the actual user ID (use parameter or current auth.uid())
    v_actual_user_id := COALESCE(p_user_id, auth.uid());
    
    -- For global counters (estimate, invoice), use NULL user_id
    -- For user-specific counters (job, client), use the actual user_id
    IF p_entity_type IN ('estimate', 'invoice') THEN
        v_actual_user_id := NULL;
    END IF;

    -- Lock the row to prevent concurrent access
    UPDATE id_counters
    SET current_value = current_value + 1,
        updated_at = NOW()
    WHERE entity_type = p_entity_type
    AND (user_id = v_actual_user_id OR (user_id IS NULL AND v_actual_user_id IS NULL))
    RETURNING current_value, prefix INTO v_next_number, v_prefix;
    
    -- If no row was updated, create a new counter
    IF NOT FOUND THEN
        -- Determine starting value and prefix based on entity type
        CASE p_entity_type
            WHEN 'estimate' THEN
                -- Get the maximum existing estimate number
                SELECT COALESCE(MAX(CAST(estimate_number AS INTEGER)), 999) + 1
                INTO v_next_number
                FROM estimates
                WHERE estimate_number ~ '^\d+$';
                v_prefix := '';
                
            WHEN 'invoice' THEN
                -- Get the maximum existing invoice number
                SELECT COALESCE(MAX(CAST(REPLACE(invoice_number, 'INV-', '') AS INTEGER)), 999) + 1
                INTO v_next_number
                FROM invoices
                WHERE invoice_number LIKE 'INV-%';
                v_prefix := 'INV';
                
            WHEN 'job' THEN
                -- Get the maximum existing job number for this user
                SELECT COALESCE(MAX(CAST(REPLACE(id, 'J-', '') AS INTEGER)), 999) + 1
                INTO v_next_number
                FROM jobs
                WHERE id LIKE 'J-%' 
                AND user_id = v_actual_user_id;
                v_prefix := 'J';
                
            WHEN 'client' THEN
                -- Get the maximum existing client number for this user
                SELECT COALESCE(MAX(CAST(REPLACE(id, 'C-', '') AS INTEGER)), 1999) + 1
                INTO v_next_number
                FROM clients
                WHERE id LIKE 'C-%'
                AND user_id = v_actual_user_id;
                v_prefix := 'C';
                
            WHEN 'payment' THEN
                -- Default starting value for payments
                v_next_number := 1000;
                v_prefix := 'PAY';
                
            ELSE
                RAISE EXCEPTION 'Invalid entity type: %', p_entity_type;
        END CASE;
        
        -- Insert the new counter
        INSERT INTO id_counters (
            entity_type, 
            prefix, 
            current_value, 
            start_value, 
            user_id, 
            created_at, 
            updated_at
        )
        VALUES (
            p_entity_type, 
            v_prefix, 
            v_next_number, 
            v_next_number - 1, 
            v_actual_user_id, 
            NOW(), 
            NOW()
        );
    END IF;
    
    -- Return the formatted number based on entity type
    CASE p_entity_type
        WHEN 'estimate' THEN
            RETURN v_next_number::text;
        WHEN 'invoice' THEN
            RETURN 'INV-' || v_next_number::text;
        WHEN 'job' THEN
            RETURN 'J-' || v_next_number::text;
        WHEN 'client' THEN
            RETURN 'C-' || v_next_number::text;
        WHEN 'payment' THEN
            RETURN 'PAY-' || v_next_number::text;
        ELSE
            RETURN v_prefix || '-' || v_next_number::text;
    END CASE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_next_document_number TO authenticated;

-- Test the function
-- SELECT get_next_document_number('client');
-- SELECT get_next_document_number('job');
