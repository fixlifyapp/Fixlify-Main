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
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);
  const refreshThrottlerRef = useRef(new RefreshThrottler());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fallback: fetch stats using regular queries when RPC fails
  const fetchStatsWithQueries = useCallback(async (): Promise<ClientStats> => {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, revenue, date, created_at, status')
      .eq('client_id', clientId);

    if (error) throw error;

    const currentYear = new Date().getFullYear();
    const totalJobs = jobs?.length || 0;

    const totalRevenue = jobs?.reduce((sum, job) => {
      return sum + (Number(job.revenue) || 0);
    }, 0) || 0;

    const jobsThisYear = jobs?.filter(job => {
      const jobYear = new Date(job.date || job.created_at).getFullYear();
      return jobYear === currentYear;
    }).length || 0;

    const revenueThisYear = jobs?.filter(job => {
      const jobYear = new Date(job.date || job.created_at).getFullYear();
      return jobYear === currentYear;
    }).reduce((sum, job) => sum + (Number(job.revenue) || 0), 0) || 0;

    const completedJobs = jobs?.filter(job => job.status === 'completed') || [];
    const lastServiceDate = completedJobs.length > 0
      ? completedJobs.sort((a, b) =>
          new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
        )[0]?.date
      : undefined;

    const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

    return {
      totalJobs,
      totalRevenue,
      lastServiceDate,
      averageJobValue,
      jobsThisYear,
      revenueThisYear
    };
  }, [clientId]);

  const fetchClientStats = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    const cacheKey = `client_stats_individual_${clientId}`;

    // Check if we already have a pending request
    if (statsRequestCache.has(cacheKey)) {
      try {
        const result = await statsRequestCache.get(cacheKey)!;
        if (isMountedRef.current) {
          setStats(result);
          setIsLoading(false);
          setHasError(false);
        }
        return;
      } catch {
        // Continue with fresh request if cached request failed
      }
    }

    // Create new request promise
    const requestPromise = (async () => {
      setHasError(false);

      // Try cache first
      const cached = localStorageCache.get<ClientStats>(cacheKey);
      if (cached && isMountedRef.current) {
        setStats(cached);
        setIsLoading(false);
      }

      // Try RPC first, fallback to regular queries
      try {
        const result = await withRetry(async () => {
          const { data, error } = await supabase
            .rpc('get_batch_client_stats', { p_client_ids: [clientId] });

          if (error) throw error;

          if (data && data.length > 0) {
            const statsData = data[0];
            return {
              totalJobs: Number(statsData.total_jobs) || 0,
              totalRevenue: Number(statsData.total_revenue) || 0,
              lastServiceDate: statsData.last_service_date,
              averageJobValue: Number(statsData.average_job_value) || 0,
              jobsThisYear: Number(statsData.jobs_this_year) || 0,
              revenueThisYear: Number(statsData.revenue_this_year) || 0
            };
          }

          return {
            totalJobs: 0,
            totalRevenue: 0,
            averageJobValue: 0,
            jobsThisYear: 0,
            revenueThisYear: 0
          };
        }, { maxRetries: 1, baseDelay: 500 });

        localStorageCache.set(cacheKey, result, 5);
        return result;
      } catch (rpcError) {
        console.log('[useClientStatsOptimized] RPC failed, using fallback queries');
        // Fallback to regular queries
        const fallbackResult = await fetchStatsWithQueries();
        localStorageCache.set(cacheKey, fallbackResult, 5);
        return fallbackResult;
      }
    })();

    statsRequestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (isMountedRef.current) {
        setStats(result);
        setHasError(false);
      }
    } catch (error) {
      console.error('Error fetching client stats:', error);
      if (isMountedRef.current) {
        setHasError(true);
      }
    } finally {
      statsRequestCache.delete(cacheKey);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clientId, fetchStatsWithQueries]);
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
      setHasError(false);
      fetchClientStats();
    }
  }, [clientId, fetchClientStats]);

  const clearError = useCallback(() => {
    setHasError(false);
    refreshStats();
  }, [refreshStats]);

  return { stats, isLoading, hasError, refreshStats, clearError };
};