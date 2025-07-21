
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SMSMessage {
  id: string;
  conversation_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  status: string;
  created_at: string;
  received_at?: string;
  sent_at?: string;
}

interface SMSConversation {
  id: string;
  phone_number_id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  last_message_at: string;
  last_message_preview: string;
  unread_count: number;
  status: string;
  phone_numbers?: {
    phone_number: string;
  };
}

interface SMSContextType {
  conversations: SMSConversation[];
  messages: { [conversationId: string]: SMSMessage[] };
  loading: boolean;
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (!context) {
    throw new Error('useSMS must be used within an SMSProvider');
  }
  return context;
};

export const SMSProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: SMSMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const refreshConversations = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching SMS conversations for user:', user.id);
      
      const { data, error } = await supabase
        .from('sms_conversations')
        .select(`
          *,
          phone_numbers!inner(
            phone_number,
            purchased_by,
            assigned_to
          )
        `)
        .or(`phone_numbers.purchased_by.eq.${user.id},phone_numbers.assigned_to.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      console.log('Fetched conversations:', data);
      setConversations(data || []);
    } catch (error) {
      console.error('Error in refreshConversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Fetched messages:', data);
      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const { error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: conversation.client_phone,
          message: content,
          user_id: user?.id,
          metadata: {
            conversation_id: conversationId,
            client_id: conversation.client_id
          }
        }
      });

      if (error) {
        console.error('Error sending SMS:', error);
        toast.error('Failed to send message');
        return;
      }

      toast.success('Message sent successfully');
      
      // Refresh messages to show the sent message
      await fetchMessages(conversationId);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshConversations();
    }
  }, [user?.id]);

  // Set up real-time subscriptions for new messages
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for SMS');

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('sms_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sms_messages'
        },
        (payload) => {
          console.log('New SMS message received:', payload);
          const newMessage = payload.new as SMSMessage;
          
          setMessages(prev => ({
            ...prev,
            [newMessage.conversation_id]: [
              ...(prev[newMessage.conversation_id] || []),
              newMessage
            ]
          }));
          
          // Refresh conversations to update last message info
          refreshConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsSubscription = supabase
      .channel('sms_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sms_conversations'
        },
        (payload) => {
          console.log('SMS conversation updated:', payload);
          refreshConversations();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up SMS subscriptions');
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user?.id]);

  useEffect(() => {
    setLoading(false);
  }, [conversations]);

  const value: SMSContextType = {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    refreshConversations,
    fetchMessages
  };

  return (
    <SMSContext.Provider value={value}>
      {children}
    </SMSContext.Provider>
  );
};
