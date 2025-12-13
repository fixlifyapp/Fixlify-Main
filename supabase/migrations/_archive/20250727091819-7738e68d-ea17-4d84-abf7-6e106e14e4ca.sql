-- Remove complex SQL functions and add simple validation function
DROP FUNCTION IF EXISTS public.safe_reset_document_counter(uuid, text, integer);
DROP FUNCTION IF EXISTS public.suggest_safe_reset_value(uuid, text);
DROP FUNCTION IF EXISTS public.get_highest_document_number(uuid, text);
DROP FUNCTION IF EXISTS public.extract_number_from_document(text);

-- Create simple update function that only allows higher numbers
CREATE OR REPLACE FUNCTION public.update_document_counter_higher_only(
    p_user_id uuid,
    p_document_type text,
    p_new_number integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_value integer;
    v_result jsonb;
BEGIN
    -- Get current counter value
    SELECT current_value INTO v_current_value
    FROM public.id_counters
    WHERE entity_type = p_document_type 
    AND user_id = p_user_id;
    
    -- If no counter exists, create it with the new value
    IF v_current_value IS NULL THEN
        INSERT INTO public.id_counters (
            entity_type, 
            user_id, 
            current_value, 
            start_value,
            prefix
        ) VALUES (
            p_document_type,
            p_user_id,
            p_new_number - 1,
            p_new_number,
            CASE p_document_type
                WHEN 'invoice' THEN 'INV'
                WHEN 'payment' THEN 'PAY'
                ELSE ''
            END
        );
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Counter created successfully',
            'new_current_value', p_new_number - 1,
            'next_number', p_new_number
        );
    END IF;
    
    -- Validate that new number is higher than current
    IF p_new_number <= v_current_value THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('New number (%s) must be higher than current counter (%s)', p_new_number, v_current_value),
            'current_value', v_current_value
        );
    END IF;
    
    -- Update counter to new value minus 1 (so next document gets the new number)
    UPDATE public.id_counters
    SET current_value = p_new_number - 1,
        start_value = p_new_number,
        updated_at = now()
    WHERE entity_type = p_document_type 
    AND user_id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Counter updated successfully. Next %s will be #%s', p_document_type, p_new_number),
        'new_current_value', p_new_number - 1,
        'next_number', p_new_number
    );
END;
$$;