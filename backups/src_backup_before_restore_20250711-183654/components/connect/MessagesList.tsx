
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Conversation {
  id: string;
  client_id: string;
  status: string;
  last_message_at: string;
  created_at: string;
  clients: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  messages: Array<{
    id: string;
    body: string;
    direction: "inbound" | "outbound";
    created_at: string;
    read_at?: string;
  }>;
  unread_count: number;
}

interface MessagesListProps {
  searchResults: any[];
}

export const MessagesList = ({ searchResults }: MessagesListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);
  const { openMessageDialog } = useMessageContext();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadConversations();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          clients:client_id(id, name, phone, email),
          messages(id, body, direction, created_at, read_at)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Conversation interface
      const conversationsWithUnread = (data || []).map(conv => ({
        ...conv,
        messages: (conv.messages || []).map((msg: any) => ({
          ...msg,
          direction: msg.direction as "inbound" | "outbound"
        })),
        unread_count: (conv.messages || []).filter((msg: any) => !msg.read_at && msg.direction === 'inbound').length
      }));

      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeCall = async (phoneNumber: string, clientId?: string) => {
    setCallingNumber(phoneNumber);
    
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: phoneNumber,
          clientId
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to initiate call');
      }

      toast.success('Call initiated successfully');
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call: ' + error.message);
    } finally {
      setCallingNumber(null);
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    openMessageDialog({
      id: conversation.clients.id,
      name: conversation.clients.name,
      phone: conversation.clients.phone
    });
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const getLastMessage = (messages: any[]) => {
    if (messages.length === 0) return "No messages yet";
    const lastMessage = messages[messages.length - 1];
    const maxLength = isMobile ? 35 : 50;
    return lastMessage.body.length > maxLength 
      ? lastMessage.body.substring(0, maxLength) + "..."
      : lastMessage.body;
  };

  const getLastMessageTime = (lastMessageAt: string) => {
    const date = new Date(lastMessageAt);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className={`${isMobile ? 'p-4' : 'p-8'} text-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
            <MessageSquare className="h-5 w-5" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-900 mb-2`}>
              No conversations yet
            </h3>
            <p className={`${isMobile ? 'text-sm' : ''} text-gray-500 mb-4`}>
              Start messaging clients to see conversations here.
            </p>
            <Button 
              onClick={() => openMessageDialog({ id: "", name: "New Client", phone: "" })}
              className={`bg-fixlyfy hover:bg-fixlyfy/90 ${isMobile ? 'text-sm min-h-[44px]' : ''}`}
            >
              Start New Conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
            <MessageSquare className="h-5 w-5" />
            Recent Conversations ({conversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors`}
                onClick={() => handleOpenConversation(conversation)}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${isMobile ? 'text-sm' : ''} truncate`}>
                        {conversation.clients.name}
                      </span>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-fixlyfy text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 truncate`}>
                      {formatPhoneNumber(conversation.clients.phone)}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-1 truncate`}>
                      {getLastMessage(conversation.messages)}
                    </div>
                  </div>
                </div>
                
                <div className={`text-right flex-shrink-0 ${isMobile ? 'ml-2' : ''}`}>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <Clock className="h-3 w-3" />
                    {getLastMessageTime(conversation.last_message_at)}
                  </div>
                  <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        makeCall(conversation.clients.phone, conversation.clients.id);
                      }}
                      disabled={callingNumber === conversation.clients.phone}
                      className={`gap-1 ${isMobile ? 'min-h-[36px] text-xs px-2' : ''}`}
                    >
                      {callingNumber === conversation.clients.phone ? (
                        <>
                          <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full" />
                          {!isMobile && "Calling..."}
                        </>
                      ) : (
                        <>
                          <Phone className="h-3 w-3" />
                          {!isMobile && "Call"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
