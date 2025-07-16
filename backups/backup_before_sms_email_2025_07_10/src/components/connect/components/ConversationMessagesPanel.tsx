
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
}

interface ConversationMessagesPanelProps {
  messages: Message[];
  clientName: string;
}

export const ConversationMessagesPanel = ({ messages, clientName }: ConversationMessagesPanelProps) => {
  console.log('ConversationMessagesPanel messages:', messages);
  
  const formattedMessages = messages.map(msg => {
    console.log('Formatting message:', msg);
    return {
      id: msg.id,
      body: msg.text,
      direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
      created_at: msg.timestamp,
      sender: msg.sender
    };
  });

  console.log('Formatted messages for UnifiedMessageList:', formattedMessages);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-fixlyfy-bg-interface/50 to-white">
      <div className="p-4">
        <UnifiedMessageList 
          messages={formattedMessages}
          isLoading={false}
          clientName={clientName}
        />
      </div>
    </div>
  );
};
