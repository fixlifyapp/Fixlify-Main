
import { useContext } from 'react';
import { GlobalRealtimeContext } from '@/contexts/GlobalRealtimeProvider';

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
}

// Create a fallback context for when provider is not available
const fallbackContext: GlobalRealtimeContextType = {
  refreshJobs: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshClients: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshMessages: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshInvoices: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshPayments: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshEstimates: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshJobHistory: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshJobStatuses: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshJobTypes: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshCustomFields: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshTags: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshLeadSources: () => console.warn('GlobalRealtimeProvider not initialized'),
  refreshJobCustomFieldValues: () => console.warn('GlobalRealtimeProvider not initialized'),
  isConnected: false
};

export const useGlobalRealtimeDefensive = () => {
  const context = useContext(GlobalRealtimeContext);
  
  // Return fallback context if provider is not available
  if (!context) {
    console.warn('useGlobalRealtime called outside of GlobalRealtimeProvider, using fallback');
    return fallbackContext;
  }
  
  return context;
};
