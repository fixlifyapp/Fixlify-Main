import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, Plus, MessageSquare, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationsList } from "./ConversationsList";
import { MessageThread } from "./MessageThread";
import { MessageInput } from "./MessageInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export const SimpleMessagesInterface = () => {
  const { 
    conversations, 
    refreshConversations, 
    isLoading, 
    restoreArchivedConversation 
  } = useMessageContext();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showClientResults, setShowClientResults] = useState(false);
  const [showConversationView, setShowConversationView] = useState(false);
  const isMobile = useIsMobile();

  console.log('SimpleMessagesInterface conversations:', conversations);

  // Update selected conversation when conversations update
  useEffect(() => {
    if (selectedConversation && selectedConversation.id !== selectedConversation.id.startsWith('temp-')) {
      // Find the updated conversation in the new conversations list
      const updatedConversation = conversations.find(conv => conv.id === selectedConversation.id);
      if (updatedConversation) {
        console.log('📱 Updating selected conversation with new messages');
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations]); // This will trigger whenever conversations update

  // Direct real-time subscription for immediate updates
  useEffect(() => {
    console.log('🔔 Setting up direct real-time subscriptions for SimpleMessagesInterface');
    
    // Subscribe to message changes with immediate refresh
    const messageChannel = supabase
      .channel('simple-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Direct message change detected:', payload);
          // Immediate refresh without delay
          refreshConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('🔔 Direct conversation change detected:', payload);
          // Immediate refresh without delay
          refreshConversations();
        }
      )
      .subscribe((status) => {
        console.log('📡 Direct realtime status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Direct realtime subscription active');
        }
      });

    return () => {
      console.log('🔌 Cleaning up direct realtime subscription');
      supabase.removeChannel(messageChannel);
    };
  }, [refreshConversations]);

  // Check URL for specific client and restore if needed
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    const clientName = urlParams.get('clientName');
    const clientPhone = urlParams.get('clientPhone');

    if (clientId && clientName) {
      console.log('🔗 URL contains client info, checking for conversation:', { clientId, clientName, clientPhone });
      
      // Check if conversation exists in current list
      const existingConversation = conversations.find(conv => conv.client.id === clientId);
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        if (isMobile) setShowConversationView(true);
        console.log('✅ Found existing conversation for client:', clientName);
      } else {
        // Try to restore archived conversation or create new one
        console.log('🔄 Attempting to restore conversation for client:', clientName);
        restoreArchivedConversation(clientId).then(() => {
          // After restoration attempt, check again
          const restoredConversation = conversations.find(conv => conv.client.id === clientId);
          if (restoredConversation) {
            setSelectedConversation(restoredConversation);
            if (isMobile) setShowConversationView(true);
            toast.success(`Restored conversation with ${clientName}`);
          } else {
            // Create a new conversation placeholder if none exists
            const newConversation = {
              id: `temp-${clientId}`,
              client: {
                id: clientId,
                name: decodeURIComponent(clientName),
                phone: clientPhone ? decodeURIComponent(clientPhone) : '',
                email: ''
              },
              messages: [],
              lastMessage: 'No messages yet',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };
            
            setSelectedConversation(newConversation);
            if (isMobile) setShowConversationView(true);
            console.log('📝 Created new conversation placeholder for client:', clientName);
          }
        });
      }
    }
  }, [conversations, restoreArchivedConversation, isMobile]);

  // Fallback polling every 10 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Fallback refresh (every 10s)');
      refreshConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshConversations]);

  // Combined search for both clients and conversations
  useEffect(() => {
    const searchClients = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setShowClientResults(false);
        return;
      }

      // First check if any existing conversations match
      const matchingConversations = conversations.filter(conv =>
        conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.client.phone && conv.client.phone.includes(searchTerm))
      );

      if (matchingConversations.length > 0) {
        setShowClientResults(false);
        return;
      }

      // If no existing conversations match, search for new clients
      setIsSearching(true);
      try {
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('id, name, phone, email')
          .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .limit(5);

        if (error) throw error;

        const results = clientData?.map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email
        })) || [];

        setSearchResults(results);
        setShowClientResults(results.length > 0);
      } catch (error) {
        console.error('Error searching clients:', error);
        toast.error("Failed to search clients");
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, conversations]);

  const handleClientSelect = async (client: SearchResult) => {
    console.log('Selected client:', client);
    
    // Check if conversation already exists
    let existingConversation = conversations.find(conv => conv.client.id === client.id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      if (isMobile) setShowConversationView(true);
      console.log('Using existing conversation:', existingConversation.id);
    } else {
      // Create a new conversation placeholder
      const newConversation = {
        id: `temp-${client.id}`,
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone || '',
          email: client.email || ''
        },
        messages: [],
        lastMessage: 'No messages yet',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
      
      setSelectedConversation(newConversation);
      if (isMobile) setShowConversationView(true);
      console.log('Created new conversation placeholder for client:', client.name);
    }

    setSearchTerm("");
    setShowClientResults(false);
    toast.success(`Opening conversation with ${client.name}`);
  };

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationView(true);
    }
  };

  const handleBackToList = () => {
    setShowConversationView(false);
    setSelectedConversation(null);
  };

  const handleMessageSent = () => {
    console.log('📤 Message sent, forcing immediate refresh');
    // Force immediate refresh after sending
    setTimeout(() => refreshConversations(), 100);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.client.phone && conv.client.phone.includes(searchTerm))
  );

  // Mobile layout - show either conversations list or conversation view
  if (isMobile) {
    return (
      <div className="h-[700px] border border-fixlyfy-border rounded-xl overflow-hidden bg-white shadow-card">
        {!showConversationView ? (
          // Mobile Conversations List
          <div className="h-full flex flex-col">
            {/* Header with search */}
            <div className="p-3 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-fixlyfy-text">Messages</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
                <Input
                  placeholder="Search or find clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy text-sm h-10"
                />
              </div>

              {/* Client search results dropdown */}
              {showClientResults && searchResults.length > 0 && (
                <div className="absolute left-3 right-3 mt-2 bg-white border border-fixlyfy-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  <div className="p-2 text-xs font-medium text-fixlyfy-text-muted border-b border-fixlyfy-border">New clients:</div>
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="p-3 hover:bg-fixlyfy/5 cursor-pointer border-b border-fixlyfy-border/50 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-fixlyfy-text truncate">{client.name}</div>
                          {client.phone && (
                            <div className="text-xs text-fixlyfy-text-secondary truncate">{client.phone}</div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-fixlyfy flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-hidden">
              <ConversationsList
                conversations={searchTerm ? filteredConversations : conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                isLoading={isLoading}
                onRefresh={refreshConversations}
                hideSearch={true}
              />
            </div>
          </div>
        ) : (
          // Mobile Conversation View
          <div className="h-full flex flex-col">
            {/* Back button header */}
            <div className="p-3 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
                className="gap-2 p-2 h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Messages
              </Button>
            </div>
            
            {/* Conversation Display Area */}
            <div className="flex-1 overflow-hidden">
              <MessageThread selectedConversation={selectedConversation} />
            </div>
            
            {/* Message Input */}
            <div className="border-t border-fixlyfy-border/50 flex-shrink-0">
              <MessageInput 
                selectedConversation={selectedConversation}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout - two panel resizable
  return (
    <div className="h-[700px] border border-fixlyfy-border rounded-xl overflow-hidden bg-white shadow-card">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List with Search */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Header with unified search */}
            <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-fixlyfy-text">Messages</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
                <Input
                  placeholder="Search conversations or find new clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
                />
              </div>

              {/* Client search results dropdown */}
              {showClientResults && searchResults.length > 0 && (
                <div className="absolute left-4 right-4 mt-2 bg-white border border-fixlyfy-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-2 text-xs font-medium text-fixlyfy-text-muted border-b border-fixlyfy-border">New clients:</div>
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="p-3 hover:bg-fixlyfy/5 cursor-pointer border-b border-fixlyfy-border/50 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-fixlyfy-text truncate">{client.name}</div>
                          {client.phone && (
                            <div className="text-sm text-fixlyfy-text-secondary truncate">{client.phone}</div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-fixlyfy flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-hidden">
              <ConversationsList
                conversations={searchTerm ? filteredConversations : conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                isLoading={isLoading}
                onRefresh={refreshConversations}
                hideSearch={true}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-fixlyfy-border hover:bg-fixlyfy/20 transition-colors w-1" />

        {/* Right Panel - Conversation View with AI Assistant at Bottom */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <div className="h-full flex flex-col bg-fixlyfy-bg-interface">
            {/* Conversation Display Area */}
            <div className="flex-1 overflow-hidden">
              <MessageThread selectedConversation={selectedConversation} />
            </div>
            
            {/* Message Input and AI Assistant */}
            <div className="border-t border-fixlyfy-border/50 flex-shrink-0">
              <MessageInput 
                selectedConversation={selectedConversation}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
