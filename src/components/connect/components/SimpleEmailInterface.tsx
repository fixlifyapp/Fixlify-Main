
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Send, Inbox, Sent } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmailInputPanel } from "./EmailInputPanel";

interface EmailConversation {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  last_message_at: string;
  unread_count: number;
  messages: EmailMessage[];
}

interface EmailMessage {
  id: string;
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: string;
  created_at: string;
  from_address: string;
  to_address: string;
}

export const SimpleEmailInterface = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<EmailConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmailConversations();
  }, [user]);

  const fetchEmailConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get email communications
      const { data: emails, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'email')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by client and get client data
      const conversationMap = new Map<string, EmailConversation>();
      
      for (const email of emails || []) {
        if (!email.client_id) continue;
        
        if (!conversationMap.has(email.client_id)) {
          // Get client data
          const { data: client } = await supabase
            .from('clients')
            .select('name, email')
            .eq('id', email.client_id)
            .single();

          conversationMap.set(email.client_id, {
            id: email.client_id,
            client_id: email.client_id,
            client_name: client?.name || 'Unknown Client',
            client_email: client?.email || '',
            last_message_at: email.created_at,
            unread_count: 0,
            messages: []
          });
        }

        const conversation = conversationMap.get(email.client_id)!;
        conversation.messages.push({
          id: email.id,
          subject: email.subject || 'No Subject',
          content: email.content,
          direction: email.direction as 'inbound' | 'outbound',
          status: email.status,
          created_at: email.created_at,
          from_address: email.from_address,
          to_address: email.to_address
        });

        // Update last message time
        if (new Date(email.created_at) > new Date(conversation.last_message_at)) {
          conversation.last_message_at = email.created_at;
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching email conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSent = () => {
    fetchEmailConversations();
    // Refresh the selected conversation
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.client_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading email conversations...</div>;
  }

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'inbox' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('inbox')}
              className="flex-1"
            >
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
            </Button>
            <Button
              variant={activeTab === 'sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('sent')}
              className="flex-1"
            >
              <Sent className="h-4 w-4 mr-2" />
              Sent
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                selectedConversation?.id === conversation.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium truncate">{conversation.client_name}</h4>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="ml-2">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mb-1">
                {conversation.client_email}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {conversation.messages.length} messages
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No email conversations found
            </div>
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold">{selectedConversation.client_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedConversation.client_email}</p>
              </div>

              {selectedConversation.messages.map((message) => (
                <Card key={message.id} className={`${
                  message.direction === 'outbound' ? 'ml-8' : 'mr-8'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">{message.subject}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {message.direction}
                        </Badge>
                        <Badge variant={message.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      From: {message.from_address} → To: {message.to_address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Email Input */}
            <div className="border-t p-4">
              <EmailInputPanel
                clientEmail={selectedConversation.client_email}
                clientName={selectedConversation.client_name}
                onEmailSent={handleEmailSent}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
