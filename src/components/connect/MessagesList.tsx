import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Phone, Mail, Calendar, Filter, Archive, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  type: string;
  direction: string;
  content: string;
  status: string;
  created_at: string;
  client_id: string;
  from_address: string;
  to_address: string;
}

interface MessagesListProps {
  clientId: string;
}

export const MessagesList = ({ clientId }: MessagesListProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || !clientId) return;
    
    fetchMessages();
  }, [user, clientId]);

  const fetchMessages = async () => {
    if (!user || !clientId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        type: msg.type,
        direction: msg.direction,
        content: msg.content,
        status: msg.status,
        created_at: msg.created_at,
        client_id: msg.client_id,
        from_address: msg.from_address,
        to_address: msg.to_address
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Messages</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : filteredMessages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div key={message.id} className="border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{message.content}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), "MMM dd, yyyy hh:mm a")}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Type: {message.type}, Direction: {message.direction}, Status: {message.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
