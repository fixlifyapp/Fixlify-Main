import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender: string;
  recipient?: string;
}

interface UnifiedMessageListProps {
  messages: Message[];
  isLoading: boolean;
  clientName: string;
  clientInfo?: any;
}

export const UnifiedMessageList = ({ messages, isLoading, clientName }: UnifiedMessageListProps) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No messages yet with {clientName}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.direction === 'outbound'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <p className="text-sm">{message.body}</p>
            <p className="text-xs opacity-75 mt-1">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};