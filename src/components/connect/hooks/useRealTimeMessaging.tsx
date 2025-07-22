
import { useEffect } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { supabase } from "@/integrations/supabase/client";

export const useRealTimeMessaging = () => {
  const { conversations, fetchConversations } = useMessageContext();

  useEffect(() => {
    // Set up real-time subscription for communication logs
    const channel = supabase
      .channel('communication_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs'
        },
        (payload) => {
          console.log('Communication log change:', payload);
          // Refresh conversations when there's a change
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  return {
    conversations
  };
};
