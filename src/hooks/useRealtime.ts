import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

export const useRealtime = ({
  table,
  schema = 'public',
  event = '*',
  filter,
  onUpdate,
  enabled = true
}: UseRealtimeOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Stabilize onUpdate reference to prevent infinite re-renders
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log(`[useRealtime] Cleaning up channel for ${table}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [table]);

  const setupChannel = useCallback(() => {
    if (!enabled) return;

    cleanup();

    const channelName = `realtime-${table}-${Date.now()}`;
    console.log(`[useRealtime] Setting up channel: ${channelName}`);

    const channelConfig: any = {
      event,
      schema,
      table
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload) => {
        console.log(`[useRealtime] Update received for ${table}:`, payload);
        onUpdateRef.current(payload);
      })
      .subscribe((status, err) => {
        console.log(`[useRealtime] Channel status for ${table}:`, status, err);

        if (err) {
          console.error(`[useRealtime] Subscription error for ${table}:`, err);
          setError(err as Error);
          setIsConnected(false);

          // Implement exponential backoff
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current++;

            console.log(`[useRealtime] Reconnecting ${table} in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setupChannel();
            }, delay);
          } else {
            toast.error(`Lost connection to ${table} updates. Please refresh the page.`);
          }
        } else if (status === 'SUBSCRIBED') {
          console.log(`[useRealtime] Successfully subscribed to ${table}`);
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[useRealtime] Channel error for ${table}`);
          setIsConnected(false);
          setError(new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          console.error(`[useRealtime] Subscription timed out for ${table}`);
          setIsConnected(false);
          setError(new Error('Subscription timed out'));
        } else if (status === 'CLOSED') {
          console.log(`[useRealtime] Channel closed for ${table}`);
          setIsConnected(false);
        }
      });

    channelRef.current = channel;
  }, [enabled, table, schema, event, filter, cleanup]);

  useEffect(() => {
    setupChannel();
    return cleanup;
  }, [setupChannel, cleanup]);

  const reconnect = useCallback(() => {
    console.log(`[useRealtime] Manual reconnect requested for ${table}`);
    reconnectAttemptsRef.current = 0;
    setupChannel();
  }, [setupChannel, table]);

  return {
    isConnected,
    error,
    reconnect
  };
};
