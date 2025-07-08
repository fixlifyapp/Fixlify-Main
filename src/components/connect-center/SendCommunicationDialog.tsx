
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Send, User, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface SendCommunicationDialogProps {
  children: React.ReactNode;
}

export const SendCommunicationDialog = ({ children }: SendCommunicationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [type, setType] = useState<'email' | 'sms'>('email');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery))
  );

  const sendCommunication = async () => {
    if (!selectedClient || !message.trim()) {
      toast.error('Please select a client and enter a message');
      return;
    }

    if (type === 'email' && !selectedClient.email) {
      toast.error('Selected client has no email address');
      return;
    }

    if (type === 'sms' && !selectedClient.phone) {
      toast.error('Selected client has no phone number');
      return;
    }

    setIsSending(true);
    try {
      const functionName = type === 'email' ? 'mailgun-email' : 'telnyx-sms';
      
      const requestBody = type === 'email' 
        ? {
            to: selectedClient.email,
            subject: subject || 'Message from your service provider',
            html: message.replace(/\n/g, '<br>'),
            from: 'no-reply@yourdomain.com'
          }
        : {
            to: selectedClient.phone,
            message: message
          };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) throw error;

      toast.success(`${type === 'email' ? 'Email' : 'SMS'} sent successfully!`);
      
      // Reset form
      setSelectedClient(null);
      setSubject('');
      setMessage('');
      setSearchQuery('');
      setIsOpen(false);

    } catch (error: any) {
      console.error(`Error sending ${type}:`, error);
      toast.error(`Failed to send ${type}: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {type === 'email' ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            <span>Send {type === 'email' ? 'Email' : 'SMS'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={type === 'email' ? 'default' : 'outline'}
              onClick={() => setType('email')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={type === 'sms' ? 'default' : 'outline'}
              onClick={() => setType('sms')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Select Client</Label>
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {type === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder={`Enter your ${type === 'email' ? 'email' : 'SMS'} message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={type === 'email' ? 6 : 4}
            />
          </div>

          <Button 
            onClick={sendCommunication}
            disabled={!selectedClient || !message.trim() || isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {type === 'email' ? 'Email' : 'SMS'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
