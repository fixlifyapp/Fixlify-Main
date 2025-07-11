
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormattedMessage } from "./types";

interface UseMessageRealtimeProps {
  open: boolean;
  clientId?: string;
  clientName: string;
  conversationId: string | null;
  messages: FormattedMessage[];
  setMessages: React.Dispatch<React.SetStateAction<FormattedMessage[]>>;
}

export const useMessageRealtime = ({ 
  open, 
  clientId, 
  clientName,
  conversationId, 
  messages, 
  setMessages 
}: UseMessageRealtimeProps) => {
  
  useEffect(() => {
    if (!open || !clientId) return;
    
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined
        },
        (payload) => {
          // Only process messages that aren't already in our list
          const newMsg = payload.new;
          if (newMsg && !messages.some(msg => msg.id === newMsg.id)) {
            const formattedMessage: FormattedMessage = {
              id: newMsg.id,
              text: newMsg.body,
              sender: newMsg.direction === 'outbound' ? 'You' : clientName,
              timestamp: new Date(newMsg.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }),
              isClient: newMsg.direction === 'inbound'
            };
            
            setMessages(prev => [...prev, formattedMessage]);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, clientId, conversationId, messages]);
};
