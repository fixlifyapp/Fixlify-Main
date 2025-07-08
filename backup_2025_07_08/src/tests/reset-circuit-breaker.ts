import { jobsCircuitBreaker } from '@/utils/errorHandling';

/**
 * Reset the circuit breaker when it gets stuck in OPEN state
 */
export const resetCircuitBreaker = () => {
  console.log('🔧 Resetting circuit breaker...');
  jobsCircuitBreaker.reset();
  console.log('✅ Circuit breaker reset successfully');
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).resetCircuitBreaker = resetCircuitBreaker;
}
