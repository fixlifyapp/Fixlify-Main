
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: string;
  direction: string;
  content: string;
  status: string;
  created_at: string;
  client_id: string;
  from_address: string;
  to_address: string;
}

export const useConversationMessaging = (clientId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !clientId) return;
    
    fetchMessages();
  }, [user, clientId]);

  const fetchMessages = async () => {
    if (!user || !clientId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        type: msg.type,
        direction: msg.direction,
        content: msg.content,
        status: msg.status,
        created_at: msg.created_at,
        client_id: msg.client_id,
        from_address: msg.from_address,
        to_address: msg.to_address
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, type: 'sms' | 'email') => {
    // Implementation for sending messages
    console.log('Sending message:', { content, type, clientId });
  };

  return {
    messages,
    isLoading,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
