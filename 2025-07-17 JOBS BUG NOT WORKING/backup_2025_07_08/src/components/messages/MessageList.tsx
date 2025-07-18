
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  clientName: string;
}

export const MessageList = ({ messages, isLoading, clientName }: MessageListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fixlyfy" />
      </div>
    );
  }

  return (
    <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
      {messages.map((msg, index) => (
        <div 
          key={msg.id || index} 
          className={`flex flex-col ${msg.isClient ? 'self-end items-end ml-auto' : ''}`}
        >
          <div 
            className={`${
              msg.isClient 
                ? 'bg-fixlyfy text-white' 
                : 'bg-muted'
            } p-3 rounded-lg max-w-[80%] ${msg.isClient ? 'ml-auto' : ''}`}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
          <span className="text-xs text-fixlyfy-text-secondary mt-1">
            {msg.sender}, {msg.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
};
