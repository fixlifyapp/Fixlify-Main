
import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useGlobalRealtimeDefensive } from './useGlobalRealtimeDefensive';

interface UseUnifiedRealtimeProps {
  tables: ('jobs' | 'clients' | 'messages' | 'invoices' | 'payments' | 'estimates' | 'line_items' | 'job_history' | 'job_custom_field_values' | 'tags' | 'job_types' | 'job_statuses' | 'custom_fields' | 'lead_sources' | 'invoice_communications' | 'estimate_communications')[];
  onUpdate: () => void;
  enabled?: boolean;
}

export const useUnifiedRealtime = ({ tables, onUpdate, enabled = true }: UseUnifiedRealtimeProps) => {
  const globalRealtime = useGlobalRealtimeDefensive();

  // Stabilize onUpdate callback with useRef to prevent infinite re-renders
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Memoize tables key for stable comparison
  const tablesKey = useMemo(() => tables.sort().join(','), [tables]);

  const handleUpdate = useCallback(() => {
    if (enabled) {
      console.log('Real-time update triggered for tables:', tablesKey);
      onUpdateRef.current();
    }
  }, [enabled, tablesKey]);

  useEffect(() => {
    if (!enabled || !globalRealtime) return;

    // Register callback for each table
    const unsubscribeFunctions: (() => void)[] = [];

    tables.forEach(table => {
      // Map table names to correct callback names
      const tableCallbackMap: Record<string, string> = {
        'jobs': 'refreshJobs',
        'clients': 'refreshClients', 
        'messages': 'refreshMessages',
        'invoices': 'refreshInvoices',
        'payments': 'refreshPayments',
        'estimates': 'refreshEstimates',
        'line_items': 'refreshEstimates', // Line items trigger estimates refresh
        'job_history': 'refreshJobHistory',
        'job_custom_field_values': 'refreshJobCustomFieldValues',
        'tags': 'refreshTags',
        'job_types': 'refreshJobTypes',
        'job_statuses': 'refreshJobStatuses',
        'custom_fields': 'refreshCustomFields',
        'lead_sources': 'refreshLeadSources',
        'invoice_communications': 'refreshInvoices', // Invoice communications trigger invoices refresh
        'estimate_communications': 'refreshEstimates' // Estimate communications trigger estimates refresh
      };

      const callbackName = tableCallbackMap[table];
      if (callbackName) {
        // Add callback to the global realtime system
        const refreshCallbacks = (globalRealtime as any).refreshCallbacks;
        const tableKey = callbackName.replace('refresh', '').toLowerCase();
        
        // Handle special cases for naming
        let finalTableKey = tableKey;
        if (table === 'job_custom_field_values') finalTableKey = 'jobcustomfieldvalues';
        if (table === 'job_types') finalTableKey = 'jobtypes';
        if (table === 'job_statuses') finalTableKey = 'jobstatuses';
        if (table === 'custom_fields') finalTableKey = 'customfields';
        if (table === 'lead_sources') finalTableKey = 'leadsources';
        if (table === 'job_history') finalTableKey = 'jobhistory';

        if (refreshCallbacks && refreshCallbacks[finalTableKey]) {
          refreshCallbacks[finalTableKey].add(handleUpdate);
          
          unsubscribeFunctions.push(() => {
            refreshCallbacks[finalTableKey].delete(handleUpdate);
          });
        }
      }
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [tablesKey, handleUpdate, enabled, globalRealtime]);

  return {
    isConnected: globalRealtime?.isConnected || false
  };
};
