
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormattedMessage } from "./types";

interface UseMessageFetchingProps {
  clientId?: string;
  clientName: string;
  open: boolean;
}

export const useMessageFetching = ({ clientId, clientName, open }: UseMessageFetchingProps) => {
  const [messages, setMessages] = useState<FormattedMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!clientId) return;
    
    setIsLoadingMessages(true);
    
    try {
      // First, check if a conversation exists for this client
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', clientId);
      
      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        setConversationId(conversation.id);
        
        // Fetch messages for this conversation
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });
          
        if (messagesData) {
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            text: msg.body,
            sender: msg.direction === 'outbound' ? 'You' : clientName,
            timestamp: new Date(msg.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }),
            isClient: msg.direction === 'inbound'
          }));
          
          setMessages(formattedMessages);
        }
      } else {
        // No conversation exists yet
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (open && clientId) {
      fetchMessages();
    }
  }, [open, clientId]);

  return {
    messages,
    setMessages,
    isLoadingMessages,
    conversationId,
    setConversationId,
    fetchMessages
  };
};
