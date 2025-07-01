import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalRealtime } from "@/contexts/GlobalRealtimeProvider";

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Message {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  recipient?: string;
}

interface Conversation {
  id: string;
  client: Client;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  refreshConversations: () => Promise<void>;
  openMessageDialog: (client: Client, jobId?: string) => void;
  isLoading: boolean;
  activeConversation: Conversation | null;
  sendMessage: (message: string) => Promise<void>;
  isSending: boolean;
  restoreArchivedConversation: (clientId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within MessageProvider");
  }
  return context;
};

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { refreshMessages } = useGlobalRealtime();

  const fetchConversations = useCallback(async () => {
    try {
      console.log('🔄 Fetching conversations from database...');
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          last_message_at,
          created_at,
          clients:client_id (
            id,
            name,
            phone,
            email
          ),
          messages (
            id,
            body,
            direction,
            created_at,
            sender,
            recipient,
            status
          )
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching conversations:', error);
        
        // Try to fetch some test conversations or create sample data
        console.log('🔄 Trying to fetch clients for sample conversations...');
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name, phone, email')
          .limit(5);

        if (!clientsError && clientsData && clientsData.length > 0) {
          console.log('📱 Found clients, creating sample conversations:', clientsData);
          const sampleConversations: Conversation[] = clientsData.map(client => ({
            id: `sample-${client.id}`,
            client: {
              id: client.id,
              name: client.name,
              phone: client.phone || '',
              email: client.email || ''
            },
            messages: [],
            lastMessage: 'No messages yet - click to start conversation',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0
          }));
          
          setConversations(sampleConversations);
          console.log('✅ Created sample conversations:', sampleConversations.length);
        } else {
          console.log('ℹ️ No conversations or clients found');
          setConversations([]);
        }
        return;
      }

      console.log('📨 Raw conversations data from DB:', conversationsData?.length || 0, 'conversations');

      const formattedConversations: Conversation[] = (conversationsData || []).map(conv => {
        const sortedMessages = (conv.messages || []).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const lastMessage = sortedMessages[sortedMessages.length - 1];
        const unreadCount = sortedMessages.filter(msg => 
          msg.direction === 'inbound' && msg.status !== 'read'
        ).length;
        
        console.log(`📨 Processing conversation ${conv.id}: ${sortedMessages.length} messages, client: ${conv.clients?.name}, unread: ${unreadCount}`);
        
        return {
          id: conv.id,
          client: {
            id: conv.clients?.id || '',
            name: conv.clients?.name || 'Unknown Client',
            phone: conv.clients?.phone || '',
            email: conv.clients?.email || ''
          },
          messages: sortedMessages.map(msg => ({
            ...msg,
            direction: msg.direction as 'inbound' | 'outbound'
          })),
          lastMessage: lastMessage?.body || 'No messages',
          lastMessageTime: lastMessage?.created_at || conv.created_at,
          unreadCount
        };
      });

      console.log('✅ Formatted conversations:', formattedConversations.length, 'total');
      setConversations(formattedConversations);
    } catch (error) {
      console.error('💥 Error in fetchConversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed activeConversation?.id dependency

  const refreshConversations = async () => {
    console.log('🔄 Refreshing conversations...');
    await fetchConversations();
  };

  const openMessageDialog = (client: Client, jobId?: string) => {
    console.log('💬 Setting active conversation for client:', client);
    
    const conversation = conversations.find(conv => conv.client.id === client.id);
    setActiveConversation(conversation || {
      id: `temp-${client.id}`,
      client,
      messages: [],
      lastMessage: 'No messages yet',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    });
  };

  const restoreArchivedConversation = async (clientId: string) => {
    console.log('🔄 Restoring archived conversation for client:', clientId);
    
    // Find the conversation for this client
    const conversation = conversations.find(conv => conv.client.id === clientId);
    if (conversation) {
      setActiveConversation(conversation);
      console.log('✅ Restored conversation:', conversation.id);
    } else {
      // If conversation doesn't exist in current list, try to fetch it
      await refreshConversations();
      const restoredConversation = conversations.find(conv => conv.client.id === clientId);
      if (restoredConversation) {
        setActiveConversation(restoredConversation);
      }
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeConversation || !message.trim()) return;
    
    setIsSending(true);
    try {
      console.log('📤 Sending message:', message, 'to client:', activeConversation.client.name);
      
      // Refresh conversations after a short delay to allow DB to update
      setTimeout(() => {
        refreshConversations();
      }, 1000);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Set up real-time subscription for messages and conversations
  useEffect(() => {
    console.log('🔄 Initial fetch of conversations...');
    fetchConversations();

    // Create a debounced refresh function
    let refreshTimeout: NodeJS.Timeout | null = null;
    const debouncedRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(() => {
        fetchConversations();
      }, 500); // Increased delay to prevent too frequent updates
    };

    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel('conversations-changes-context')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('🔔 Conversation change detected in MessageContext:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversation channel status:', status);
      });

    // Subscribe to message changes
    const messageChannel = supabase
      .channel('messages-changes-context')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Message change detected in MessageContext:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('📡 Message channel status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up realtime subscriptions...');
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [fetchConversations]);

  // Also listen to global realtime provider
  useEffect(() => {
    if (refreshMessages) {
      console.log('🔔 Global realtime message update detected');
      fetchConversations();
    }
  }, [refreshMessages, fetchConversations]);

  // Update active conversation when conversations list changes
  useEffect(() => {
    if (activeConversation && conversations.length > 0) {
      const updatedActiveConversation = conversations.find(
        conv => conv.id === activeConversation.id
      );
      if (updatedActiveConversation) {
        setActiveConversation(updatedActiveConversation);
      }
    }
  }, [conversations]); // Only depend on conversations, not activeConversation

  return (
    <MessageContext.Provider value={{
      conversations,
      refreshConversations,
      openMessageDialog,
      isLoading,
      activeConversation,
      sendMessage,
      isSending,
      restoreArchivedConversation
    }}>
      {children}
    </MessageContext.Provider>
  );
};
