
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClientPaymentsRealtime = (clientId: string | undefined, onUpdate: () => void) => {
  useEffect(() => {
    if (!clientId) return;
    
    // Listen to payments table changes
    const paymentsChannel = supabase
      .channel('client-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Payment changed:', payload);
          // Since we can't filter directly by client_id (payments table doesn't have it),
          // we refresh anyway and the hook will filter for the right client
          onUpdate();
        }
      )
      .subscribe();
      
    // Listen to invoices table changes that might affect payment totals
    const invoicesChannel = supabase
      .channel('client-invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: clientId ? `client_id=eq.${clientId}` : undefined
        },
        (payload) => {
          console.log('Invoice changed:', payload);
          onUpdate();
        }
      )
      .subscribe();
      
    // Cleanup
    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [clientId, onUpdate]);
};
