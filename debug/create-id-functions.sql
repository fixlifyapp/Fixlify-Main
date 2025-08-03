-- Create or replace the atomic get_next_document_number function
-- This ensures no duplicates across all document types

CREATE OR REPLACE FUNCTION get_next_document_number(
  p_entity_type TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_current_value INTEGER;
  v_prefix TEXT;
  v_new_value INTEGER;
  v_formatted_id TEXT;
  v_actual_user_id UUID;
BEGIN
  -- Get the actual user ID (use parameter or current auth.uid())
  v_actual_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Ensure we have a user ID
  IF v_actual_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Lock the row for update to prevent concurrent access
  SELECT current_value, prefix
  INTO v_current_value, v_prefix
  FROM id_counters
  WHERE entity_type = p_entity_type
    AND (user_id = v_actual_user_id OR user_id IS NULL)
  FOR UPDATE;

  -- If no counter exists, create one with default values
  IF NOT FOUND THEN
    -- Set default values based on entity type
    CASE p_entity_type
      WHEN 'client' THEN
        v_current_value := 1999;  -- Will increment to 2000
        v_prefix := 'C';
      WHEN 'job' THEN
        v_current_value := 999;   -- Will increment to 1000
        v_prefix := 'J';
      WHEN 'invoice' THEN
        v_current_value := 999;   -- Will increment to 1000
        v_prefix := 'INV';
      WHEN 'estimate' THEN
        v_current_value := 999;   -- Will increment to 1000
        v_prefix := '';
      WHEN 'payment' THEN
        v_current_value := 999;   -- Will increment to 1000
        v_prefix := 'PAY';
      ELSE
        v_current_value := 999;
        v_prefix := UPPER(LEFT(p_entity_type, 3));
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
    ) VALUES (
      p_entity_type,
      v_prefix,
      v_current_value,
      v_current_value + 1,
      v_actual_user_id,
      NOW(),
      NOW()
    );
  END IF;

  -- Increment the counter
  v_new_value := v_current_value + 1;

  -- Update the counter
  UPDATE id_counters
  SET current_value = v_new_value,
      updated_at = NOW()
  WHERE entity_type = p_entity_type
    AND (user_id = v_actual_user_id OR user_id IS NULL);

  -- Format the ID based on entity type
  CASE p_entity_type
    WHEN 'estimate' THEN
      v_formatted_id := v_new_value::TEXT;
    WHEN 'invoice' THEN
      v_formatted_id := 'INV-' || v_new_value::TEXT;
    ELSE
      v_formatted_id := v_prefix || '-' || v_new_value::TEXT;
  END CASE;

  RETURN v_formatted_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_next_document_number TO authenticated;

-- Also create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_document_counter_higher_only(
  p_user_id UUID,
  p_document_type TEXT,
  p_new_number INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_current_value INTEGER;
  v_result JSON;
BEGIN
  -- Get current counter value
  SELECT current_value
  INTO v_current_value
  FROM id_counters
  WHERE entity_type = p_document_type
    AND user_id = p_user_id;

  -- Check if new number is higher
  IF v_current_value IS NULL THEN
    -- Counter doesn't exist, create it
    INSERT INTO id_counters (
      entity_type,
      current_value,
      start_value,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      p_document_type,
      p_new_number,
      p_new_number,
      p_user_id,
      NOW(),
      NOW()
    );
    
    v_result := json_build_object(
      'success', true,
      'message', 'Counter created with value ' || p_new_number
    );
  ELSIF p_new_number > v_current_value THEN
    -- Update to higher number
    UPDATE id_counters
    SET current_value = p_new_number,
        updated_at = NOW()
    WHERE entity_type = p_document_type
      AND user_id = p_user_id;
      
    v_result := json_build_object(
      'success', true,
      'message', 'Counter updated from ' || v_current_value || ' to ' || p_new_number
    );
  ELSE
    -- Number is not higher
    v_result := json_build_object(
      'success', false,
      'error', 'New number must be higher than current value (' || v_current_value || ')'
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_document_counter_higher_only TO authenticated;
