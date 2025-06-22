
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Job } from "@/hooks/useJobs";
import { withRetry, handleJobsError } from "@/utils/errorHandling";

interface UseJobsOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  clientId?: string;
  filters?: {
    search?: string;
    status?: string;
    type?: string;
    technician?: string;
    dateRange?: { start: Date | null; end: Date | null };
    tags?: string[];
  };
}

const jobsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const useJobsConsolidated = (options: UseJobsOptions = {}) => {
  const { 
    page = 1, 
    pageSize = 50, 
    enableRealtime = true, 
    clientId,
    filters = {}
  } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cacheKey = useMemo(() => {
    const filterKey = JSON.stringify(filters);
    return `jobs_${clientId || 'all'}_${page}_${pageSize}_${user?.id}_${filterKey}`;
  }, [clientId, page, pageSize, user?.id, filters]);

  const fetchJobs = useCallback(async (useCache = true) => {
    if (!user?.id) {
      console.log('❌ No user ID in useJobsConsolidated:', { userId: user?.id });
      setIsLoading(false);
      setHasError(true);
      handleJobsError(new Error('User not authenticated'), 'useJobsConsolidated - authentication check');
      return;
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    if (useCache) {
      const cached = jobsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        if (isMountedRef.current) {
          setJobs(cached.data.jobs);
          setTotalCount(cached.data.totalCount);
          setIsLoading(false);
        }
        return;
      }
    }

    setIsLoading(true);
    setHasError(false);
    
    try {
      await withRetry(async () => {
        let query = supabase
          .from('jobs')
          .select(`
            id,
            title,
            client_id,
            status,
            job_type,
            service,
            date,
            schedule_start,
            revenue,
            address,
            tags,
            created_at,
            client:clients!inner(id, name, email, phone)
          `, { count: 'exact' });
        
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        
        if (filters.status && filters.status !== "all") {
          query = query.eq('status', filters.status);
        }
        
        if (filters.type && filters.type !== "all") {
          query = query.eq('job_type', filters.type);
        }
        
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,clients.name.ilike.%${filters.search}%`);
        }
        
        const jobViewScope = getJobViewScope();
        if (jobViewScope === "assigned" && user?.id) {
          query = query.eq('technician_id', user.id);
        } else if (jobViewScope === "none") {
          if (isMountedRef.current) {
            setJobs([]);
            setTotalCount(0);
            setIsLoading(false);
          }
          return;
        }
        
        query = query
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        const processedJobs = (data || []).map(job => ({
          ...job,
          tags: Array.isArray(job.tags) ? job.tags : [],
          title: job.title || `${job.client?.name || 'Service'} - ${job.job_type || job.service || 'General Service'}`
        }));
        
        const result = {
          jobs: processedJobs,
          totalCount: count || 0
        };
        
        jobsCache.set(cacheKey, { 
          data: result, 
          timestamp: Date.now(), 
          ttl: 20 * 60 * 1000 
        });
        
        if (isMountedRef.current) {
          setJobs(result.jobs);
          setTotalCount(result.totalCount);
        }
      }, {
        maxRetries: 2,
        baseDelay: 2000
      });
    } catch (error) {
      setHasError(true);
      handleJobsError(error, 'useJobsConsolidated - fetchJobs');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, clientId, getJobViewScope, user?.id, page, pageSize, filters, hasError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real-time updates with error handling
  useEffect(() => {
    if (!enableRealtime || hasError) return;

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true;
    
    const channel = supabase
      .channel(`jobs-realtime-${cacheKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          if (!isSubscribed || hasError) return;
          
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (isSubscribed && isMountedRef.current && !hasError) {
              jobsCache.delete(cacheKey);
              fetchJobs(false);
            }
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, enableRealtime, cacheKey, hasError]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const refreshJobs = useCallback(() => {
    setHasError(false);
    jobsCache.delete(cacheKey);
    fetchJobs(false);
  }, [fetchJobs, cacheKey]);

  const clearError = useCallback(() => {
    setHasError(false);
    refreshJobs();
  }, [refreshJobs]);

  return {
    jobs,
    isLoading,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage,
    hasPreviousPage,
    hasError,
    refreshJobs,
    clearError,
    canCreate: canCreateJobs(),
    canEdit: canEditJobs(),
    canDelete: canDeleteJobs(),
    viewScope: getJobViewScope()
  };
};

// Cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of jobsCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        jobsCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
