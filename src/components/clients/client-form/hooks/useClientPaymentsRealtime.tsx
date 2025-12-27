
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClientPaymentsRealtime = (clientId: string | undefined, onUpdate: () => void) => {
  // Stabilize callback with ref pattern to prevent infinite resubscription loops
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Stable handler that uses the ref
  const handleUpdate = useCallback(() => {
    onUpdateRef.current();
  }, []);

  useEffect(() => {
    if (!clientId) return;

    // Use unique channel names with clientId to prevent conflicts
    const paymentsChannel = supabase
      .channel(`client-payments-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        handleUpdate
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel(`client-invoices-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `client_id=eq.${clientId}`
        },
        handleUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [clientId, handleUpdate]);
};
