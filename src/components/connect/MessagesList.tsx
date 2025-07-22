
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Trash2, Archive, Phone, Mail } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'sms' | 'email';
  status: 'sent' | 'delivered' | 'failed';
  client_name?: string;
  phone_number?: string;
  email?: string;
}

export const MessagesList = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<'all' | 'sms' | 'email'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { conversations } = useMessageContext();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [searchQuery, selectedType, messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      // Fetch communication logs
      const { data: logs, error } = await supabase
        .from('communication_logs')
        .select(`
          *,
          clients(name, phone, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedMessages: Message[] = logs?.map(log => ({
        id: log.id,
        sender: log.clients?.name || 'Unknown',
        content: log.content || log.subject || 'No content',
        timestamp: log.created_at,
        type: log.communication_type as 'sms' | 'email',
        status: log.status as 'sent' | 'delivered' | 'failed',
        client_name: log.clients?.name,
        phone_number: log.clients?.phone,
        email: log.clients?.email
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    if (selectedType !== 'all') {
      filtered = filtered.filter(msg => msg.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('communication_logs')
        .update({ status: 'archived' })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message archived');
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Failed to archive message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'sms' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                All
              </Button>
              <Button
                variant={selectedType === 'sms' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('sms')}
              >
                SMS
              </Button>
              <Button
                variant={selectedType === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('email')}
              >
                Email
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages found
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(message.type)}
                        <span className="font-medium">{message.sender}</span>
                        <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                          {message.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{message.content}</p>
                      {message.phone_number && (
                        <p className="text-sm text-gray-500">Phone: {message.phone_number}</p>
                      )}
                      {message.email && (
                        <p className="text-sm text-gray-500">Email: {message.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveMessage(message.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
