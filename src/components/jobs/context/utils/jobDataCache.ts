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

// Invalidate cache for a specific job (used after status updates)
export const invalidateJobCache = (jobId: string) => {
  // Find and delete all cache entries for this job
  const keysToDelete: string[] = [];
  jobRequestCache.forEach((_, key) => {
    if (key.includes(jobId)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    jobRequestCache.delete(key);
  });
};

// Clear entire cache (useful for debugging or force refresh)
export const clearJobCache = () => {
  jobRequestCache.clear();
};
