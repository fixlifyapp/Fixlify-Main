// Debug script for products loading issue
// Run this in the browser console when on the products page

async function debugProducts() {
  console.log('=== Products Debug Started ===');
  
  // Check if supabase is available
  if (!window.supabase) {
    console.error('❌ Supabase not found. Make sure you are on the app.');
    return;
  }
  
  const { supabase } = window;
  
  // 1. Check authentication
  console.log('\n1️⃣ Checking Authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }
  
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  console.log('✅ Logged in as:', user.email);
  console.log('   User ID:', user.id);
  
  // 2. Check user profile and business niche
  console.log('\n2️⃣ Checking Profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_niche, name')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error('❌ Profile error:', profileError);
  } else {
    console.log('✅ Business Niche:', profile.business_niche || 'Not set');
    console.log('   Profile Name:', profile.name || 'Not set');
  }
  
  // 3. Check products directly
  console.log('\n3️⃣ Checking Products...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .limit(10);
    
  if (productsError) {
    console.error('❌ Products error:', productsError);
  } else {
    console.log(`✅ Found ${products.length} products`);
    if (products.length > 0) {
      console.table(products.map(p => ({
        name: p.name,
        category: p.category,
        price: p.price,
        created: new Date(p.created_at).toLocaleDateString()
      })));
    }
  }
  
  // 4. Test RLS policies
  console.log('\n4️⃣ Testing RLS Policies...');
  const { data: rlsTest } = await supabase.rpc('test_products_visibility');
  console.log('RLS Test Result:', rlsTest);
  
  // 5. Check all products (without user filter) to see if RLS is working
  console.log('\n5️⃣ Testing Products Query (as useProducts hook does)...');
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('*')
    .order('name');
    
  if (allError) {
    console.error('❌ All products error:', allError);
  } else {
    console.log(`✅ RLS returned ${allProducts.length} products`);
  }
  
  // 6. Run diagnostic function
  console.log('\n6️⃣ Running Full Diagnostic...');
  const { data: diagnostic } = await supabase.rpc('check_user_products_status');
  console.log('Diagnostic Result:', diagnostic);
  
  // 7. Check if useAuth hook is working
  console.log('\n7️⃣ Checking React Hooks...');
  console.log('Look for useAuth in React DevTools');
  console.log('The user object should be:', user);
  
  console.log('\n=== Debug Complete ===');
  console.log('\n📋 Summary:');
  console.log(`- User: ${user.email} (${user.id})`);
  console.log(`- Business Niche: ${profile?.business_niche || 'Not set'}`);
  console.log(`- Products for user: ${products?.length || 0}`);
  console.log(`- Products via RLS: ${allProducts?.length || 0}`);
  
  if (products?.length > 0 && allProducts?.length === 0) {
    console.error('\n❌ RLS ISSUE: User has products but RLS is blocking them!');
    console.log('Check RLS policies on the products table.');
  } else if (products?.length === 0) {
    console.warn('\n⚠️ NO PRODUCTS: User has no products. Change business niche to load products.');
  } else if (allProducts?.length > 0) {
    console.log('\n✅ Products exist and RLS is working. Check frontend rendering.');
  }
}

// Auto-run
debugProducts();

// Also make it available globally
window.debugProducts = debugProducts;
