
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface SendDocumentParams {
  type: 'email' | 'sms';
  to: string;
  subject?: string;
  message: string;
  documentType: 'estimate' | 'invoice';
  documentId: string;
}

interface UniversalSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'estimate' | 'invoice';
  documentId: string;
  onSend: (params: SendDocumentParams) => Promise<void>;
  defaultRecipient?: string;
}

const UniversalSendDialog: React.FC<UniversalSendDialogProps> = ({
  open,
  onOpenChange,
  documentType,
  documentId,
  onSend,
  defaultRecipient = ''
}) => {
  const [sendType, setSendType] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(`Your ${documentType}`);
  const [message, setMessage] = useState(`Please find your ${documentType} attached.`);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend({
        type: sendType,
        to: recipient,
        subject: sendType === 'email' ? subject : undefined,
        message,
        documentType,
        documentId
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send {documentType}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={sendType} onValueChange={(value) => setSendType(value as 'email' | 'sms')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Email message"
                rows={4}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="SMS message"
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !recipient}>
            {isSending ? 'Sending...' : `Send ${sendType.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalSendDialog;
export { UniversalSendDialog };
