
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealTimeMessagesProps {
  jobId: string;
  conversationId: string | null;
  onNewMessage: () => void;
}

export const useRealTimeMessages = ({ 
  jobId, 
  conversationId,
  onNewMessage
}: UseRealTimeMessagesProps) => {
  
  // Set up real-time subscription for incoming messages
  useEffect(() => {
    if (!jobId) return;

    const setupChannel = () => {
      let channelConversationId = conversationId;
      
      if (!channelConversationId) {
        // If no conversation ID provided, listen to all messages for this job
        const channel = supabase
          .channel('job-messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            () => {
              onNewMessage();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
        // Listen to specific conversation
        const channel = supabase
          .channel('job-messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${channelConversationId}`
            },
            () => {
              onNewMessage();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    const cleanup = setupChannel();
    return cleanup;
  }, [jobId, conversationId, onNewMessage]);
};
