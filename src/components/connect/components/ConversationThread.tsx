
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  type: string;
  direction: string;
  content: string;
  status: string;
  created_at: string;
  from_address: string;
  to_address: string;
}

interface ConversationThreadProps {
  messages: Message[];
  clientName: string;
  client?: any;
  onArchive?: () => Promise<void>;
}

export const ConversationThread = ({ messages, clientName }: ConversationThreadProps) => {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '💬';
      case 'call': return '📞';
      default: return '💬';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No messages in this conversation yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Conversation with {clientName}</h3>
      
      {messages.map((message) => (
        <Card key={message.id} className={`${
          message.direction === 'outbound' ? 'ml-8' : 'mr-8'
        }`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {getMessageIcon(message.type)}
                </span>
                <Badge variant={getStatusColor(message.status)} className="text-xs">
                  {message.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {message.direction}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm mb-2">
              <div className="text-muted-foreground">
                From: {message.from_address} → To: {message.to_address}
              </div>
            </div>
            
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
