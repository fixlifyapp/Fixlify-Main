
import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, Plus, Mail, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { EmailConversationsList } from "./EmailConversationsList";
import { EmailThreadView } from "./EmailThreadView";
import { EmailInputPanel } from "./EmailInputPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface EmailConversation {
  id: string;
  subject: string;
  last_message_at: string;
  status: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  emails: any[];
}

export const SimpleEmailInterface = () => {
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<EmailConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showClientResults, setShowClientResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConversationView, setShowConversationView] = useState(false);
  const isMobile = useIsMobile();

  console.log('SimpleEmailInterface conversations:', conversations);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get company settings
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!companySettings) return;

      // Fetch conversations with messages
      const { data: conversationsData, error } = await supabase
        .from('email_conversations')
        .select(`
          id,
          subject,
          last_message_at,
          status,
          client_id,
          email_messages (
            id,
            sender_email,
            recipient_email,
            subject,
            body_html,
            body_text,
            direction,
            delivery_status,
            created_at
          )
        `)
        .eq('company_id', companySettings.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get client information for conversations
      const conversationsWithClients = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          let clientInfo = null;
          
          if (conv.client_id) {
            const { data: client } = await supabase
              .from('clients')
              .select('id, name, email, phone')
              .eq('id', conv.client_id)
              .single();
            
            clientInfo = client;
          }

          return {
            ...conv,
            client: clientInfo,
            emails: conv.email_messages || []
          };
        })
      );

      setConversations(conversationsWithClients);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error("Failed to load email conversations");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh conversations every 10 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

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
        conv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.client?.email && conv.client.email.includes(searchTerm)) ||
        conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
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
    console.log('Selected client for email:', client);
    
    // Check if conversation already exists
    let existingConversation = conversations.find(conv => conv.client?.id === client.id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      if (isMobile) setShowConversationView(true);
      console.log('Using existing email conversation:', existingConversation.id);
    } else {
      // Create a new email conversation placeholder
      const newConversation = {
        id: `temp-${client.id}`,
        subject: 'New Email Conversation',
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone || '',
          email: client.email || ''
        },
        emails: [],
        last_message_at: new Date().toISOString(),
        status: 'active'
      };
      
      setSelectedConversation(newConversation);
      if (isMobile) setShowConversationView(true);
      console.log('Created new email conversation placeholder for client:', client.name);
    }

    setSearchTerm("");
    setShowClientResults(false);
    toast.success(`Opening email conversation with ${client.name}`);
  };

  const handleConversationSelect = (conversation: EmailConversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationView(true);
    }
  };

  const handleBackToList = () => {
    setShowConversationView(false);
    setSelectedConversation(null);
  };

  const handleNewEmail = () => {
    const newConversation = {
      id: 'temp-new',
      subject: 'New Email',
      client: undefined,
      emails: [],
      last_message_at: new Date().toISOString(),
      status: 'draft'
    };
    
    setSelectedConversation(newConversation);
    if (isMobile) setShowConversationView(true);
  };

  const handleEmailSent = () => {
    fetchConversations();
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    conv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.client?.email && conv.client.email.includes(searchTerm)) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-fixlyfy-text">Emails</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
                <Input
                  placeholder="Search conversations or find clients..."
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
                          {client.email && (
                            <div className="text-xs text-fixlyfy-text-secondary truncate">{client.email}</div>
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
              <EmailConversationsList
                conversations={searchTerm ? filteredConversations : conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                isLoading={loading}
                onRefresh={fetchConversations}
                onNewEmail={handleNewEmail}
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
                Back to Emails
              </Button>
            </div>
            
            {/* Email Display Area */}
            <div className="flex-1 overflow-hidden">
              <EmailThreadView selectedConversation={selectedConversation} />
            </div>
            
            {/* Email Input */}
            <div className="border-t border-fixlyfy-border/50 flex-shrink-0">
              <EmailInputPanel 
                selectedConversation={selectedConversation}
                onEmailSent={handleEmailSent}
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
        {/* Left Panel - Email Conversations List with Search */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Header with unified search */}
            <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-fixlyfy-text">Emails</h2>
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
                          {client.email && (
                            <div className="text-sm text-fixlyfy-text-secondary truncate">{client.email}</div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-fixlyfy flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Conversations List */}
            <div className="flex-1 overflow-hidden">
              <EmailConversationsList
                conversations={searchTerm ? filteredConversations : conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                isLoading={loading}
                onRefresh={fetchConversations}
                onNewEmail={handleNewEmail}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-fixlyfy-border hover:bg-fixlyfy/20 transition-colors w-1" />

        {/* Right Panel - Email Conversation View */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <div className="h-full flex flex-col bg-fixlyfy-bg-interface">
            {/* Email Display Area */}
            <div className="flex-1 overflow-hidden">
              <EmailThreadView selectedConversation={selectedConversation} />
            </div>
            
            {/* Email Input */}
            <div className="border-t border-fixlyfy-border/50 flex-shrink-0">
              <EmailInputPanel 
                selectedConversation={selectedConversation}
                onEmailSent={handleEmailSent}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
