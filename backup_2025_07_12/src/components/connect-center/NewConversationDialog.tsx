import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSMS } from '@/contexts/SMSContext';
import { toast } from 'sonner';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationDialog({ open, onOpenChange }: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { createConversation, setActiveConversation, conversations } = useSMS();

  const searchClients = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, email')
        .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error searching clients:', error);
      toast.error('Failed to search clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClient = async (client: any) => {
    if (!client.phone) {
      toast.error('Client does not have a phone number');
      return;
    }

    const conversationId = await createConversation(client.id, client.phone);
    if (conversationId) {
      // Find and set the active conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New SMS Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchClients();
                  }
                }}
              />
            </div>
            <Button onClick={searchClients} disabled={isLoading}>
              Search
            </Button>
          </div>

          {clients.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Select a client to start conversation
              </Label>
              <ScrollArea className="h-[300px] border rounded-md">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 hover:bg-accent cursor-pointer transition-colors border-b"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {client.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{client.name}</p>
                        <div className="text-sm text-muted-foreground">
                          {client.phone ? (
                            <span>{client.phone}</span>
                          ) : (
                            <span className="text-destructive">No phone number</span>
                          )}
                          {client.email && (
                            <span className="ml-2">• {client.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}