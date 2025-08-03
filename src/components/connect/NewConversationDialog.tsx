import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useSMS } from '@/contexts/SMSContext';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationDialog({ open, onOpenChange }: NewConversationDialogProps) {
  const { user } = useAuth();
  const { createConversation, setActiveConversation, conversations } = useSMS();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Fetch clients when dialog opens
  useState(() => {
    if (open && user?.id) {
      fetchClients();
    }
  }, [open, user?.id]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedClient || !message.trim()) return;

    setLoading(true);
    try {
      const client = clients.find(c => c.id === selectedClient);
      if (!client || !client.phone) {
        toast.error('Selected client has no phone number');
        return;
      }

      // Create conversation
      const conversationId = await createConversation(client.id, client.phone);
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Find the conversation and set it as active
      const newConversation = conversations.find(c => c.id === conversationId);
      if (newConversation) {
        setActiveConversation(newConversation);
      }

      // Send the initial message
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: client.phone,
          message: message,
          user_id: user?.id,
          metadata: {
            conversationId: conversationId,
            clientId: client.id,
            clientName: client.name,
            source: 'new_conversation'
          }
        }
      });

      if (error) throw error;

      toast.success('Conversation started!');
      onOpenChange(false);
      
      // Reset form
      setSelectedClient('');
      setMessage('');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New SMS Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="client">Select Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.phone && `(${client.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Initial Message</Label>
            <Input
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={!selectedClient || !message.trim() || loading}
            >
              {loading ? 'Starting...' : 'Start Conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}