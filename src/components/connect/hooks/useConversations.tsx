
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface MessageConversation {
  id: string;
  client_id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  last_message_at: string;
  unread_count: number;
  type: 'sms' | 'email' | 'call';
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    // Mock data for now
    const mockConversations: MessageConversation[] = [];
    setConversations(mockConversations);
    setIsLoading(false);
  };

  const archiveConversation = async (conversationId: string) => {
    console.log('Archiving conversation:', conversationId);
  };

  const unarchiveConversation = async (conversationId: string) => {
    console.log('Unarchiving conversation:', conversationId);
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    isLoading,
    fetchConversations,
    archiveConversation,
    unarchiveConversation
  };
};
