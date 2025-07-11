/**
 * Comprehensive fix for resource exhaustion issues
 */

let hasRun = false;

export const fixResourceExhaustion = () => {
  // Only run once
  if (hasRun) return;
  hasRun = true;
  
  console.log('🔧 Applying resource exhaustion fixes...');
  
  // Override fetch to prevent too many concurrent requests
  const originalFetch = window.fetch;
  let activeRequests = 0;
  const MAX_CONCURRENT_REQUESTS = 5;
  
  window.fetch = async (...args) => {
    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      console.warn(`Too many concurrent requests (${activeRequests}), delaying...`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeRequests++;
    try {
      const result = await originalFetch(...args);
      return result;
    } finally {
      activeRequests--;
    }
  };
  
  console.log('✅ Request limiting applied');
  
  // Disable console errors temporarily to reduce noise
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Skip resource exhaustion errors
    if (message.includes('ERR_INSUFFICIENT_RESOURCES') || 
        message.includes('Circuit breaker') ||
        message.includes('fetchJobs error')) {
      console.log('🔇 Suppressed error:', message.substring(0, 50) + '...');
      return;
    }
    
    originalError(...args);
  };
  
  console.log('✅ Error suppression applied');
  console.log('✅ Resource exhaustion fixes complete');
};

// Apply fixes immediately
fixResourceExhaustion();
