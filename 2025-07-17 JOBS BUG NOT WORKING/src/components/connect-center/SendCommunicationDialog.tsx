import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSMS } from '@/contexts/SMSContext';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export function SendCommunicationDialog({
  open,
  onOpenChange,
  defaultType,
  clientId,
  jobId,
  estimateId,
  invoiceId
}: SendCommunicationDialogProps) {
  const [type, setType] = useState<'email' | 'sms'>(defaultType);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const { createConversation, sendMessage: sendSMS } = useSMS();

  // Filter clients based on search query
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery))
  );

  const handleSend = async () => {
    if (!recipient || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      if (type === 'sms') {
        // Create or find conversation
        const conversationId = await createConversation(clientId || '', recipient);
        if (conversationId) {
          await sendSMS(conversationId, message);
          toast.success('SMS sent successfully');
          onOpenChange(false);
        }
      } else {
        // Email functionality not yet implemented
        toast.error('Email functionality coming soon');
      }
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Communication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'email' | 'sms')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{type === 'sms' ? 'Phone Number' : 'Email Address'}</Label>
            <input
              type={type === 'sms' ? 'tel' : 'email'}
              className="w-full px-3 py-2 border rounded-md"
              placeholder={type === 'sms' ? '+1234567890' : 'email@example.com'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            
            {searchQuery && (
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 cursor-pointer hover:bg-muted ${
                      selectedClient?.id === client.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => {
                      setSelectedClient(client);
                      setSearchQuery(client.name);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {type === 'email' ? client.email : client.phone}
                        </p>
                      </div>
                      {((type === 'email' && client.email) || (type === 'sms' && client.phone)) && (
                        <Badge variant="secondary">Available</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedClient && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {type === 'email' ? selectedClient.email : selectedClient.phone}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              rows={5}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              <Send className="h-4 w-4 mr-2" />
              Send {type.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
