
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConnectMessageDialog } from "./ConnectMessageDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  type: 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed';
}

interface ConversationThreadProps {
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  onArchive?: () => void;
}

export const ConversationThread = ({ client, onArchive }: ConversationThreadProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [client.id]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data: logs, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedMessages: Message[] = logs?.map(log => ({
        id: log.id,
        content: log.content || log.subject || 'No content',
        timestamp: log.created_at,
        type: log.communication_type as 'sms' | 'email',
        direction: 'outbound', // Assuming all logged messages are outbound for now
        status: log.status as 'sent' | 'delivered' | 'failed'
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading conversation...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation with {client.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMessageDialog(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </Button>
              {onArchive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages in this conversation
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
                        {message.direction === 'outbound' ? 'You' : client.name}
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

      <ConnectMessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        client={client}
      />
    </>
  );
};
