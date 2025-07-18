import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2, Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { ConnectMessageDialog } from "@/components/connect/components/ConnectMessageDialog";
import { useAI } from "@/hooks/use-ai";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
  clientId?: string;
}

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

const MessagesPage = () => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: "You are an assistant helping with client messaging for a field service company. Keep responses professional, friendly, and concise."
  });

  // Load real conversations from database
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConv(true);
        
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select(`
            *,
            clients:client_id(id, name, phone),
            messages(*)
          `)
          .eq('status', 'active')
          .order('last_message_at', { ascending: false });

        if (error) throw error;

        const formattedConversations: Conversation[] = conversationsData?.map(conv => ({
          id: conv.id,
          client: {
            id: conv.clients?.id || '',
            name: conv.clients?.name || 'Unknown Client',
            phone: conv.clients?.phone
          },
          lastMessage: conv.messages?.[conv.messages.length - 1]?.body || 'No messages yet',
          lastMessageTime: new Date(conv.last_message_at || conv.created_at).toLocaleString(),
          unread: 0, // TODO: Implement unread count logic
          messages: conv.messages?.map((msg: any) => ({
            id: msg.id,
            text: msg.body,
            sender: msg.direction === 'outbound' ? 'You' : conv.clients?.name || 'Client',
            timestamp: new Date(msg.created_at).toLocaleString(),
            isClient: msg.direction === 'inbound',
            clientId: conv.clients?.id
          })) || []
        })) || [];

        setConversations(formattedConversations);
        
        // Set the first conversation as active by default
        if (formattedConversations.length > 0) {
          setActiveConversation(formattedConversations[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoadingConv(false);
      }
    };

    loadConversations();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;
    
    setIsLoading(true);
    
    try {
      // Create a new message object
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        text: newMessage,
        sender: "You",
        timestamp: new Date().toLocaleString(),
        isClient: false
      };
      
      // Update the conversations state
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === activeConversation
            ? {
                ...conv,
                messages: [...conv.messages, newMsg],
                lastMessage: newMessage,
                lastMessageTime: new Date().toLocaleString()
              }
            : conv
        )
      );
      
      // Clear the input field
      setNewMessage("");
      
      // Send SMS via Amazon SNS edge function
      if (conversation.client.phone) {
        const { data, error } = await supabase.functions.invoke('amazon-sns-sms', {
          body: {
            to: conversation.client.phone,
            body: newMessage,
            client_id: conversation.client.id
          }
        });
        
        if (error) {
          console.error("Error sending SMS:", error);
          toast.error("Failed to send SMS. Please try again.");
        } else if (data.success) {
          toast.success("Message sent successfully");
          
          // Store message in database
          await supabase
            .from('messages')
            .insert({
              conversation_id: activeConversation,
              body: newMessage,
              direction: 'outbound',
              sender: 'You',
              recipient: conversation.client.phone,
              status: 'delivered',
              message_sid: data.message_id
            });
        } else {
          toast.error(`Failed to send SMS: ${data.error || 'Unknown error'}`);
        }
      } else {
        toast.warning("No phone number available for this client");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessageClick = async () => {
    try {
      // Load clients for new conversation
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .limit(1);
      
      if (error) throw error;
      
      if (clients && clients.length > 0) {
        setSelectedClient(clients[0]);
        setIsMessageDialogOpen(true);
      } else {
        toast.error("No clients available");
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    }
  };
  
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
  };
  
  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark conversation as read
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread: 0 }
          : conv
      )
    );
  };
  
  const handleSuggestResponse = async () => {
    if (isAILoading || !activeConversation) return;
    
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation || conversation.messages.length === 0) return;
    
    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      
      // Only suggest responses to client messages
      if (!lastMessage.isClient) {
        toast.info("Waiting for client response before suggesting a reply.");
        return;
      }
      
      const prompt = `Generate a professional, concise response to this customer message: "${lastMessage.text}" 
                     The customer name is ${conversation.client.name}.`;
      
      const suggestedResponse = await generateText(prompt);
      
      if (suggestedResponse) {
        setNewMessage(suggestedResponse);
        toast.success("AI suggestion added to message field", {
          description: "You can edit before sending."
        });
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response suggestion");
    }
  };
  
  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-fixlyfy-text-secondary">
            Communicate with clients using Amazon SNS messaging.
          </p>
        </div>
        <Button 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          onClick={handleNewMessageClick}
        >
          <Plus size={18} className="mr-2" /> New Message
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="fixlyfy-card p-0">
          <div className="p-4 border-b border-fixlyfy-border">
            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="h-[600px] overflow-y-auto">
            {isLoadingConv ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-fixlyfy-text-secondary">Loading conversations...</p>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    "p-4 border-b border-fixlyfy-border cursor-pointer hover:bg-fixlyfy-bg-hover",
                    activeConversation === conversation.id && "bg-fixlyfy-bg-hover"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{conversation.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.client.name}</h3>
                        <span className="text-xs text-fixlyfy-text-secondary">
                          {conversation.lastMessageTime.split(",")[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-fixlyfy-text-secondary truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <Badge className="bg-fixlyfy">{conversation.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-fixlyfy-text-secondary">
                <MessageSquare className="h-12 w-12 mb-2" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Message Thread */}
        <div className="fixlyfy-card p-0 md:col-span-2 flex flex-col h-[600px]">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-fixlyfy-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{activeConv.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeConv.client.name}</h3>
                      <p className="text-xs text-fixlyfy-text-secondary">
                        {activeConv.client.phone || "No phone number"}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSuggestResponse}
                    disabled={isAILoading}
                  >
                    {isAILoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Suggest Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {activeConv.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex",
                      message.isClient ? "justify-start" : "justify-end"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg",
                        message.isClient 
                          ? "bg-muted text-foreground" 
                          : "bg-fixlyfy text-white"
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs block mt-1 opacity-70">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-fixlyfy-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !newMessage.trim()}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" variant="white" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="h-16 w-16 mb-4 text-fixlyfy-text-muted" />
              <h3 className="text-xl font-medium mb-2">Amazon SNS Messaging</h3>
              <p className="text-center text-fixlyfy-text-secondary max-w-sm mb-4">
                Select a conversation or start a new one to begin messaging via Amazon SNS.
              </p>
              <Button 
                variant="outline"
                onClick={handleNewMessageClick}
              >
                <Plus size={18} className="mr-2" /> Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <ConnectMessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => setIsMessageDialogOpen(false)}
        conversation={selectedClient ? {
          id: '',
          client: selectedClient,
          messages: []
        } : null}
      />
    </PageLayout>
  );
};

export default MessagesPage;
