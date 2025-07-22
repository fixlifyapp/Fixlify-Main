import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  created_at: string;
  updated_at: string;
}

interface MessageConversation {
  id: string;
  user_id: string;
  client_id?: string;
  client_email?: string;
  client_phone?: string;
  type: 'email' | 'sms';
  status: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface MessageContextType {
  conversations: MessageConversation[];
  emailMessages: EmailMessage[];
  isLoading: boolean;
  isSending: boolean;
  openMessageDialog: () => void;
  fetchConversations: () => Promise<void>;
  refreshMessages: () => void;
  sendEmail: (to: string, subject: string, content: string, clientId?: string) => Promise<boolean>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within MessageProvider');
  }
  return context;
};

export const useMessage = useMessageContext;

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch email communication logs
      const { data: emailLogs, error: emailError } = await supabase
        .from('communication_logs')
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .eq('user_id', user.id)
        .eq('communication_type', 'email')
        .order('created_at', { ascending: false })
        .limit(50);

      if (emailError) throw emailError;

      // Transform email logs to conversations
      const emailConversations: MessageConversation[] = [];
      const emailsByRecipient = new Map();

      emailLogs?.forEach(log => {
        const key = log.to_address || log.recipient;
        if (!emailsByRecipient.has(key)) {
          emailsByRecipient.set(key, {
            id: `email-${key}`,
            user_id: user.id,
            client_id: log.client_id,
            client_email: key,
            type: 'email' as const,
            status: 'active',
            last_message_at: log.created_at,
            last_message_preview: log.subject || log.content?.substring(0, 100),
            unread_count: 0,
            created_at: log.created_at,
            updated_at: log.created_at,
            client: log.client
          });
        }
      });

      emailConversations.push(...emailsByRecipient.values());
      
      setConversations(emailConversations);
      setEmailMessages(emailLogs?.map(log => ({
        id: log.id,
        from: log.from_address,
        to: log.to_address || log.recipient,
        subject: log.subject || 'No Subject',
        content: log.content || '',
        status: log.status as any,
        created_at: log.created_at,
        updated_at: log.created_at
      })) || []);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const sendEmail = useCallback(async (to: string, subject: string, content: string, clientId?: string): Promise<boolean> => {
    if (!user?.id || !to || !subject || !content) return false;
    
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          content,
          userId: user.id,
          clientId,
          metadata: {
            source: 'message_context',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast.success('Email sent successfully');
      await fetchConversations();
      return true;
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [user?.id, fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    // Implementation for marking conversations as read
    console.log('Marking conversation as read:', conversationId);
  }, []);

  const openMessageDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const refreshMessages = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set up realtime subscriptions for communication logs
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to communication logs changes
    const channel = supabase
      .channel('communication-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Communication log updated:', payload);
          fetchConversations();
        }
      )
      .subscribe();

    // Initial fetch
    fetchConversations();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchConversations]);

  const value: MessageContextType = {
    conversations,
    emailMessages,
    isLoading,
    isSending,
    openMessageDialog,
    fetchConversations,
    refreshMessages,
    sendEmail,
    markAsRead
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};