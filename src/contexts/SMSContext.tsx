
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  phone_number_id?: string;
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
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
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
  // Additional properties for compatibility
  activeConversation?: string | null;
  isLoading?: boolean;
  isSending?: boolean;
  setActiveConversation?: (id: string | null) => void;
  markAsRead?: (conversationId: string) => Promise<void>;
  createConversation?: (clientId: string, clientPhone: string) => Promise<string | null>;
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
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: SMSMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const refreshConversations = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching conversations for user:', user.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          clients(name, email, phone)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      console.log('Fetched conversations:', data);
      // Transform data to match SMS conversation format
      const transformedData = (data || []).map((conv: any) => ({
        id: conv.id,
        client_id: conv.client_id,
        client_name: conv.clients?.name || 'Unknown',
        client_phone: conv.clients?.phone || '',
        last_message_at: conv.created_at,
        last_message_preview: '',
        unread_count: 0,
        status: 'active',
        client: conv.clients
      }));
      setConversations(transformedData);
    } catch (error) {
      console.error('Error in refreshConversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Fetched messages:', data);
      // Transform data to match SMS message format
      const transformedData = (data || []).map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        content: msg.content,
        direction: msg.direction || 'outbound',
        from_number: msg.sender || '',
        to_number: msg.recipient || '',
        status: msg.status || 'sent',
        created_at: msg.created_at,
        sent_at: msg.created_at
      }));
      setMessages(prev => ({
        ...prev,
        [conversationId]: transformedData
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

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getCurrentUser();
  }, []);

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
    const messagesChannel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          
          // Transform to SMS message format
          const transformedMessage: SMSMessage = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            content: newMessage.content,
            direction: newMessage.direction || 'inbound',
            from_number: newMessage.sender || '',
            to_number: newMessage.recipient || '',
            status: newMessage.status || 'delivered',
            created_at: newMessage.created_at,
            sent_at: newMessage.created_at
          };
          
          setMessages(prev => ({
            ...prev,
            [transformedMessage.conversation_id]: [
              ...(prev[transformedMessage.conversation_id] || []),
              transformedMessage
            ]
          }));
          
          // Refresh conversations to update last message info
          refreshConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          refreshConversations();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up SMS subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    setLoading(false);
  }, [conversations]);

  const markAsRead = async (conversationId: string) => {
    // Implementation placeholder
    console.log('Mark as read:', conversationId);
  };

  const createConversation = async (clientId: string, clientPhone: string): Promise<string | null> => {
    // Implementation placeholder
    console.log('Create conversation:', clientId, clientPhone);
    return null;
  };

  const value: SMSContextType = {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    refreshConversations,
    fetchMessages,
    activeConversation: selectedConversation,
    isLoading: loading,
    isSending: false,
    setActiveConversation: setSelectedConversation,
    markAsRead,
    createConversation
  };

  return (
    <SMSContext.Provider value={value}>
      {children}
    </SMSContext.Provider>
  );
};
