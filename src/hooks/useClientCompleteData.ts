import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { localStorageCache } from "@/utils/cacheConfig";
import { withClientRetry, handleClientsError } from "@/utils/errorHandling";

// Types
export interface ClientCompleteData {
  client: {
    id: string;
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    status?: string;
    client_type?: string;
    created_at?: string;
    user_id?: string;
  } | null;
  stats: {
    total_jobs: number;
    total_revenue: number;
    avg_job_value: number;
    jobs_this_year: number;
    revenue_this_year: number;
    last_service_date: string | null;
  };
  recent_jobs: Array<{
    id: string;
    title: string;
    status: string;
    job_type?: string;
    date?: string;
    schedule_start?: string;
    revenue?: number;
    address?: string;
    tags?: string[];
    created_at: string;
  }>;
  recent_payments: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method?: string;
    status?: string;
    invoice_number?: string;
    invoice_total?: number;
    job_title?: string;
  }>;
  properties: Array<{
    id: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    property_type?: string;
    is_primary?: boolean;
    notes?: string;
  }>;
  total_jobs_count: number;
  total_payments_count: number;
  total_revenue: number;
}

interface UseClientCompleteDataOptions {
  clientId: string;
  enableRealtime?: boolean;
}

// Request deduplication cache
const requestCache = new Map<string, Promise<ClientCompleteData>>();

export const useClientCompleteData = (options: UseClientCompleteDataOptions) => {
  const { clientId, enableRealtime = true } = options;

  const [data, setData] = useState<ClientCompleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();

  const isMountedRef = useRef(true);
  const refreshDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }
    };
  }, []);

  const cacheKey = useMemo(() =>
    `client_complete_${clientId}_${user?.id}`,
    [clientId, user?.id]
  );

  // Fallback fetch using regular queries when RPC fails
  const fetchWithQueries = useCallback(async (): Promise<ClientCompleteData> => {
    // Fetch client - use select('*') for maximum compatibility
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) {
      console.error('[useClientCompleteData] Client fetch error:', clientError);
      throw clientError;
    }

    // Fetch jobs - use select('*') to avoid column issues
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (jobsError) {
      console.error('[useClientCompleteData] Jobs fetch error:', jobsError);
      throw jobsError;
    }

    // Fetch all jobs count
    const { count: jobsCount, error: countError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId);

    if (countError) {
      console.error('[useClientCompleteData] Jobs count error:', countError);
    }

    // Fetch properties - use select('*') to avoid column issues
    const { data: properties, error: propsError } = await supabase
      .from('client_properties')
      .select('*')
      .eq('client_id', clientId);

    if (propsError) {
      console.error('[useClientCompleteData] Properties fetch error:', propsError);
      // Don't throw - properties might not exist, just continue with empty array
    }

    // Calculate basic stats
    const totalJobs = jobsCount || jobs?.length || 0;
    const lastJob = jobs?.[0];

    return {
      client: clientData,
      stats: {
        total_jobs: totalJobs,
        total_revenue: 0,
        avg_job_value: 0,
        jobs_this_year: 0,
        revenue_this_year: 0,
        last_service_date: lastJob?.date || null
      },
      recent_jobs: (jobs || []).map(j => ({
        id: j.id,
        title: j.title || 'Untitled Job',
        status: j.status || 'pending',
        job_type: j.job_type,
        date: j.date,
        schedule_start: j.schedule_start,
        revenue: j.revenue,
        address: j.address,
        tags: j.tags,
        created_at: j.created_at
      })),
      recent_payments: [],
      properties: (properties || []).map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        state: p.state,
        zip: p.zip,
        property_type: p.property_type,
        is_primary: p.is_primary,
        notes: p.notes
      })),
      total_jobs_count: totalJobs,
      total_payments_count: 0,
      total_revenue: 0
    };
  }, [clientId]);

  const fetchData = useCallback(async (useCache = true) => {
    if (!clientId || !user?.id) {
      setIsLoading(false);
      return;
    }

    // Check in-flight request
    if (requestCache.has(cacheKey)) {
      try {
        const cachedRequest = await requestCache.get(cacheKey);
        if (isMountedRef.current && cachedRequest) {
          setData(cachedRequest);
          setIsLoading(false);
        }
        return;
      } catch (error) {
        // Continue with fresh request if cached request failed
      }
    }

    // Check localStorage cache
    if (useCache) {
      const cached = localStorageCache.get<ClientCompleteData>(cacheKey);
      if (cached && isMountedRef.current) {
        setData(cached);
        setIsLoading(false);
        // Continue to fetch fresh data in background
      }
    }

    const requestPromise = (async (): Promise<ClientCompleteData> => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Try RPC first, fallback to regular queries
        try {
          const { data: result, error } = await supabase
            .rpc('get_client_complete_data', { p_client_id: clientId });

          if (error) {
            console.log('[useClientCompleteData] RPC failed, using fallback queries');
            throw error;
          }

          const clientData = result as ClientCompleteData;

          // Cache the result
          if (useCache) {
            localStorageCache.set(cacheKey, clientData, 5); // 5 min cache
          }

          return clientData;
        } catch (rpcError) {
          // Fallback to regular queries
          console.log('[useClientCompleteData] Using fallback query method');
          const fallbackData = await fetchWithQueries();

          // Cache the result
          if (useCache) {
            localStorageCache.set(cacheKey, fallbackData, 5);
          }

          return fallbackData;
        }
      } catch (error) {
        setHasError(true);
        handleClientsError(error, 'useClientCompleteData - fetchData');
        throw error;
      }
    })();

    requestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (isMountedRef.current && result) {
        setData(result);
      }
    } catch (error) {
      // Error already handled
    } finally {
      // Keep in cache for 10 minutes to deduplicate
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, 600000);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, clientId, user?.id, fetchWithQueries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle real-time updates with debouncing
  const handleRealtimeUpdate = useCallback(() => {
    if (!isMountedRef.current) return;

    // Debounce the refresh
    if (refreshDebounceRef.current) {
      clearTimeout(refreshDebounceRef.current);
    }

    refreshDebounceRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('[useClientCompleteData] Refreshing after real-time update');
        localStorageCache.remove(cacheKey);
        requestCache.delete(cacheKey);
        fetchData(false);
      }
    }, 500);
  }, [cacheKey, fetchData]);

  // Single unified realtime subscription for all client-related tables
  useUnifiedRealtime({
    tables: ['jobs', 'invoices', 'payments', 'client_properties', 'clients'],
    onUpdate: handleRealtimeUpdate,
    enabled: enableRealtime && !hasError && !!user?.id && !!clientId
  });

  const refresh = useCallback(() => {
    setHasError(false);
    localStorageCache.remove(cacheKey);
    requestCache.delete(cacheKey);
    fetchData(false);
  }, [cacheKey, fetchData]);

  const clearError = useCallback(() => {
    setHasError(false);
    refresh();
  }, [refresh]);

  return {
    data,
    client: data?.client || null,
    stats: data?.stats || {
      total_jobs: 0,
      total_revenue: 0,
      avg_job_value: 0,
      jobs_this_year: 0,
      revenue_this_year: 0,
      last_service_date: null
    },
    recentJobs: data?.recent_jobs || [],
    recentPayments: data?.recent_payments || [],
    properties: data?.properties || [],
    totalJobsCount: data?.total_jobs_count || 0,
    totalPaymentsCount: data?.total_payments_count || 0,
    totalRevenue: data?.total_revenue || 0,
    isLoading,
    hasError,
    refresh,
    clearError
  };
};
