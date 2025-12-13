-- SQL to ensure all users have proper id_counters for all entity types
-- Run this in Supabase SQL editor

-- Create a function to initialize id_counters for a user
CREATE OR REPLACE FUNCTION initialize_user_id_counters(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_entity_types text[] := ARRAY['invoice', 'estimate', 'payment', 'job', 'client'];
  v_entity_type text;
  v_prefix text;
  v_start_value int;
BEGIN
  FOREACH v_entity_type IN ARRAY v_entity_types
  LOOP
    -- Determine prefix and start value based on entity type
    CASE v_entity_type
      WHEN 'invoice' THEN 
        v_prefix := 'INV';
        v_start_value := 1000;
      WHEN 'estimate' THEN 
        v_prefix := '';
        v_start_value := 1000;
      WHEN 'payment' THEN 
        v_prefix := 'PAY';
        v_start_value := 1000;
      WHEN 'job' THEN 
        v_prefix := 'J';
        v_start_value := 1000;
      WHEN 'client' THEN 
        v_prefix := 'C';
        v_start_value := 2000;
    END CASE;
    
    -- Insert if not exists
    INSERT INTO id_counters (entity_type, prefix, current_value, start_value, user_id)
    VALUES (v_entity_type, v_prefix, v_start_value, v_start_value, p_user_id)
    ON CONFLICT (entity_type, user_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Initialize for all existing users
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  FOR v_user_id IN (SELECT id FROM auth.users)
  LOOP
    PERFORM initialize_user_id_counters(v_user_id);
  END LOOP;
END $$;

-- Create a trigger to auto-initialize for new users
CREATE OR REPLACE FUNCTION auto_initialize_id_counters()
RETURNS trigger AS $$
BEGIN
  PERFORM initialize_user_id_counters(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_id_counters ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created_id_counters
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_initialize_id_counters();
-- Enhanced RPC function to handle all entity types
CREATE OR REPLACE FUNCTION update_document_counter_higher_only(
  p_user_id uuid,
  p_document_type text,
  p_new_number int
)
RETURNS jsonb AS $$
DECLARE
  v_current_value int;
  v_result jsonb;
BEGIN
  -- Get current value
  SELECT current_value INTO v_current_value
  FROM id_counters
  WHERE entity_type = p_document_type
  AND user_id = p_user_id;
  
  -- If no counter exists, create it
  IF v_current_value IS NULL THEN
    -- Determine defaults based on entity type
    CASE p_document_type
      WHEN 'client' THEN
        INSERT INTO id_counters (entity_type, prefix, current_value, start_value, user_id)
        VALUES (p_document_type, 'C', p_new_number, p_new_number, p_user_id);
      WHEN 'job' THEN
        INSERT INTO id_counters (entity_type, prefix, current_value, start_value, user_id)
        VALUES (p_document_type, 'J', p_new_number, p_new_number, p_user_id);
      WHEN 'invoice' THEN
        INSERT INTO id_counters (entity_type, prefix, current_value, start_value, user_id)
        VALUES (p_document_type, 'INV', p_new_number, p_new_number, p_user_id);
      WHEN 'estimate' THEN
        INSERT INTO id_counters (entity_type, prefix, current_value, start_value, user_id)
        VALUES (p_document_type, '', p_new_number, p_new_number, p_user_id);
      WHEN 'payment' THEN
        INSERT INTO id_counters (entity_type, prefix, current_value, start_value, user_id)
        VALUES (p_document_type, 'PAY', p_new_number, p_new_number, p_user_id);
      ELSE
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Invalid document type: ' || p_document_type
        );
    END CASE;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Counter created and set to ' || p_new_number
    );
  END IF;
  
  -- Check if new number is higher
  IF p_new_number <= v_current_value THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'New number must be higher than current value (' || v_current_value || ')'
    );
  END IF;
  
  -- Update the counter
  UPDATE id_counters
  SET current_value = p_new_number,
      updated_at = now()
  WHERE entity_type = p_document_type
  AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Counter updated from ' || v_current_value || ' to ' || p_new_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
