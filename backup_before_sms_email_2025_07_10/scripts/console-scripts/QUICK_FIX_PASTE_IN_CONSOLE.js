// IMMEDIATE FIX - Copy and paste this entire script into browser console

// Reset circuit breaker if available
if (window.resetJobsCircuitBreaker) {
  window.resetJobsCircuitBreaker();
  console.log('✅ Circuit breaker reset');
}

// Clear all job-related caches
Object.keys(localStorage)
  .filter(key => key.includes('jobs'))
  .forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Cleared:', key);
  });

console.log('\n✅ Cache cleared! Now refreshing the page...');
setTimeout(() => location.reload(), 1000);
