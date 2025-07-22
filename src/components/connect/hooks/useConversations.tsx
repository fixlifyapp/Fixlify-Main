
import { useState, useEffect } from "react";
import { useMessageContext } from "@/contexts/MessageContext";

export const useConversations = () => {
  const { conversations } = useMessageContext();
  const [activeConversations, setActiveConversations] = useState<any[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<any[]>([]);

  useEffect(() => {
    // Filter conversations into active and archived
    const active = conversations.filter(conv => !conv.archived);
    const archived = conversations.filter(conv => conv.archived);
    
    setActiveConversations(active);
    setArchivedConversations(archived);
  }, [conversations]);

  const getConversationPreview = (conversation: any) => {
    if (!conversation.last_message_at) return null;
    
    return {
      lastMessage: conversation.last_message || 'No messages',
      lastMessageTime: conversation.last_message_at,
      unreadCount: 0 // This would come from your message counting logic
    };
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      // Archive conversation logic would go here
      console.log('Archive conversation:', conversationId);
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  };

  const restoreConversation = async (conversationId: string) => {
    try {
      // Restore conversation logic would go here
      console.log('Restore conversation:', conversationId);
    } catch (error) {
      console.error('Error restoring conversation:', error);
      throw error;
    }
  };

  return {
    activeConversations,
    archivedConversations,
    getConversationPreview,
    archiveConversation,
    restoreConversation
  };
};
