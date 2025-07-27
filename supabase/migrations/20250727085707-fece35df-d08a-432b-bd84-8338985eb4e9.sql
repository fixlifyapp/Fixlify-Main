-- Create a comprehensive niche switch function that ensures full product loading
CREATE OR REPLACE FUNCTION public.switch_business_niche_comprehensive(p_user_id uuid, p_business_niche text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result jsonb;
  v_product_count integer;
BEGIN
  -- Update profile and company settings
  UPDATE public.profiles 
  SET business_niche = p_business_niche, updated_at = NOW()
  WHERE id = p_user_id;
  
  UPDATE public.company_settings 
  SET business_niche = p_business_niche, business_type = p_business_niche, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Clear existing niche-specific data but keep universal data
  DELETE FROM public.products WHERE user_id = p_user_id;
  DELETE FROM public.tags WHERE user_id = p_user_id;
  DELETE FROM public.job_types WHERE user_id = p_user_id;
  -- DO NOT DELETE lead_sources, payment_methods, job_statuses
  
  -- Load comprehensive products using the direct function
  SELECT public.load_niche_products_direct(p_user_id, p_business_niche) INTO v_result;
  
  -- Load the enhanced initialization for other data
  PERFORM public.initialize_user_data_complete_enhanced(p_user_id, p_business_niche);
  
  -- Count final products to verify
  SELECT COUNT(*) INTO v_product_count
  FROM public.products
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'business_niche', p_business_niche,
    'products_loaded', v_product_count,
    'message', format('Successfully switched to %s with %s products', p_business_niche, v_product_count)
  );
END;
$function$;