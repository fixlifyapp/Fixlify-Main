-- Comprehensive fix for products functionality
-- Run this in Supabase SQL Editor

-- 1. First, ensure the products table has proper constraints
ALTER TABLE products 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN category SET NOT NULL;

-- 2. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- 3. Fix any products with missing user_id (shouldn't be any, but just in case)
UPDATE products 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- 4. Create a function to safely get products with computed fields
CREATE OR REPLACE FUNCTION get_user_products(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  price numeric,
  ourPrice numeric,
  cost numeric,
  taxable boolean,
  tags text[],
  sku text,
  created_at timestamptz,
  updated_at timestamptz,
  user_id uuid,
  created_by uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.price,
    COALESCE(p.ourprice, p.cost, 0::numeric) as ourPrice,
    p.cost,
    p.taxable,
    p.tags,
    p.sku,
    p.created_at,
    p.updated_at,
    p.user_id,
    p.created_by
  FROM products p
  WHERE p.user_id = p_user_id
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_products(uuid) TO authenticated;

-- 6. Create a function to handle product creation with proper validation
CREATE OR REPLACE FUNCTION create_product(
  p_name text,
  p_description text,
  p_category text,
  p_price numeric,
  p_ourprice numeric,
  p_cost numeric,
  p_taxable boolean DEFAULT true,
  p_tags text[] DEFAULT '{}',
  p_sku text DEFAULT NULL
)
RETURNS products AS $$
DECLARE
  v_product products;
  v_user_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Validate inputs
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Product name is required';
  END IF;
  
  IF p_category IS NULL OR trim(p_category) = '' THEN
    RAISE EXCEPTION 'Product category is required';
  END IF;
  
  -- Insert the product
  INSERT INTO products (
    name,
    description,
    category,
    price,
    ourprice,
    cost,
    taxable,
    tags,
    sku,
    user_id,
    created_by
  ) VALUES (
    trim(p_name),
    p_description,
    trim(p_category),
    COALESCE(p_price, 0),
    COALESCE(p_ourprice, p_cost, 0),
    COALESCE(p_cost, 0),
    p_taxable,
    p_tags,
    p_sku,
    v_user_id,
    v_user_id
  )
  RETURNING * INTO v_product;
  
  RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission
GRANT EXECUTE ON FUNCTION create_product(text, text, text, numeric, numeric, numeric, boolean, text[], text) TO authenticated;

-- 8. Create view for easier product access
CREATE OR REPLACE VIEW user_products AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.category,
  p.price,
  COALESCE(p.ourprice, p.cost, 0::numeric) as ourPrice,
  p.cost,
  p.taxable,
  p.tags,
  p.sku,
  p.created_at,
  p.updated_at,
  p.user_id,
  p.created_by
FROM products p
WHERE p.user_id = auth.uid();

-- 9. Grant access to the view
GRANT SELECT ON user_products TO authenticated;

-- 10. Create a diagnostic function to check user's product setup
CREATE OR REPLACE FUNCTION diagnose_user_products()
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_product_count integer;
  v_categories text[];
  v_has_niche_products boolean;
  v_business_niche text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'error', 'User not authenticated'
    );
  END IF;
  
  -- Get product count
  SELECT COUNT(*) INTO v_product_count
  FROM products
  WHERE user_id = v_user_id;
  
  -- Get unique categories
  SELECT array_agg(DISTINCT category) INTO v_categories
  FROM products
  WHERE user_id = v_user_id;
  
  -- Check if user has niche-specific products
  SELECT EXISTS(
    SELECT 1 
    FROM products 
    WHERE user_id = v_user_id 
    AND category IN ('Service', 'Parts', 'Materials', 'Equipment', 'Installation')
  ) INTO v_has_niche_products;
  
  -- Get user's business niche
  SELECT business_niche INTO v_business_niche
  FROM profiles
  WHERE id = v_user_id;
  
  RETURN json_build_object(
    'user_id', v_user_id,
    'product_count', v_product_count,
    'categories', v_categories,
    'has_niche_products', v_has_niche_products,
    'business_niche', v_business_niche,
    'recommendations', CASE
      WHEN v_product_count = 0 THEN 'No products found. Consider changing your business niche in Configuration settings to auto-load products.'
      WHEN NOT v_has_niche_products THEN 'Products found but they may not be niche-specific. Consider updating your business niche.'
      ELSE 'Product setup looks good!'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION diagnose_user_products() TO authenticated;

-- Test the diagnostic function
SELECT diagnose_user_products();
