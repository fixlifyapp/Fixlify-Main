import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { localStorageCache } from "@/utils/cacheConfig";
import { withRetry } from "@/utils/errorHandling";
import { RefreshThrottler } from "@/utils/refreshThrottler";

interface ClientStats {
  totalJobs: number;
  totalRevenue: number;
  lastServiceDate?: string;
  averageJobValue: number;
  jobsThisYear: number;
  revenueThisYear: number;
}

// Request deduplication cache
const statsRequestCache = new Map<string, Promise<ClientStats>>();

export const useClientStatsOptimized = (clientId?: string) => {
  const [stats, setStats] = useState<ClientStats>({
    totalJobs: 0,
    totalRevenue: 0,
    averageJobValue: 0,
    jobsThisYear: 0,
    revenueThisYear: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const refreshThrottlerRef = useRef(new RefreshThrottler());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchClientStats = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    const cacheKey = `client_stats_individual_${clientId}`;
    
    // Check if we already have a pending request
    if (statsRequestCache.has(cacheKey)) {
      const result = await statsRequestCache.get(cacheKey)!;
      if (isMountedRef.current) {
        setStats(result);
        setIsLoading(false);
      }
      return;
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        // Try cache first
        const cached = localStorageCache.get<ClientStats>(cacheKey);
        if (cached && isMountedRef.current) {
          setStats(cached);
          setIsLoading(false);
        }

        // Fetch from database using optimized function
        return await withRetry(async () => {
          const { data, error } = await supabase
            .rpc('get_batch_client_stats', { p_client_ids: [clientId] });

          if (error) throw error;

          if (data && data.length > 0) {
            const statsData = data[0];
            const formattedStats: ClientStats = {
              totalJobs: Number(statsData.total_jobs) || 0,
              totalRevenue: Number(statsData.total_revenue) || 0,
              lastServiceDate: statsData.last_service_date,
              averageJobValue: Number(statsData.average_job_value) || 0,
              jobsThisYear: Number(statsData.jobs_this_year) || 0,
              revenueThisYear: Number(statsData.revenue_this_year) || 0
            };

            // Cache the result
            localStorageCache.set(cacheKey, formattedStats, 5); // 5 minute cache
            
            return formattedStats;
          }

          return {
            totalJobs: 0,
            totalRevenue: 0,
            averageJobValue: 0,
            jobsThisYear: 0,
            revenueThisYear: 0
          };
        }, {
          maxRetries: 2,
          baseDelay: 1000
        });
      } catch (error) {
        console.error('Error fetching client stats:', error);
        throw error;
      }
    })();

    statsRequestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (isMountedRef.current) {
        setStats(result);
      }
    } catch (error) {
      // Error already handled
    } finally {
      statsRequestCache.delete(cacheKey);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clientId]);
  useEffect(() => {
    fetchClientStats();
  }, [fetchClientStats]);

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!clientId) return;

    // Set up subscription with throttled refresh
    const channel = supabase
      .channel(`client-stats-optimized-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `client_id=eq.${clientId}`
        },
        () => {
          refreshThrottlerRef.current.scheduleRefresh(() => {
            if (isMountedRef.current) {
              console.log('Real-time job update detected for client stats');
              // Clear cache and refetch
              localStorageCache.remove(`client_stats_individual_${clientId}`);
              fetchClientStats();
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          refreshThrottlerRef.current.scheduleRefresh(() => {
            if (isMountedRef.current) {
              console.log('Real-time invoice update detected for client stats');
              localStorageCache.remove(`client_stats_individual_${clientId}`);
              fetchClientStats();
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          refreshThrottlerRef.current.scheduleRefresh(() => {
            if (isMountedRef.current) {
              console.log('Real-time payment update detected for client stats');
              localStorageCache.remove(`client_stats_individual_${clientId}`);
              fetchClientStats();
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, fetchClientStats]);

  const refreshStats = useCallback(() => {
    if (clientId) {
      localStorageCache.remove(`client_stats_individual_${clientId}`);
      setIsLoading(true);
      fetchClientStats();
    }
  }, [clientId, fetchClientStats]);

  return { stats, isLoading, refreshStats };
};