import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import type { Client } from "@/types/core/client";
import { localStorageCache } from "@/utils/cacheConfig";
import { withRetry, handleJobsError } from "@/utils/errorHandling";
import { RefreshThrottler } from "@/utils/refreshThrottler";
import { useRealtime } from "@/hooks/useRealtime";
import { toast } from "sonner";
import { generateNextId } from "@/utils/idGeneration";
import { formatPhoneForTelnyx } from "@/utils/phoneUtils";

interface UseClientsOptimizedOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  searchQuery?: string;
}

interface ClientsResult {
  clients: Client[];
  totalCount: number;
}

interface ClientStatistics {
  total: number;
  active: number;
  newThisMonth: number;
  retention: number;
  totalRevenue: number;
  averageClientValue: number;
}

// Request deduplication cache
const requestCache = new Map<string, Promise<ClientsResult>>();

export const useClientsOptimized = (options: UseClientsOptimizedOptions = {}) => {
  const { page = 1, pageSize = 50, enableRealtime = true, searchQuery = '' } = options;
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [statistics, setStatistics] = useState<ClientStatistics>({
    total: 0,
    active: 0,
    newThisMonth: 0,
    retention: 0,
    totalRevenue: 0,
    averageClientValue: 0
  });
  
  const { user, isAuthenticated } = useAuth();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const isMountedRef = useRef(true);
  const refreshThrottlerRef = useRef(new RefreshThrottler());
  
  // Calculate derived values
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  // Real-time subscription
  const { connected: realtimeConnected } = useRealtime({
    channel: 'clients-optimized',
    table: 'clients',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    onUpdate: useCallback(() => {
      refreshThrottlerRef.current.scheduleRefresh(() => {
        if (isMountedRef.current) {
          console.log('Real-time update received for clients');
          fetchClients();
          fetchStatistics();
        }
      });
    }, []),
    enabled: enableRealtime && isAuthenticated
  });
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch statistics using database function
  const fetchStatistics = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('fetchStatistics: Not authenticated or no user ID', { isAuthenticated, userId: user?.id });
      return;
    }
    
    const statsCacheKey = `client_stats_${user.id}`;
    
    try {
      // Try cache first
      const cached = localStorageCache.get<ClientStatistics>(statsCacheKey);
      if (cached) {
        console.log('fetchStatistics: Using cached stats', cached);
        setStatistics(cached);
      }
      
      console.log('fetchStatistics: Calling RPC with user ID', user.id);
      // Fetch from database function
      const { data, error } = await supabase
        .rpc('get_client_statistics', { p_user_id: user.id });
      
      if (error) {
        console.error('fetchStatistics: RPC error', error);
        throw error;
      }
      
      console.log('fetchStatistics: RPC response', data);
      
      if (data && data.length > 0) {
        const stats: ClientStatistics = {
          total: Number(data[0].total_clients) || 0,
          active: Number(data[0].active_clients) || 0,
          newThisMonth: Number(data[0].new_this_month) || 0,
          retention: Number(data[0].retention_rate) || 0,
          totalRevenue: Number(data[0].total_revenue) || 0,
          averageClientValue: Number(data[0].average_client_value) || 0
        };
        
        console.log('fetchStatistics: Setting stats', stats);
        setStatistics(stats);
        localStorageCache.set(statsCacheKey, stats, 5); // 5 minute cache
      }
    } catch (error) {
      console.error('Error fetching client statistics:', error);
    }
  }, [isAuthenticated, user?.id]);  
  const fetchClients = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }
    
    const cacheKey = `clients_${user.id}_${page}_${pageSize}_${searchQuery}`;
    
    // Check if we already have a pending request
    if (requestCache.has(cacheKey)) {
      const result = await requestCache.get(cacheKey)!;
      if (isMountedRef.current) {
        setClients(result.clients);
        setTotalCount(result.totalCount);
        setIsLoading(false);
      }
      return;
    }
    
    // Create new request promise
    const requestPromise = (async () => {
      try {
        // Try cache first
        const cached = localStorageCache.get<ClientsResult>(cacheKey);
        if (cached && isMountedRef.current) {
          setClients(cached.clients);
          setTotalCount(cached.totalCount);
          setIsLoading(false);
        }
        
        // Fetch from database
        return await withRetry(async () => {
          let query = supabase
            .from('clients')
            .select('*', { count: 'exact' });
          
          // Apply user filter
          query = query.or(`user_id.eq.${user.id},created_by.eq.${user.id}`);
          
          // Apply search filter if provided
          if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
          }
          
          // Apply pagination
          query = query
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);
          
          const { data, error, count } = await query;
          
          if (error) throw error;
          
          const result: ClientsResult = {
            clients: data || [],
            totalCount: count || 0
          };
          
          // Cache the result
          localStorageCache.set(cacheKey, result, 5); // 5 minute cache
          
          return result;
        }, {
          maxRetries: 2,
          baseDelay: 1000
        });
      } catch (error) {
        setHasError(true);
        handleJobsError(error, 'useClientsOptimized - fetchClients');
        throw error;
      }
    })();
    
    requestCache.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      if (isMountedRef.current && result) {
        setClients(result.clients);
        setTotalCount(result.totalCount);
        setHasError(false);
      }
    } catch (error) {
      // Error already handled
    } finally {
      requestCache.delete(cacheKey);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, user?.id, page, pageSize, searchQuery]);  
  useEffect(() => {
    fetchClients();
    fetchStatistics();
  }, [fetchClients, fetchStatistics]);
  
  const refreshClients = useCallback(() => {
    setIsLoading(true);
    // Clear cache to force fresh data
    if (user?.id) {
      const cacheKey = `clients_${user.id}_${page}_${pageSize}_${searchQuery}`;
      localStorageCache.remove(cacheKey);
      localStorageCache.remove(`client_stats_${user.id}`);
    }
    fetchClients();
    fetchStatistics();
  }, [fetchClients, fetchStatistics, user?.id, page, pageSize, searchQuery]);
  
  const clearError = useCallback(() => {
    setHasError(false);
  }, []);
  
  // CRUD Operations with optimistic updates
  const addClient = useCallback(async (
    client: { name: string } & Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to add clients');
      throw new Error('Not authenticated');
    }
    
    try {
      // Generate new client ID
      const clientId = await generateNextId('client');
      
      // Format phone number if provided
      const clientData = {
        ...client,
        phone: client.phone ? formatPhoneForTelnyx(client.phone) : client.phone,
        id: clientId,
        user_id: user.id,
        created_by: user.id
      };
      
      // Optimistic update
      const optimisticClient: Client = {
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Client;
      
      setClients(prev => [optimisticClient, ...prev]);
      setTotalCount(prev => prev + 1);
      
      // Update statistics optimistically
      setStatistics(prev => ({
        ...prev,
        total: prev.total + 1,
        active: client.status === 'active' ? prev.active + 1 : prev.active,
        newThisMonth: prev.newThisMonth + 1
      }));
      
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) {
        // Rollback optimistic update
        setClients(prev => prev.filter(c => c.id !== clientId));
        setTotalCount(prev => prev - 1);
        setStatistics(prev => ({
          ...prev,
          total: prev.total - 1,
          active: client.status === 'active' ? prev.active - 1 : prev.active,
          newThisMonth: prev.newThisMonth - 1
        }));
        throw error;
      }
      
      // Update with real data
      setClients(prev => prev.map(c => c.id === clientId ? data : c));
      
      toast.success('Client added successfully');
      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
      throw error;
    }
  }, [isAuthenticated, user?.id]);  
  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to update clients');
      return null;
    }
    
    try {
      // Format phone number if it's being updated
      const updateData = {
        ...updates,
        phone: updates.phone ? formatPhoneForTelnyx(updates.phone) : updates.phone
      };
      
      // Optimistic update
      const previousClient = clients.find(c => c.id === id);
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...updateData } : client
      ));
      
      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
        .select()
        .single();
        
      if (error) {
        // Rollback optimistic update
        if (previousClient) {
          setClients(prev => prev.map(client => 
            client.id === id ? previousClient : client
          ));
        }
        throw error;
      }
      
      // Update with real data
      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      
      toast.success('Client updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return null;
    }
  }, [isAuthenticated, user?.id, clients]);
  
  const deleteClient = useCallback(async (id: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to delete clients');
      return false;
    }
    
    try {
      // Optimistic update
      const deletedClient = clients.find(c => c.id === id);
      setClients(prev => prev.filter(client => client.id !== id));
      setTotalCount(prev => prev - 1);
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .or(`user_id.eq.${user.id},created_by.eq.${user.id}`);
        
      if (error) {
        // Rollback optimistic update
        if (deletedClient) {
          setClients(prev => [...prev, deletedClient]);
          setTotalCount(prev => prev + 1);
        }
        throw error;
      }
      
      toast.success('Client deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  }, [isAuthenticated, user?.id, clients]);
  
  // Batch operations
  const getBatchClientStats = useCallback(async (clientIds: string[]) => {
    if (!clientIds.length) return {};
    
    try {
      const { data, error } = await supabase
        .rpc('get_batch_client_stats', { p_client_ids: clientIds });
      
      if (error) throw error;
      
      // Convert array to object for easy lookup
      return data.reduce((acc: Record<string, any>, stat: any) => {
        acc[stat.client_id] = stat;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching batch client stats:', error);
      return {};
    }
  }, []);  
  return {
    // Data
    clients,
    statistics,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // States
    isLoading,
    hasError,
    realtimeConnected,
    
    // Actions
    refreshClients,
    clearError,
    addClient,
    updateClient,
    deleteClient,
    getBatchClientStats,
    
    // Permissions
    canCreate,
    canEdit,
    canDelete
  };
};