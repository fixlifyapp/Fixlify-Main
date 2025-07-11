-- Drop existing function if it exists
DROP FUNCTION IF EXISTS initialize_user_data_with_enhanced_niche_data(UUID, TEXT);

-- Create function to initialize user data with enhanced niche data
CREATE OR REPLACE FUNCTION initialize_user_data_with_enhanced_niche_data(
  p_user_id UUID,
  p_business_niche TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_deleted_products INTEGER := 0;
  v_deleted_tags INTEGER := 0;
  v_deleted_job_types INTEGER := 0;
  v_deleted_lead_sources INTEGER := 0;
BEGIN
  -- Delete existing data for the user (except job statuses and payment methods)
  DELETE FROM products WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_deleted_products = ROW_COUNT;
  
  DELETE FROM tags WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_deleted_tags = ROW_COUNT;
  
  DELETE FROM job_types WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_deleted_job_types = ROW_COUNT;
  
  DELETE FROM lead_sources WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_deleted_lead_sources = ROW_COUNT;
  
  -- Note: The frontend will handle creating the new niche-specific data
  -- This function just clears the old data to prepare for the new data
  
  v_result := json_build_object(
    'success', true,
    'deleted', json_build_object(
      'products', v_deleted_products,
      'tags', v_deleted_tags,
      'job_types', v_deleted_job_types,
      'lead_sources', v_deleted_lead_sources
    ),
    'message', 'Old data cleared successfully. Ready for new niche data.'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to clear old data'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION initialize_user_data_with_enhanced_niche_data(UUID, TEXT) TO authenticated;

-- Also ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_job_types_user_id ON job_types(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_user_id ON lead_sources(user_id);

-- Add a helper function to get niche-specific counts
CREATE OR REPLACE FUNCTION get_user_niche_data_counts(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_product_count INTEGER;
  v_tag_count INTEGER;
  v_job_type_count INTEGER;
  v_lead_source_count INTEGER;
  v_job_status_count INTEGER;
  v_business_niche TEXT;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO v_product_count FROM products WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_tag_count FROM tags WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_job_type_count FROM job_types WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_lead_source_count FROM lead_sources WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_job_status_count FROM job_statuses WHERE user_id = p_user_id;
  
  -- Get business niche
  SELECT business_niche INTO v_business_niche FROM profiles WHERE id = p_user_id;
  
  v_result := json_build_object(
    'business_niche', v_business_niche,
    'counts', json_build_object(
      'products', v_product_count,
      'tags', v_tag_count,
      'job_types', v_job_type_count,
      'lead_sources', v_lead_source_count,
      'job_statuses', v_job_status_count
    )
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_niche_data_counts(UUID) TO authenticated; 