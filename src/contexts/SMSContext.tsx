import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface SMSConversation {
  id: string;
  user_id: string;
  client_id?: string;
  phone_number: string;
  client_phone: string;
  status: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

interface SMSMessage {
  id: string;
  conversation_id: string;
  communication_log_id?: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  content: string;
  status: string;
  external_id?: string;
  metadata?: any;
  created_at: string;
}

interface SMSContextType {
  conversations: SMSConversation[];
  activeConversation: SMSConversation | null;
  messages: SMSMessage[];
  isLoading: boolean;
  isSending: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (clientId: string, phoneNumber: string) => Promise<string | null>;
  setActiveConversation: (conversation: SMSConversation | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (!context) {
    throw new Error('useSMS must be used within an SMSProvider');
  }
  return context;
};
export const SMSProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<SMSConversation | null>(null);
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('sms_conversations')
        .select(`
          *,
          client:clients(id, name, phone, email)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      setConversations(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user?.id || !conversationId || !content.trim()) return;
    
    try {
      setIsSending(true);
      
      // Get conversation details
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        toast.error('Conversation not found');
        return;
      }

      // Get user's phone number
      const { data: phoneData, error: phoneError } = await supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (phoneError || !phoneData) {
        toast.error('Please configure a primary phone number first');
        return;
      }
      // Call the telnyx-sms edge function
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: conversation.client_phone,
          message: content,
          user_id: user?.id,
          metadata: {
            clientId: conversation.client_id,
            clientName: conversation.client?.name,
            source: 'sms_conversations'
          }
        }
      });

      if (error) throw error;

      // Create message record only if we have a messageId
      if (data?.messageId) {
        // Check if message with this external_id already exists
        const { data: existingMessage } = await supabase
          .from('sms_messages')
          .select('id')
          .eq('external_id', data.messageId)
          .single();

        if (!existingMessage) {
          const { error: messageError } = await supabase
            .from('sms_messages')
            .insert({
              conversation_id: conversationId,
              direction: 'outbound',
              from_number: phoneData.phone_number,
              to_number: conversation.client_phone,
              content: content,
              status: 'sent',
              external_id: data.messageId
            });

          if (messageError) {
            console.error('Error inserting message:', messageError);
            // Don't throw here, message was sent successfully
          }
        }
      } else {
        // If no messageId returned, still insert the message without external_id
        const { error: messageError } = await supabase
          .from('sms_messages')
          .insert({
            conversation_id: conversationId,
            direction: 'outbound',
            from_number: phoneData.phone_number,
            to_number: conversation.client_phone,
            content: content,
            status: 'sent'
          });

        if (messageError) {
          console.error('Error inserting message:', messageError);
          // Don't throw here, message was sent successfully
        }
      }

      toast.success('Message sent successfully');
      
      // Refresh messages and conversations
      await fetchMessages(conversationId);
      await fetchConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [user?.id, conversations, fetchMessages, fetchConversations]);
  const createConversation = useCallback(async (clientId: string, phoneNumber: string): Promise<string | null> => {
    if (!user?.id) return null;
    
    try {
      // Get user's phone number
      const { data: phoneData, error: phoneError } = await supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (phoneError || !phoneData) {
        toast.error('Please configure a primary phone number first');
        return null;
      }

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('sms_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .eq('client_phone', phoneNumber)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('sms_conversations')
        .insert({
          user_id: user.id,
          client_id: clientId,
          phone_number: phoneData.phone_number,
          client_phone: phoneNumber,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  }, [user?.id, fetchConversations]);
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from('sms_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  // Simple polling for conversations - no realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchConversations();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id, fetchConversations]);

  // Poll for messages when viewing a conversation
  useEffect(() => {
    if (activeConversation?.id) {
      // Initial fetch
      fetchMessages(activeConversation.id);
      markAsRead(activeConversation.id);
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id, fetchMessages, markAsRead]);

  const value: SMSContextType = {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    setActiveConversation,
    markAsRead
  };

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>;
};