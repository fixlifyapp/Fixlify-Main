/**
 * One-time cleanup to fix the error cascade issue
 */

import { supabase } from '@/integrations/supabase/client';
import { jobsCircuitBreaker } from '@/utils/errorHandling';
import { RefreshThrottler } from '@/utils/refreshThrottler';

export const runEmergencyCleanup = () => {
  console.log('🚨 Running emergency cleanup...');
  
  try {
    // 1. Remove all Supabase channels
    const channels = supabase.getChannels();
    channels.forEach(channel => {
      console.log(`Removing channel: ${channel.topic}`);
      supabase.removeChannel(channel);
    });
    console.log('✅ Removed all real-time channels');
    
    // 2. Reset circuit breaker
    jobsCircuitBreaker.reset();
    console.log('✅ Reset circuit breaker');
    
    // 3. Reset refresh throttler
    RefreshThrottler.reset();
    console.log('✅ Reset refresh throttler');
    
    // 4. Clear all timeouts and intervals
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    
    const highestIntervalId = setInterval(() => {}, 0);
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
    console.log('✅ Cleared all timers');
    
    // 5. Clear problematic cache entries
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('jobs') || key.includes('cache'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('✅ Cleared problematic cache entries');
    
    console.log('✅ Emergency cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Run cleanup immediately when this module loads
runEmergencyCleanup();

// Also run after a short delay to catch any delayed initializations
setTimeout(runEmergencyCleanup, 1000);
