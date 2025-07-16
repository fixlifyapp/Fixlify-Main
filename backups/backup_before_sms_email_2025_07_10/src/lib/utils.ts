import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);
}

export function roundToCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

/**
 * Utility function to perform delayed refresh operations
 * Ensures database transactions are committed before refreshing UI
 * @param refreshFn - Function to call for refresh
 * @param delay - Delay in milliseconds (default: 500ms)
 * @param operationType - Type of operation for logging
 */
export function delayedRefresh(
  refreshFn: () => void, 
  delay: number = 500, 
  operationType: string = 'operation'
) {
  console.log(`🔄 Scheduling delayed refresh for ${operationType} in ${delay}ms`);
  setTimeout(() => {
    console.log(`✅ Executing delayed refresh for ${operationType}`);
    refreshFn();
  }, delay);
}

// Store for debounced refresh timers
const refreshTimers = new Map<string, NodeJS.Timeout>();

/**
 * Debounced refresh utility that prevents multiple refresh calls
 * Only the last call within the delay window will execute
 * @param key - Unique key for this refresh operation
 * @param refreshFn - Function to call for refresh
 * @param delay - Delay in milliseconds (default: 500ms)
 */
export function debouncedRefresh(
  key: string,
  refreshFn: () => void,
  delay: number = 500
) {
  // Clear any existing timer for this key
  const existingTimer = refreshTimers.get(key);
  if (existingTimer) {
    console.log(`🚫 Cancelling previous refresh for ${key}`);
    clearTimeout(existingTimer);
  }

  // Set new timer
  console.log(`⏱️ Scheduling debounced refresh for ${key} in ${delay}ms`);
  const timer = setTimeout(() => {
    console.log(`✅ Executing debounced refresh for ${key}`);
    refreshFn();
    refreshTimers.delete(key);
  }, delay);

  refreshTimers.set(key, timer);
}
