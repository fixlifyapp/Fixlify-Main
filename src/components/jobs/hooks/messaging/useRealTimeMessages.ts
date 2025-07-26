
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

    // First, find the conversation ID for the current job if not provided
    const setupRealTimeListener = async () => {
      let channelConversationId = conversationId;
      
      if (!channelConversationId) {
        try {
        const { data: conversation } = await supabase
          .from('sms_conversations')
          .select('id')
          .eq('job_id', jobId)
          .single();

        if (conversation) {
          channelConversationId = conversation.id.toString();
        }
        } catch (error) {
          console.error("Error finding conversation:", error);
          return null; // Return null if there's an error
        }
      }

      if (channelConversationId) {
        // Set up real-time listener for this conversation
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
              onNewMessage(); // Call the callback to refresh messages
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
      
      return null; // Return null if no conversation ID was found
    };

    // Create a variable to store the cleanup function
    let cleanupFunction: (() => void) | null = null;

    // Call the async function and store the cleanup function when the promise resolves
    setupRealTimeListener().then(cleanup => {
      cleanupFunction = cleanup;
    });

    // Return a cleanup function for the effect
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [jobId, conversationId, onNewMessage]);
};
