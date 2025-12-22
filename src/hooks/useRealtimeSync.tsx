
import { useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to set up real-time subscriptions to Supabase tables
 * 
 * @param options Configuration options for real-time subscriptions
 * @param options.tables Array of tables to subscribe to
 * @param options.onUpdate Callback function to run when changes occur
 * @param options.filter Optional filter to apply to subscriptions
 * @param options.enabled Whether the hook is enabled
 */
export const useRealtimeSync = ({
  tables,
  onUpdate,
  filter,
  enabled = true
}: {
  tables: string[];
  onUpdate: () => void;
  filter?: Record<string, any>;
  enabled?: boolean;
}) => {
  // Stabilize references to prevent infinite re-renders
  const onUpdateRef = useRef(onUpdate);
  const filterRef = useRef(filter);

  // Update refs on each render
  onUpdateRef.current = onUpdate;
  filterRef.current = filter;

  // Memoize tables string for stable comparison
  const tablesKey = useMemo(() => tables.sort().join(','), [tables]);

  useEffect(() => {
    if (!enabled) return;

    const currentTables = tablesKey.split(',').filter(Boolean);
    console.log("🔄 Setting up real-time sync for tables:", currentTables);

    // Store all channels so we can clean them up later
    const channels = currentTables.map(table => {
      // Map display names to actual table names
      const tableNameMap: Record<string, string> = {
        'tags': 'tags',
        'job_types': 'job_types', 
        'job_statuses': 'job_statuses',
        'custom_fields': 'custom_fields',
        'lead_sources': 'lead_sources',
        'jobs': 'jobs',
        'clients': 'clients',
        'job_custom_field_values': 'job_custom_field_values'
      };
      
      const actualTableName = tableNameMap[table] || table;
      
      // Create filter string if filter is provided
      let filterString = undefined;
      const currentFilter = filterRef.current;
      if (currentFilter) {
        const column = Object.keys(currentFilter)[0];
        const value = currentFilter[column];
        if (column && value) {
          filterString = `${column}=eq.${value}`;
        }
      }
      
      console.log(`📡 Creating real-time channel for table: ${actualTableName}`, {
        filter: filterString
      });
      
      // Create and subscribe to the channel
      const channel = supabase
        .channel(`realtime-${actualTableName}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: actualTableName,
            filter: filterString
          },
          (payload) => {
            console.log(`🔔 Real-time update for ${actualTableName}:`, {
              event: payload.eventType,
              table: payload.table,
              old: payload.old,
              new: payload.new
            });
            onUpdateRef.current();
          }
        )
        .subscribe((status) => {
          console.log(`📡 Subscription status for ${actualTableName}:`, status);
        });
        
      return channel;
    });
    
    // Clean up all subscriptions when component unmounts
    return () => {
      console.log("🧹 Cleaning up real-time subscriptions");
      channels.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [tablesKey, enabled]);
};
