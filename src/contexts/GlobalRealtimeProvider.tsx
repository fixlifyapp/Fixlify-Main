import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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

// Export the context for use in other files
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

  useEffect(() => {
    console.log('🔌 Setting up global realtime channels...');
    
    const setupRealtimeChannels = () => {
      // Clean up existing channel if any
      if (channelRef.current) {
        console.log('🧹 Cleaning up existing channel before creating new one');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      try {
        // Create a unique channel name with timestamp to avoid conflicts
        const channelName = `global-db-changes-${Date.now()}`;
        console.log(`📡 Creating new channel: ${channelName}`);
        
        const channel = supabase
          .channel(channelName, {
            config: {
              broadcast: { self: true },
              presence: { key: 'global' }
            }
          })
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'jobs'
            },
            (payload) => {
              console.log('📊 Jobs table changed:', {
                event: payload.eventType,
                id: payload.new?.id || payload.old?.id,
                callbacks: refreshCallbacksRef.current.jobs.size
              });
              refreshCallbacksRef.current.jobs.forEach(callback => {
                try {
                  callback();
                } catch (error) {
                  console.error('Error in jobs callback:', error);
                }
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'clients'
            },
            (payload) => {
              console.log('Clients table changed:', payload);
              refreshCallbacksRef.current.clients.forEach(callback => {
                try {
                  callback();
                } catch (error) {
                  console.error('Error in clients callback:', error);
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
            (payload) => {
              console.log('Invoices table changed:', payload);
              refreshCallbacksRef.current.invoices.forEach(callback => {
                try {
                  callback();
                } catch (error) {
                  console.error('Error in invoices callback:', error);
                }
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'estimates'
            },
            (payload) => {
              console.log('Estimates table changed:', payload);
              refreshCallbacksRef.current.estimates.forEach(callback => {
                try {
                  callback();
                } catch (error) {
                  console.error('Error in estimates callback:', error);
                }
              });
            }
          )
          .subscribe((status, err) => {
            console.log('✅ Global realtime subscription status:', status, err);
            
            if (err) {
              console.error('❌ Realtime subscription error:', err);
              setIsConnected(false);
              
              // Implement reconnection logic
              if (reconnectAttemptsRef.current < 5) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                reconnectAttemptsRef.current++;
                
                console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                  setupRealtimeChannels();
                }, delay);
              } else {
                toast.error('Unable to connect to realtime updates. Please refresh the page.');
              }
            } else if (status === 'SUBSCRIBED') {
              console.log('🎉 Successfully connected to realtime updates');
              setIsConnected(true);
              reconnectAttemptsRef.current = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Realtime channel error');
              setIsConnected(false);
              // Don't show toast for every channel error to avoid spam
            } else if (status === 'CLOSED') {
              console.log('📪 Channel closed');
              setIsConnected(false);
            }
          });

        channelRef.current = channel;
        return channel;
      } catch (error) {
        console.error('❌ Error setting up realtime channels:', error);
        setIsConnected(false);
        return null;
      }
    };

    const channel = setupRealtimeChannels();

    return () => {
      console.log('🔌 Cleaning up global realtime provider...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const refreshJobs = () => {
    console.log('🔄 Manual refresh triggered for jobs');
    refreshCallbacksRef.current.jobs.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual jobs refresh:', error);
      }
    });
  };

  const refreshClients = () => {
    refreshCallbacksRef.current.clients.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual clients refresh:', error);
      }
    });
  };

  const refreshMessages = () => {
    refreshCallbacksRef.current.messages.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual messages refresh:', error);
      }
    });
  };

  const refreshInvoices = () => {
    refreshCallbacksRef.current.invoices.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual invoices refresh:', error);
      }
    });
  };

  const refreshPayments = () => {
    refreshCallbacksRef.current.payments.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual payments refresh:', error);
      }
    });
  };

  const refreshEstimates = () => {
    refreshCallbacksRef.current.estimates.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual estimates refresh:', error);
      }
    });
  };

  const refreshJobHistory = () => {
    refreshCallbacksRef.current.jobhistory.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual job history refresh:', error);
      }
    });
  };

  const refreshJobStatuses = () => {
    refreshCallbacksRef.current.jobstatuses.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual job statuses refresh:', error);
      }
    });
  };

  const refreshJobTypes = () => {
    refreshCallbacksRef.current.jobtypes.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual job types refresh:', error);
      }
    });
  };

  const refreshCustomFields = () => {
    refreshCallbacksRef.current.customfields.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual custom fields refresh:', error);
      }
    });
  };

  const refreshTags = () => {
    refreshCallbacksRef.current.tags.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual tags refresh:', error);
      }
    });
  };

  const refreshLeadSources = () => {
    refreshCallbacksRef.current.leadsources.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual lead sources refresh:', error);
      }
    });
  };

  const refreshJobCustomFieldValues = () => {
    refreshCallbacksRef.current.jobcustomfieldvalues.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in manual job custom field values refresh:', error);
      }
    });
  };

  return (
    <GlobalRealtimeContext.Provider
      value={{
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
      }}
    >
      {children}
    </GlobalRealtimeContext.Provider>
  );
};
