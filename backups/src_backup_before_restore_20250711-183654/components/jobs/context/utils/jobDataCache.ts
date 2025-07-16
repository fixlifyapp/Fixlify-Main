
// Request deduplication cache for job data with longer TTL
const jobRequestCache = new Map<string, Promise<any>>();

export const getCachedJobData = (cacheKey: string) => {
  return jobRequestCache.get(cacheKey);
};

export const setCachedJobData = (cacheKey: string, promise: Promise<any>) => {
  jobRequestCache.set(cacheKey, promise);
  
  // Clean up cache after 5 minutes
  setTimeout(() => {
    jobRequestCache.delete(cacheKey);
  }, 300000);
};

export const hasCachedJobData = (cacheKey: string) => {
  return jobRequestCache.has(cacheKey);
};
