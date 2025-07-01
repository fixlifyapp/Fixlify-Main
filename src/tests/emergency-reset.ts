/**
 * Emergency fix to stop the error cascade
 */

// Disable all real-time updates
export const disableAllRealtime = () => {
  console.log('🚨 Disabling all real-time updates...');
  
  // Remove all Supabase channels
  const { supabase } = require('@/integrations/supabase/client');
  const channels = supabase.getChannels();
  channels.forEach(channel => {
    console.log(`Removing channel: ${channel.topic}`);
    supabase.removeChannel(channel);
  });
  
  console.log('✅ All real-time updates disabled');
};

// Stop all pending requests
export const stopAllRequests = () => {
  console.log('🛑 Stopping all pending requests...');
  
  // Clear all timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  
  // Clear all intervals
  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
  
  console.log('✅ All pending requests stopped');
};

// Emergency reset function
export const emergencyReset = async () => {
  console.log('🚨 EMERGENCY RESET INITIATED 🚨');
  
  // 1. Stop all requests
  stopAllRequests();
  
  // 2. Disable realtime
  disableAllRealtime();
  
  // 3. Reset circuit breaker
  const { jobsCircuitBreaker } = await import('@/utils/errorHandling');
  jobsCircuitBreaker.reset();
  
  // 4. Clear all caches
  localStorage.clear();
  sessionStorage.clear();
  
  // 5. Reset refresh throttler
  const { RefreshThrottler } = await import('@/utils/refreshThrottler');
  RefreshThrottler.reset();
  
  console.log('✅ Emergency reset complete');
  console.log('🔄 Please refresh the page now');
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).emergencyReset = emergencyReset;
  (window as any).disableAllRealtime = disableAllRealtime;
  (window as any).stopAllRequests = stopAllRequests;
}
