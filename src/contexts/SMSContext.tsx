import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface SMSMetadata {
  conversationId?: string;
  clientId?: string;
  clientName?: string;
  source?: string;
  [key: string]: string | number | boolean | null | undefined;
}

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
  metadata?: SMSMetadata;
  created_at: string;
}

const PAGE_SIZE = 15;

interface SMSContextType {
  conversations: SMSConversation[];
  activeConversation: SMSConversation | null;
  messages: SMSMessage[];
  isLoading: boolean;
  isSending: boolean;
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  totalMessageCount: number;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (clientId: string, phoneNumber: string) => Promise<string | null>;
  setActiveConversation: (conversation: SMSConversation | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (!context) {
    throw new Error('useSMS must be used within SMSProvider');
  }
  return context;
};

export const SMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<SMSConversation | null>(null);
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('sms_conversations')
        .select(`
          *,
          client:clients(id, name, phone, email)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      setConversations(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching conversations:', errorMessage);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      // Get total count first
      const { count } = await supabase
        .from('sms_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);

      setTotalMessageCount(count || 0);

      // Fetch initial messages (newest first, then reverse for display)
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      // Reverse to show oldest first for chat display
      const reversedData = (data || []).reverse();

      setMessages(reversedData.map(msg => ({
        ...msg,
        direction: msg.direction as 'inbound' | 'outbound'
      })));

      // Set hasMore based on count
      setHasMoreMessages((count || 0) > PAGE_SIZE);
      prevMessageCountRef.current = reversedData.length;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching messages:', errorMessage);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation?.id || loadingMoreMessages || !hasMoreMessages) return;

    setLoadingMoreMessages(true);
    try {
      // Fetch older messages (skip already loaded ones)
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: false })
        .range(messages.length, messages.length + PAGE_SIZE - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Reverse to get chronological order, then prepend
        const olderMessages = data.reverse().map(msg => ({
          ...msg,
          direction: msg.direction as 'inbound' | 'outbound'
        }));

        setMessages(prev => [...olderMessages, ...prev]);

        // Update hasMore
        const newTotal = messages.length + data.length;
        setHasMoreMessages(newTotal < totalMessageCount);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading more messages:', errorMessage);
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMoreMessages(false);
    }
  }, [activeConversation?.id, loadingMoreMessages, hasMoreMessages, messages.length, totalMessageCount]);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user?.id || !conversationId || !content.trim()) return;
    
    setIsSending(true);
    try {
      // Get conversation details
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) throw new Error('Conversation not found');

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

      // Send SMS using the correct parameter names
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: conversation.client_phone,
          message: content,
          user_id: user.id,
          metadata: {
            conversationId: conversationId,
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending message:', errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating conversation:', errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error marking as read:', errorMessage);
    }
  }, []);

  // Set up realtime subscriptions for conversations and messages
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchConversations();

    // Subscribe to SMS conversations changes
    const conversationsChannel = supabase
      .channel('sms-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sms_conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('SMS conversation updated:', payload);
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to ALL messages for this user's conversations
    // This ensures we catch new messages even if not viewing that conversation
    const allMessagesChannel = supabase
      .channel('all-sms-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sms_messages'
        },
        async (payload) => {
          console.log('New SMS message detected:', payload);
          
          // Check if this message belongs to one of our conversations
          const conversationId = payload.new.conversation_id;
          const isOurConversation = conversations.some(c => c.id === conversationId);
          
          if (isOurConversation) {
            // Refresh conversations to update unread counts
            await fetchConversations();
            
            // If viewing this conversation, refresh messages
            if (activeConversation?.id === conversationId) {
              await fetchMessages(conversationId);
            }
            
            // Show a toast notification for inbound messages
            if (payload.new.direction === 'inbound') {
              const conversation = conversations.find(c => c.id === conversationId);
              toast.success(`New message from ${conversation?.client?.name || 'Unknown'}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      try {
        if (conversationsChannel) {
          supabase.removeChannel(conversationsChannel);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error removing conversations channel:', errorMessage);
      }
    };
  }, [user?.id, fetchConversations]);

  // Global message listener for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const allMessagesChannel = supabase
      .channel('all-sms-messages-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sms_messages'
        },
        async (payload) => {
          console.log('New SMS message detected globally:', payload);
          
          // Always refresh conversations to catch new messages
          fetchConversations();
          
          // If viewing the conversation where message arrived, refresh messages
          if (activeConversation?.id === payload.new.conversation_id) {
            fetchMessages(payload.new.conversation_id);
          }
          
          // Show notification for inbound messages
          if (payload.new.direction === 'inbound') {
            toast.success('New SMS message received!');
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(allMessagesChannel);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error removing global messages channel:', errorMessage);
      }
    };
  }, [user?.id, activeConversation?.id, fetchConversations, fetchMessages]);

  // Set up realtime subscription for messages when viewing a conversation
  useEffect(() => {
    if (!activeConversation?.id) return;

    // Initial fetch
    fetchMessages(activeConversation.id);

    // Subscribe to SMS messages changes for this conversation
    const messagesChannel = supabase
      .channel(`sms-messages-${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sms_messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          console.log('SMS message updated:', payload);
          fetchMessages(activeConversation.id);

          // If it's a new inbound message, mark conversation as having unread messages
          if (payload.eventType === 'INSERT' && payload.new.direction === 'inbound') {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      try {
        if (messagesChannel) {
          supabase.removeChannel(messagesChannel);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error removing messages channel:', errorMessage);
      }
    };
  }, [activeConversation?.id, fetchMessages, fetchConversations]);

  // Auto-scroll behavior when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      // New messages arrived, scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const value: SMSContextType = {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    hasMoreMessages,
    loadingMoreMessages,
    totalMessageCount,
    fetchConversations,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    createConversation,
    setActiveConversation,
    markAsRead
  };

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>;
};