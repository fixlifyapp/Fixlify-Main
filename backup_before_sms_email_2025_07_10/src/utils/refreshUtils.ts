/**
 * Utility for managing delayed refreshes to ensure database transactions are committed
 */

interface RefreshConfig {
  payments?: () => void;
  invoices?: () => void;
  financials?: () => void;
  estimates?: () => void;
}

interface RefreshDelays {
  payments?: number;
  invoices?: number;
  financials?: number;
  estimates?: number;
}

const DEFAULT_DELAYS: RefreshDelays = {
  payments: 200,
  invoices: 300,
  financials: 500,
  estimates: 300
};

/**
 * Executes multiple refresh functions with appropriate delays
 * to ensure database changes are committed before UI updates
 */
export function executeDelayedRefresh(
  refreshFunctions: RefreshConfig,
  customDelays?: RefreshDelays
) {
  const delays = { ...DEFAULT_DELAYS, ...customDelays };
  
  if (refreshFunctions.payments) {
    setTimeout(() => {
      console.log('🔄 Refreshing payments...');
      refreshFunctions.payments!();
    }, delays.payments);
  }
  
  if (refreshFunctions.invoices) {
    setTimeout(() => {
      console.log('🔄 Refreshing invoices...');
      refreshFunctions.invoices!();
    }, delays.invoices);
  }
  
  if (refreshFunctions.estimates) {
    setTimeout(() => {
      console.log('🔄 Refreshing estimates...');
      refreshFunctions.estimates!();
    }, delays.estimates);
  }
  
  if (refreshFunctions.financials) {
    setTimeout(() => {
      console.log('💰 Refreshing financials...');
      refreshFunctions.financials!();
    }, delays.financials);
  }
}

/**
 * Creates a debounced refresh function that prevents multiple
 * simultaneous refresh calls within a specified time window
 */
export function createDebouncedRefresh(
  refreshFn: () => void,
  delay: number = 500
): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      refreshFn();
      timeoutId = null;
    }, delay);
  };
} 