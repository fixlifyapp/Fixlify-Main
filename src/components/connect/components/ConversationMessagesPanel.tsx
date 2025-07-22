
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  type: 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed';
}

interface ConversationMessagesPanelProps {
  clientName: string;
  messages: Message[];
}

export const ConversationMessagesPanel = ({ clientName, messages }: ConversationMessagesPanelProps) => {
  const getTypeIcon = (type: string) => {
    return type === 'sms' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages with {clientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages found
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.direction === 'outbound' 
                    ? 'bg-blue-50 border-l-4 border-blue-500 ml-8' 
                    : 'bg-gray-50 border-l-4 border-gray-300 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(message.type)}
                    <span className="text-sm font-medium">
                      {message.direction === 'outbound' ? 'You' : clientName}
                    </span>
                    <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                      {message.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
