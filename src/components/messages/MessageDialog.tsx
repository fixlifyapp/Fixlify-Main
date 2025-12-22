import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  onOpenChange,
  client
}) => {
  const { user } = useAuthState();
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (messageType === 'email' && !subject.trim()) {
      toast.error('Please enter a subject for the email');
      return;
    }

    setSending(true);

    try {
      if (messageType === 'sms') {
        if (!client.phone) {
          toast.error('No phone number available for this client');
          return;
        }

        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: client.phone,
            message: message,
            userId: user?.id,
            metadata: {
              clientId: client.id,
              clientName: client.name,
              source: 'message_dialog'
            }
          }
        });

        if (error) throw error;
        toast.success('SMS sent successfully!');
      } else {
        // Email sending would go here
        toast.info('Email functionality coming soon!');
      }

      onOpenChange(false);
      setMessage('');
      setSubject('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Message {client.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={messageType} onValueChange={(v) => setMessageType(v as 'sms' | 'email')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sms" disabled={!client.phone}>
              <Phone className="mr-2 h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" disabled={!client.email}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sms" className="space-y-4">
            <div>
              <Label>To: {client.phone || 'No phone number'}</Label>
            </div>
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {message.length}/160 characters
              </p>
            </div>
          </TabsContent>
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label>To: {client.email || 'No email address'}</Label>
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <input
                id="email-subject"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Type your email here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send {messageType === 'sms' ? 'SMS' : 'Email'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};