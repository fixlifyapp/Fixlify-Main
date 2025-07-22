
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MessageSquare, Mail, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageWithClient {
  id: string;
  type: string;
  direction: string;
  content: string;
  status: string;
  created_at: string;
  client_id: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
}

export const MessagesList = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;

      // Then get client data for each message
      const messagesWithClients: MessageWithClient[] = [];
      
      for (const message of messagesData || []) {
        let clientData = null;
        
        if (message.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('name, phone, email')
            .eq('id', message.client_id)
            .single();
          
          clientData = client;
        }

        messagesWithClients.push({
          id: message.id,
          type: message.type,
          direction: message.direction,
          content: message.content,
          status: message.status,
          created_at: message.created_at,
          client_id: message.client_id,
          client_name: clientData?.name,
          client_phone: clientData?.phone,
          client_email: clientData?.email
        });
      }

      setMessages(messagesWithClients);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (message.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (message.client_phone?.includes(searchTerm));
    const matchesType = typeFilter === "all" || message.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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

  if (isLoading) {
    return <div className="p-6">Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Types</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="call">Call</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getMessageIcon(message.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.client_name || 'Unknown Client'}
                      </span>
                      <Badge variant={getStatusColor(message.status)} className="text-xs">
                        {message.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {message.direction}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {message.client_phone || message.client_email}
                    </p>
                    <p className="text-sm line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground ml-4">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm || typeFilter !== "all" 
            ? "No messages found matching your criteria"
            : "No messages yet"}
        </div>
      )}
    </div>
  );
};
