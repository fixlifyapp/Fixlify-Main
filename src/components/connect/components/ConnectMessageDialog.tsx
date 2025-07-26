import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSMS } from "@/contexts/SMSContext";
import { MessageSquare, Phone, Search, User, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ConnectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

export const ConnectMessageDialog = ({ isOpen, onClose, client: preselectedClient }: ConnectMessageDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(preselectedClient || null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { createConversation, sendMessage, fetchConversations, setActiveConversation, conversations } = useSMS();

  // Search clients
  useEffect(() => {
    const searchClients = async () => {
      if (!searchQuery.trim()) {
        setClients([]);
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, email')
        .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(10);

      if (!error && data) {
        setClients(Array.isArray(data) ? data : []);
      } else {
        setClients([]);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    if (preselectedClient) {
      setSelectedClient(preselectedClient);
      setPhoneNumber(preselectedClient.phone || "");
    }
  }, [preselectedClient]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setPhoneNumber(client.phone || "");
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const targetPhone = selectedClient?.phone || phoneNumber;
    if (!targetPhone) {
      toast.error('Please select a client or enter a phone number');
      return;
    }

    try {
      setIsLoading(true);

      // Check if conversation already exists
      let existingConversation = conversations.find(
        conv => conv.client?.phone === targetPhone || conv.client_phone === targetPhone
      );

      let conversationId: string | null = existingConversation?.id || null;

      // Create conversation if doesn't exist
      if (!conversationId) {
        conversationId = await createConversation(
          selectedClient?.id || '', 
          targetPhone
        );
      }

      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Send the message
      await sendMessage(conversationId, message);

      // Refresh conversations
      await fetchConversations();

      // Set the new conversation as active
      const updatedConversations = await supabase
        .from('sms_conversations')
        .select(`
          *,
          client:clients!sms_conversations_client_id_fkey (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('id', conversationId)
        .single();

      if (updatedConversations.data) {
        setActiveConversation(updatedConversations.data);
      }
      
      toast.success('Message sent successfully');
      setMessage("");
      setSelectedClient(null);
      setPhoneNumber("");
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedClient(null);
    setPhoneNumber("");
    setSearchQuery("");
    setClients([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            New SMS Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Selection */}
          {!selectedClient ? (
            <div className="space-y-4">
              <div>
                <Label>Search Client</Label>
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isSearchOpen}
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search for a client...
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search by name, phone, or email..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandEmpty>No clients found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {Array.isArray(clients) && clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              onSelect={() => handleSelectClient(client)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{client.name}</span>
                                {client.phone && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {client.phone}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="text-center text-sm text-muted-foreground">OR</div>

              <div>
                <Label htmlFor="phone">Enter Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReset}
                >
                  Change
                </Button>
              </div>
              {selectedClient.phone && (
                <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" />
                  {selectedClient.phone}
                </span>
              )}
            </div>
          )}

          {/* Message Input */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your SMS message here..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim() || (!selectedClient && !phoneNumber)}
            >
              {isLoading ? 'Sending...' : 'Send SMS'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};