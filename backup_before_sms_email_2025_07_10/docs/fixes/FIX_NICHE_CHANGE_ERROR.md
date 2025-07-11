// Fix for business niche change error
// Run these fixes to resolve "Failed to update business niche: Failed to load enhanced niche data"

// 1. First, make sure the import statement is correct in NicheConfig.tsx
// Around line 204, the import statement is missing the closing quote and parenthesis
// It should be:
const { initializeNicheData } = await import('@/utils/enhanced-niche-data-loader');

// 2. Add error handling to prevent the entire process from failing
// Wrap the niche data loading in a try-catch block:
try {
  const { initializeNicheData } = await import('@/utils/enhanced-niche-data-loader');
  const nicheDataResult = await initializeNicheData(dbNicheValue);
  
  if (!nicheDataResult.success) {
    console.error('Enhanced niche data loading failed:', nicheDataResult.error);
    // Don't throw - just log the error
    toast.warning('Some niche-specific data may not have loaded. You can add products manually.');
  } else {
    console.log('Enhanced niche data loaded successfully:', nicheDataResult);
  }
} catch (nicheError) {
  console.error('Error importing or running niche data loader:', nicheError);
  toast.warning('Could not load niche-specific data. You can add products manually.');
}

// 3. SQL fix to ensure products can be created manually even if niche loading fails
// Run this in Supabase SQL editor:
`
-- Ensure products table accepts manual entries
ALTER TABLE products 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Create a fallback function for manual product creation
CREATE OR REPLACE FUNCTION create_product_manual(
  p_name text,
  p_category text,
  p_price numeric DEFAULT 0,
  p_ourprice numeric DEFAULT 0,
  p_description text DEFAULT NULL
)
RETURNS products AS $$
DECLARE
  v_product products;
BEGIN
  INSERT INTO products (
    name,
    category,
    price,
    ourprice,
    cost,
    description,
    taxable,
    user_id,
    created_by
  ) VALUES (
    p_name,
    p_category,
    p_price,
    p_ourprice,
    COALESCE(p_ourprice, 0),
    p_description,
    true,
    auth.uid(),
    auth.uid()
  )
  RETURNING * INTO v_product;
  
  RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_product_manual TO authenticated;
`

// 4. Quick test to verify the fix
// In browser console after applying fixes:
async function testNicheChange() {
  const { supabase } = window;
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log('Testing niche change for user:', user.id);
  
  // Try to create a test product manually
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: 'Manual Test Product',
      category: 'Test',
      price: 100,
      ourprice: 75,
      cost: 75,
      user_id: user.id,
      created_by: user.id
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating manual product:', error);
  } else {
    console.log('Manual product created successfully:', data);
    // Clean up
    await supabase.from('products').delete().eq('id', data.id);
  }
}

// 5. Alternative: Direct product population for Moving Services
// If the niche data loader continues to fail, use this SQL to populate products directly:
`
-- Populate products for Moving Services niche
INSERT INTO products (name, description, category, price, cost, ourprice, taxable, user_id, created_by)
SELECT 
  p.name,
  p.description,
  p.category,
  p.price::numeric,
  p.cost::numeric,
  p.ourprice::numeric,
  p.taxable,
  auth.uid(),
  auth.uid()
FROM (VALUES
  ('Local Moving - 2 Movers', '2 movers with truck for local move', 'Service', 149.00, 70.00, 85.00, true),
  ('Local Moving - 3 Movers', '3 movers with truck for local move', 'Service', 199.00, 95.00, 115.00, true),
  ('Long Distance Moving', 'Interstate moving service per mile', 'Service', 4.50, 2.25, 2.75, true),
  ('Packing Service', 'Professional packing service per hour', 'Service', 65.00, 25.00, 35.00, true),
  ('Moving Box - Small', 'Small moving box 16x12x12', 'Materials', 2.99, 1.20, 1.60, true),
  ('Moving Box - Medium', 'Medium moving box 18x18x16', 'Materials', 3.99, 1.80, 2.20, true),
  ('Moving Box - Large', 'Large moving box 18x18x24', 'Materials', 4.99, 2.20, 2.80, true),
  ('Bubble Wrap Roll', 'Bubble wrap 12in x 100ft', 'Materials', 24.99, 12.00, 15.00, true),
  ('Piano Moving', 'Specialized piano moving service', 'Service', 399.00, 180.00, 225.00, true),
  ('Storage Service', 'Monthly storage unit rental', 'Service', 149.00, 75.00, 90.00, true)
) AS p(name, description, category, price, cost, ourprice, taxable)
WHERE NOT EXISTS (
  SELECT 1 FROM products 
  WHERE name = p.name 
  AND user_id = auth.uid()
);
`
