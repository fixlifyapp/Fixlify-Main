
import { useState, useEffect } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  type: 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed';
}

export const useConversationMessaging = (clientId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useMessageContext();

  useEffect(() => {
    if (clientId) {
      fetchMessages();
    }
  }, [clientId]);

  const fetchMessages = async () => {
    if (!clientId) return;
    
    try {
      setIsLoading(true);
      
      const { data: logs, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedMessages: Message[] = logs?.map(log => ({
        id: log.id,
        content: log.content || log.subject || 'No content',
        timestamp: log.created_at,
        type: log.communication_type as 'sms' | 'email',
        direction: 'outbound', // Assuming all logged messages are outbound for now
        status: log.status as 'sent' | 'delivered' | 'failed'
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendNewMessage = async (type: 'sms' | 'email', to: string, content: string, subject?: string) => {
    try {
      await sendMessage({
        type,
        to,
        content,
        subject,
        clientId
      });
      
      // Refresh messages after sending
      await fetchMessages();
      toast.success(`${type.toUpperCase()} sent successfully`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    sendNewMessage,
    refreshMessages: fetchMessages
  };
};
