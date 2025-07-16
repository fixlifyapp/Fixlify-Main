// Emergency fix for jobs loading timeout issue
// Run this in browser console when jobs are stuck loading

(async () => {
  console.group('🔧 Jobs Loading Emergency Fix');
  
  try {
    // 1. Clear all caches
    console.log('1️⃣ Clearing caches...');
    localStorage.removeItem('jobs_cache');
    
    // Clear all items starting with 'jobs_'
    Object.keys(localStorage)
      .filter(key => key.startsWith('jobs_'))
      .forEach(key => {
        localStorage.removeItem(key);
        console.log(`  - Removed: ${key}`);
      });
    
    // 2. Reset circuit breaker
    console.log('\n2️⃣ Resetting circuit breaker...');
    const { jobsCircuitBreaker } = await import('@/utils/errorHandling');
    if (jobsCircuitBreaker) {
      jobsCircuitBreaker.reset();
      console.log('  ✅ Circuit breaker reset');
    }
    
    // 3. Clear Supabase auth session cache
    console.log('\n3️⃣ Refreshing auth session...');
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('  ❌ Auth error:', error);
    } else {
      console.log('  ✅ Auth session active:', session?.user?.email);
    }
    
    // 4. Test a simple query
    console.log('\n4️⃣ Testing simple jobs query...');
    const { data: testJobs, error: testError } = await supabase
      .from('jobs')
      .select('id, title, status')
      .limit(1);
    
    if (testError) {
      console.error('  ❌ Query test failed:', testError);
    } else {
      console.log('  ✅ Query test successful, found', testJobs?.length || 0, 'jobs');
    }
    
    console.log('\n✅ Fix complete! Please refresh the page.');
    console.log('   Press Ctrl+R or Cmd+R to reload');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    console.groupEnd();
  }
})();
