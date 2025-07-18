/**
 * Utility to prevent rapid-fire refreshes that can cause resource exhaustion
 */
export class RefreshThrottler {
  private static lastRefreshTime = 0;
  private static pendingRefresh: NodeJS.Timeout | null = null;
  private static readonly COOLDOWN_MS = 2000; // 2 seconds between refreshes
  
  static canRefresh(): boolean {
    const now = Date.now();
    return now - this.lastRefreshTime >= this.COOLDOWN_MS;
  }
  
  static throttledRefresh(refreshFn: () => void) {
    if (this.pendingRefresh) {
      clearTimeout(this.pendingRefresh);
    }
    
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    
    if (timeSinceLastRefresh >= this.COOLDOWN_MS) {
      // Can refresh immediately
      this.lastRefreshTime = now;
      refreshFn();
    } else {
      // Schedule refresh after cooldown
      const delay = this.COOLDOWN_MS - timeSinceLastRefresh;
      console.log(`Throttling refresh, will execute in ${delay}ms`);
      
      this.pendingRefresh = setTimeout(() => {
        this.lastRefreshTime = Date.now();
        refreshFn();
        this.pendingRefresh = null;
      }, delay);
    }
  }
  
  static reset() {
    if (this.pendingRefresh) {
      clearTimeout(this.pendingRefresh);
      this.pendingRefresh = null;
    }
    this.lastRefreshTime = 0;
  }
}
