import { useState, useEffect } from 'react';
import { Mail, Phone, Search, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommunicationService } from '@/services/communication-service';
import { CommunicationCategory } from '@/types/communications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: 'email' | 'sms';
  clientId?: string;
  jobId?: string;
  estimateId?: string;
  invoiceId?: string;
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
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CommunicationCategory>('general');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Search for clients when query changes
  useEffect(() => {
    const searchClients = async () => {
      if (searchQuery.length < 2) {
        setClients([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error searching clients:', error);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setTo(type === 'email' ? client.email : client.phone);
    setSearchQuery('');
    setClients([]);
  };

  const handleSend = async () => {
    if (!to) {
      toast.error('Please enter a recipient');
      return;
    }

    if (type === 'email' && !subject) {
      toast.error('Please enter a subject');
      return;
    }

    if (!content) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      if (type === 'email') {
        await CommunicationService.sendEmail({
          to,
          subject,
          content,
          category,
          relatedEntityId: clientId || jobId || estimateId || invoiceId,
          relatedEntityType: clientId ? 'client' : jobId ? 'job' : estimateId ? 'estimate' : invoiceId ? 'invoice' : undefined
        });
      } else {
        await CommunicationService.sendSMS({
          to,
          content,
          category,
          relatedEntityId: clientId || jobId || estimateId || invoiceId,
          relatedEntityType: clientId ? 'client' : jobId ? 'job' : estimateId ? 'estimate' : invoiceId ? 'invoice' : undefined
        });
      }

      toast.success(`${type === 'email' ? 'Email' : 'SMS'} sent successfully`);
      onOpenChange(false);
      
      // Reset form
      setTo('');
      setSubject('');
      setContent('');
      setCategory('general');
      setSelectedClient(null);
    } catch (error: any) {
      toast.error(`Failed to send ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send {type === 'email' ? 'Email' : 'SMS'}</DialogTitle>
          <DialogDescription>
            Send a {type === 'email' ? 'email' : 'text message'} to a client
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={(value: 'email' | 'sms') => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!selectedClient && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search" className="text-right">
                Client
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="search"
                  placeholder="Search for a client..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) searchClients(e.target.value);
                  }}
                  icon={<Search className="h-4 w-4" />}
                />
                {clients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="p-2 hover:bg-accent cursor-pointer"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.email} • {client.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedClient && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Client</Label>
              <div className="col-span-3 flex items-center gap-2 p-2 bg-muted rounded-md">
                <User className="h-4 w-4" />
                <div>
                  <div className="font-medium">{selectedClient.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedClient.email} • {selectedClient.phone}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedClient(null);
                    setTo('');
                  }}
                  className="ml-auto"
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={type === 'email' ? 'email@example.com' : '+1234567890'}
              className="col-span-3"
              disabled={!!selectedClient}
            />
          </div>

          {type === 'email' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="col-span-3"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={(value: CommunicationCategory) => setCategory(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="estimate">Estimate</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'email' ? 'Email content...' : 'SMS message...'}
              className="col-span-3 min-h-[150px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : `Send ${type === 'email' ? 'Email' : 'SMS'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}