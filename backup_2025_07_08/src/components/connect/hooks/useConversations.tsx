
import { useMessageContext } from "@/contexts/MessageContext";
import { useState } from "react";

export const useConversations = () => {
  const { 
    conversations, 
    refreshConversations, 
    isLoading,
    openMessageDialog 
  } = useMessageContext();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Transform the conversations to match the expected format for connect center
  const transformedConversations = conversations.map(conv => {
    console.log('Transforming conversation:', conv.id, 'with messages:', conv.messages.length);
    
    return {
      id: conv.id,
      client: conv.client,
      lastMessage: conv.lastMessage || '',
      lastMessageTime: conv.lastMessageTime || '',
      unread: 0,
      messages: conv.messages.map(msg => {
        console.log('Transforming message:', msg.id, 'direction:', msg.direction, 'sender:', msg.sender);
        
        // Determine if message is from client based on direction and sender
        const isFromClient = msg.direction === 'inbound' || 
                            (msg.sender && msg.sender !== 'System' && msg.sender !== 'You' && msg.sender.includes('+'));
        
        const senderName = isFromClient ? conv.client.name : 
                          msg.sender === 'System' ? 'You' : 
                          msg.sender || 'You';
        
        return {
          id: msg.id,
          text: msg.body,
          sender: senderName,
          timestamp: new Date(msg.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }),
          isClient: isFromClient
        };
      })
    };
  });

  console.log('Transformed conversations:', transformedConversations);

  const handleConversationClick = (conversationId: string) => {
    console.log('Conversation clicked:', conversationId);
    setActiveConversationId(conversationId);
    const conversation = transformedConversations.find(c => c.id === conversationId);
    if (conversation) {
      console.log('Opening dialog for client:', conversation.client);
      openMessageDialog(conversation.client);
    } else {
      console.error('Conversation not found:', conversationId);
    }
  };

  return {
    conversations: transformedConversations,
    refreshConversations,
    isLoading,
    activeConversation: activeConversationId,
    handleConversationClick
  };
};
