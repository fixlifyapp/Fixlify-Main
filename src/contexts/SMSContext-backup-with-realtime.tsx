import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const { user } = useAuth();
  
  // Track if initial connection toast was shown
  const connectionToastShown = useRef(false);
  // Track last known message IDs to prevent duplicate notifications
  const lastMessageIds = useRef(new Set<string>());
  
  // Use refs for values that change frequently
  const conversationsRef = useRef<SMSConversation[]>([]);
  const activeConversationRef = useRef<SMSConversation | null>(null);
  
  // Update refs when state changes
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

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
        // Only show error if it's not a CORS issue
        if (!error.message?.includes('CORS') && !error.message?.includes('Failed to fetch')) {
          toast.error('Failed to load conversations');
        }
        return;
      }

      setConversations(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      // Only show error if it's not a CORS issue
      if (!error?.message?.includes('CORS') && !error?.message?.includes('Failed to fetch')) {
        toast.error('Failed to load conversations');
      }
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
        // Only show error if it's not a CORS issue
        if (!error.message?.includes('CORS') && !error.message?.includes('Failed to fetch')) {
          toast.error('Failed to load messages');
        }
        return;
      }

      setMessages(data || []);
      
      // Track message IDs to prevent duplicate notifications
      if (data) {
        data.forEach(msg => lastMessageIds.current.add(msg.id));
      }
    } catch (error: any) {
      console.error('Error:', error);
      // Only show error if it's not a CORS issue
      if (!error?.message?.includes('CORS') && !error?.message?.includes('Failed to fetch')) {
        toast.error('Failed to load messages');
      }
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

      // Call the send-sms edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: conversation.client_phone,
          message: content,
          userId: user?.id,
          metadata: {
            clientId: conversation.client_id,
            clientName: conversation.client?.name,
            source: 'sms_conversations'
          }
        }
      });

      if (error) throw error;

      // Create message record - it will trigger realtime update
      const { error: messageError } = await supabase
        .from('sms_messages')
        .insert({
          conversation_id: conversationId,
          direction: 'outbound',
          from_number: phoneData.phone_number,
          to_number: conversation.client_phone,
          content: content,
          status: 'sent',
          external_id: data?.messageId
        });

      if (messageError) throw messageError;

      toast.success('Message sent successfully');
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Don't show error if message was actually sent (409 conflicts are ok)
      if (!error?.message?.includes('409') && !error?.message?.includes('conflict')) {
        toast.error('Failed to send message');
      }
    } finally {
      setIsSending(false);
    }
  }, [user?.id, conversations]);
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
  // Enhanced realtime subscriptions with smart notifications
  useEffect(() => {
    if (!user?.id) return;

    // Clean up previous channel
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    console.log('Setting up SMS realtime subscriptions...');

    // Create a single channel for all SMS updates
    const channel = supabase
      .channel(`sms-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'sms_conversations',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔄 Conversation update:', payload);
          
          // Only refresh conversations, no toasts for conversation updates
          await fetchConversations();
          
          // If this is our active conversation, refresh messages too
          if (activeConversationRef.current?.id === payload.new?.id) {
            await fetchMessages(activeConversationRef.current.id);
          }
        }
      )
      .subscribe((status, error) => {
        console.log('📡 Realtime subscription status:', status);
        if (error) {
          console.error('Realtime subscription error:', error);
          // Don't show error toast for subscription issues
          return;
        }
        if (status === 'SUBSCRIBED' && !connectionToastShown.current) {
          toast.success('Real-time SMS updates active', { duration: 2000 });
          connectionToastShown.current = true;
        }
      });

    setRealtimeChannel(channel);

    return () => {
      console.log('Cleaning up SMS realtime subscriptions');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchConversations, fetchMessages]); // Add back fetchConversations and fetchMessages

  // Handle message updates when active conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
      markAsRead(activeConversation.id);
      
      // Set up polling for messages as a fallback
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id, fetchMessages, markAsRead]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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