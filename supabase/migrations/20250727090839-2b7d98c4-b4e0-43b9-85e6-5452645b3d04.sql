-- Create a function to get the highest document number for a document type
CREATE OR REPLACE FUNCTION public.get_highest_document_number(p_user_id uuid, p_document_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_highest_invoice integer := 0;
  v_highest_estimate integer := 0;
  v_highest_payment integer := 0;
  v_result integer := 0;
BEGIN
  -- Check invoices table
  IF p_document_type = 'invoice' THEN
    SELECT COALESCE(MAX(
      CASE 
        WHEN invoice_number ~ '^[A-Z]*-?([0-9]+)$' 
        THEN (regexp_matches(invoice_number, '[0-9]+$'))[1]::integer
        WHEN invoice_number ~ '^[0-9]+$'
        THEN invoice_number::integer
        ELSE 0
      END
    ), 0) INTO v_result
    FROM invoices 
    WHERE user_id = p_user_id;
  END IF;

  -- Check estimates table
  IF p_document_type = 'estimate' THEN
    SELECT COALESCE(MAX(
      CASE 
        WHEN estimate_number ~ '^[A-Z]*-?([0-9]+)$' 
        THEN (regexp_matches(estimate_number, '[0-9]+$'))[1]::integer
        WHEN estimate_number ~ '^[0-9]+$'
        THEN estimate_number::integer
        ELSE 0
      END
    ), 0) INTO v_result
    FROM estimates 
    WHERE user_id = p_user_id;
  END IF;

  -- Check payments table (if it exists)
  IF p_document_type = 'payment' THEN
    BEGIN
      SELECT COALESCE(MAX(
        CASE 
          WHEN payment_number ~ '^[A-Z]*-?([0-9]+)$' 
          THEN (regexp_matches(payment_number, '[0-9]+$'))[1]::integer
          WHEN payment_number ~ '^[0-9]+$'
          THEN payment_number::integer
          ELSE 0
        END
      ), 0) INTO v_result
      FROM payments 
      WHERE user_id = p_user_id;
    EXCEPTION
      WHEN undefined_table THEN
        v_result := 0;
    END;
  END IF;

  RETURN v_result;
END;
$$;

-- Create a function to suggest safe reset value
CREATE OR REPLACE FUNCTION public.suggest_safe_reset_value(p_user_id uuid, p_document_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_highest integer;
  v_suggested integer;
BEGIN
  -- Get the highest existing document number
  v_highest := public.get_highest_document_number(p_user_id, p_document_type);
  
  -- Suggest a number that's at least 100 higher than the highest existing
  -- Round up to nearest hundred for clean numbering
  v_suggested := ((v_highest / 100) + 2) * 100;
  
  -- Minimum suggestion is 1000 for professional appearance
  IF v_suggested < 1000 THEN
    v_suggested := 1000;
  END IF;
  
  RETURN v_suggested;
END;
$$;

-- Create a function to safely reset counter
CREATE OR REPLACE FUNCTION public.safe_reset_document_counter(p_user_id uuid, p_document_type text, p_new_start_value integer DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_highest integer;
  v_suggested integer;
  v_final_value integer;
  v_result jsonb;
BEGIN
  -- Get current highest document number
  v_highest := public.get_highest_document_number(p_user_id, p_document_type);
  v_suggested := public.suggest_safe_reset_value(p_user_id, p_document_type);
  
  -- Use provided value or suggested safe value
  v_final_value := COALESCE(p_new_start_value, v_suggested);
  
  -- Validate that the new start value won't create duplicates
  IF v_final_value <= v_highest THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot reset to ' || v_final_value || '. Highest existing document number is ' || v_highest,
      'highest_existing', v_highest,
      'suggested_safe_value', v_suggested
    );
  END IF;
  
  -- Perform the reset
  UPDATE id_counters
  SET 
    start_value = v_final_value,
    current_value = v_final_value - 1,
    updated_at = NOW()
  WHERE user_id = p_user_id AND entity_type = p_document_type;
  
  -- If no row exists, create it
  IF NOT FOUND THEN
    INSERT INTO id_counters (user_id, entity_type, start_value, current_value)
    VALUES (p_user_id, p_document_type, v_final_value, v_final_value - 1);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Counter reset safely to ' || v_final_value,
    'new_start_value', v_final_value,
    'highest_existing', v_highest,
    'next_number', v_final_value
  );
END;
$$;