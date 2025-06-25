// Test script to check products functionality
// Run this in the browser console after logging in

async function testProductsSystem() {
  console.log('Testing Products System...');
  
  // Import supabase
  const { supabase } = window;
  
  if (!supabase) {
    console.error('Supabase not found. Make sure you are on the app and logged in.');
    return;
  }
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('User not authenticated:', userError);
    return;
  }
  
  console.log('Current user:', user.id);
  
  // Test 1: Fetch existing products
  console.log('\n1. Fetching existing products...');
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .limit(5);
    
  if (fetchError) {
    console.error('Error fetching products:', fetchError);
  } else {
    console.log(`Found ${products.length} products:`, products);
  }
  
  // Test 2: Try to create a product
  console.log('\n2. Creating a test product...');
  const testProduct = {
    name: 'Test Product ' + Date.now(),
    description: 'This is a test product',
    category: 'Test Category',
    price: 99.99,
    cost: 50.00,
    ourprice: 75.00,
    taxable: true,
    tags: ['test', 'sample'],
    user_id: user.id,
    created_by: user.id
  };
  
  const { data: newProduct, error: createError } = await supabase
    .from('products')
    .insert(testProduct)
    .select()
    .single();
    
  if (createError) {
    console.error('Error creating product:', createError);
    console.error('Error details:', {
      code: createError.code,
      message: createError.message,
      details: createError.details,
      hint: createError.hint
    });
  } else {
    console.log('Product created successfully:', newProduct);
    
    // Test 3: Try to update the product
    console.log('\n3. Updating the test product...');
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ price: 149.99 })
      .eq('id', newProduct.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating product:', updateError);
    } else {
      console.log('Product updated successfully:', updatedProduct);
    }
    
    // Test 4: Delete the test product
    console.log('\n4. Deleting the test product...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', newProduct.id);
      
    if (deleteError) {
      console.error('Error deleting product:', deleteError);
    } else {
      console.log('Product deleted successfully');
    }
  }
  
  // Test 5: Check RLS policies
  console.log('\n5. Testing RLS policies...');
  const { data: policies, error: policyError } = await supabase
    .rpc('get_table_policies', { table_name: 'products' });
    
  if (policyError) {
    console.log('Could not fetch policies (this is normal)');
  } else {
    console.log('RLS policies:', policies);
  }
  
  console.log('\nProducts system test complete!');
}

// Instructions
console.log(`
To test the products system, run:
testProductsSystem()

Make sure you are logged into the app first!
`);

// Make function available globally
window.testProductsSystem = testProductsSystem;
