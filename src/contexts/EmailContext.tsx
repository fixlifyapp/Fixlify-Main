import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface EmailConversation {
  id: string;
  user_id: string;
  client_id: string | null;
  email_address: string;
  client_name: string | null;
  subject: string;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  is_archived: boolean;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  direction: 'inbound' | 'outbound';
  from_email: string;
  to_email: string;
  subject: string | null;
  body: string;
  html_body: string | null;
  attachments: any;
  is_read: boolean;
  email_id: string | null;
  thread_id: string | null;
  status: string;
  metadata: any;
  created_at: string;
}

interface EmailContextType {
  conversations: EmailConversation[];
  messages: EmailMessage[];
  selectedConversation: EmailConversation | null;
  isLoading: boolean;
  selectConversation: (conversation: EmailConversation) => void;
  sendEmail: (to: string, subject: string, body: string, clientId?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within EmailProvider');
  }
  return context;
};

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<EmailConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('email_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching email conversations:', error);
      toast.error('Failed to load email conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        direction: msg.direction as 'inbound' | 'outbound',
        attachments: Array.isArray(msg.attachments) ? msg.attachments : []
      })));
    } catch (error) {
      console.error('Error fetching email messages:', error);
      toast.error('Failed to load email messages');
    }
  };
  // Select conversation
  const selectConversation = async (conversation: EmailConversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    
    // Mark messages as read
    if (conversation.unread_count > 0) {
      const { error } = await supabase
        .from('email_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .eq('direction', 'inbound')
        .eq('is_read', false);

      if (!error) {
        // Update local state
        setConversations(prev => 
          prev.map(c => 
            c.id === conversation.id 
              ? { ...c, unread_count: 0 }
              : c
          )
        );
      }
    }
  };

  // Send email
  const sendEmail = async (to: string, subject: string, body: string, clientId?: string) => {
    if (!user?.id) return;

    try {
      // Check if conversation exists
      let conversation = conversations.find(c => c.email_address === to);
      
      if (!conversation) {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('email_conversations')
          .insert({
            user_id: user.id,
            client_id: clientId || null,
            email_address: to,
            client_email: to,
            subject: subject || 'No Subject',
            last_message_at: new Date().toISOString(),
            last_message_preview: body.substring(0, 100),
            unread_count: 0
          })
          .select()
          .single();

        if (convError) throw convError;
        conversation = newConv;
      }

      // Call edge function to send actual email with conversation tracking
      const { error: sendError } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          text: body,
          userId: user.id,
          clientId,
          conversationId: conversation.id
        }
      });

      if (sendError) {
        console.error('Error sending email:', sendError);
        toast.error('Failed to send email');
      } else {
        toast.success('Email sent successfully');
        await fetchConversations();
        // Refresh messages if this conversation is selected
        if (selectedConversation?.id === conversation.id) {
          await fetchMessages(conversation.id);
        }
      }
    } catch (error) {
      console.error('Error in sendEmail:', error);
      toast.error('Failed to send email');
    }
  };

  // Mark as read
  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('email_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
      );
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  // Archive conversation
  const archiveConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('email_conversations')
        .update({ is_archived: true })
        .eq('id', conversationId);

      if (error) throw error;
      
      toast.success('Conversation archived');
      await fetchConversations();
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };
  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('email_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      toast.success('Conversation deleted');
      setSelectedConversation(null);
      await fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  // Refresh conversations
  const refreshConversations = async () => {
    await fetchConversations();
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('email-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_messages',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Refresh conversations to update unread counts
            await fetchConversations();
            
            // If this message is for selected conversation, fetch messages
            if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
              await fetchMessages(selectedConversation.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedConversation?.id]);
  const value = {
    conversations,
    messages,
    selectedConversation,
    isLoading,
    selectConversation,
    sendEmail,
    markAsRead,
    archiveConversation,
    deleteConversation,
    refreshConversations
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};

export { EmailContext };