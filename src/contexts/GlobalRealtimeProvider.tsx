import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface GlobalRealtimeContextType {
  refreshJobs: () => void;
  refreshClients: () => void;
  refreshMessages: () => void;
  refreshInvoices: () => void;
  refreshPayments: () => void;
  refreshEstimates: () => void;
  refreshJobHistory: () => void;
  refreshJobStatuses: () => void;
  refreshJobTypes: () => void;
  refreshCustomFields: () => void;
  refreshTags: () => void;
  refreshLeadSources: () => void;
  refreshJobCustomFieldValues: () => void;
  isConnected: boolean;
  refreshCallbacks?: any;
}

export const GlobalRealtimeContext = createContext<GlobalRealtimeContextType | undefined>(undefined);

export const useGlobalRealtime = () => {
  const context = useContext(GlobalRealtimeContext);
  if (!context) {
    throw new Error('useGlobalRealtime must be used within a GlobalRealtimeProvider');
  }
  return context;
};

interface GlobalRealtimeProviderProps {
  children: ReactNode;
}

export const GlobalRealtimeProvider = ({ children }: GlobalRealtimeProviderProps) => {
  const refreshCallbacksRef = useRef({
    jobs: new Set<() => void>(),
    clients: new Set<() => void>(),
    messages: new Set<() => void>(),
    invoices: new Set<() => void>(),
    payments: new Set<() => void>(),
    estimates: new Set<() => void>(),
    jobhistory: new Set<() => void>(),
    jobstatuses: new Set<() => void>(),
    jobtypes: new Set<() => void>(),
    customfields: new Set<() => void>(),
    tags: new Set<() => void>(),
    leadsources: new Set<() => void>(),
    jobcustomfieldvalues: new Set<() => void>(),
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastRefreshRef = useRef<Record<string, number>>({});
  
  // Debounce refresh calls to prevent excessive updates
  const debounceRefresh = useCallback((tableName: string, callbacks: Set<() => void>) => {
    const now = Date.now();
    const lastRefresh = lastRefreshRef.current[tableName] || 0;
    
    // Skip if refreshed within last 500ms
    if (now - lastRefresh < 500) {
      return;
    }
    
    lastRefreshRef.current[tableName] = now;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(`Error in ${tableName} callback:`, error);
        }
      });
    });
  }, []);

  useEffect(() => {
    console.log('🔌 Setting up optimized realtime channel...');
    
    const setupRealtimeChannel = () => {
      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      try {
        // Create a single consolidated channel for all tables
        const channelName = `global-realtime-${Date.now()}`;
        console.log(`📡 Creating optimized channel: ${channelName}`);
        
        const channel = supabase
          .channel(channelName, {
            config: {
              broadcast: { self: false }, // Don't receive own broadcasts
              presence: { key: 'global' }
            }
          })
          // Jobs table
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'jobs'
          }, () => debounceRefresh('jobs', refreshCallbacksRef.current.jobs))
          // Clients table
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'clients'
          }, () => debounceRefresh('clients', refreshCallbacksRef.current.clients))
          // Messages table
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages'
          }, () => debounceRefresh('messages', refreshCallbacksRef.current.messages))
          // Invoices table
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'invoices'
          }, () => debounceRefresh('invoices', refreshCallbacksRef.current.invoices))
          // Subscribe to channel
          .subscribe((status) => {
            console.log('📡 Channel status:', status);
            
            if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime channel connected');
              setIsConnected(true);
              reconnectAttemptsRef.current = 0;
              
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              console.error('❌ Channel error or closed:', status);
              setIsConnected(false);
              handleReconnect();
            } else if (status === 'TIMED_OUT') {
              console.warn('⏱️ Channel subscription timed out');
              setIsConnected(false);
              handleReconnect();
            }
          });

        channelRef.current = channel;
        
      } catch (error) {
        console.error('❌ Error setting up realtime channel:', error);
        handleReconnect();
      }
    };

    const handleReconnect = () => {
      if (reconnectTimeoutRef.current) {
        return; // Already attempting to reconnect
      }

      reconnectAttemptsRef.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        setupRealtimeChannel();
      }, delay);
    };

    setupRealtimeChannel();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up realtime channel...');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [debounceRefresh]);

  // Memoized refresh functions to prevent unnecessary re-renders
  const refreshJobs = useCallback(() => {
    refreshCallbacksRef.current.jobs.forEach(callback => callback());
  }, []);

  const refreshClients = useCallback(() => {
    refreshCallbacksRef.current.clients.forEach(callback => callback());
  }, []);

  const refreshMessages = useCallback(() => {
    refreshCallbacksRef.current.messages.forEach(callback => callback());
  }, []);

  const refreshInvoices = useCallback(() => {
    refreshCallbacksRef.current.invoices.forEach(callback => callback());
  }, []);

  const refreshPayments = useCallback(() => {
    refreshCallbacksRef.current.payments.forEach(callback => callback());
  }, []);

  const refreshEstimates = useCallback(() => {
    refreshCallbacksRef.current.estimates.forEach(callback => callback());
  }, []);

  const refreshJobHistory = useCallback(() => {
    refreshCallbacksRef.current.jobhistory.forEach(callback => callback());
  }, []);

  const refreshJobStatuses = useCallback(() => {
    refreshCallbacksRef.current.jobstatuses.forEach(callback => callback());
  }, []);

  const refreshJobTypes = useCallback(() => {
    refreshCallbacksRef.current.jobtypes.forEach(callback => callback());
  }, []);

  const refreshCustomFields = useCallback(() => {
    refreshCallbacksRef.current.customfields.forEach(callback => callback());
  }, []);

  const refreshTags = useCallback(() => {
    refreshCallbacksRef.current.tags.forEach(callback => callback());
  }, []);

  const refreshLeadSources = useCallback(() => {
    refreshCallbacksRef.current.leadsources.forEach(callback => callback());
  }, []);

  const refreshJobCustomFieldValues = useCallback(() => {
    refreshCallbacksRef.current.jobcustomfieldvalues.forEach(callback => callback());
  }, []);

  const value = {
    refreshJobs,
    refreshClients,
    refreshMessages,
    refreshInvoices,
    refreshPayments,
    refreshEstimates,
    refreshJobHistory,
    refreshJobStatuses,
    refreshJobTypes,
    refreshCustomFields,
    refreshTags,
    refreshLeadSources,
    refreshJobCustomFieldValues,
    isConnected,
    refreshCallbacks: refreshCallbacksRef.current
  };

  return (
    <GlobalRealtimeContext.Provider value={value}>
      {children}
    </GlobalRealtimeContext.Provider>
  );
};