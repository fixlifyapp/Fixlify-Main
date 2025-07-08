
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useDocumentSending } from '@/hooks/useDocumentSending';
import { toast } from 'sonner';

interface UniversalSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentType: 'estimate' | 'invoice';
  clientEmail?: string;
  clientPhone?: string;
  onSuccess?: () => void;
}

export function UniversalSendDialog({
  open,
  onOpenChange,
  documentId,
  documentType,
  clientEmail = '',
  clientPhone = '',
  onSuccess
}: UniversalSendDialogProps) {
  const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email');
  const [recipientEmail, setRecipientEmail] = useState(clientEmail);
  const [recipientPhone, setRecipientPhone] = useState(clientPhone);
  const [subject, setSubject] = useState(`Your ${documentType}`);
  const [message, setMessage] = useState(`Please find your ${documentType} attached.`);

  const { sendDocument, isProcessing } = useDocumentSending();

  const handleSend = async () => {
    try {
      console.log('🚀 Starting send process:', {
        method: sendMethod,
        documentId,
        documentType,
        recipientEmail: sendMethod === 'email' ? recipientEmail : undefined,
        recipientPhone: sendMethod === 'sms' ? recipientPhone : undefined
      });

      await sendDocument({
        method: sendMethod,
        documentId,
        documentType,
        recipientEmail: sendMethod === 'email' ? recipientEmail : undefined,
        recipientPhone: sendMethod === 'sms' ? recipientPhone : undefined,
        subject: sendMethod === 'email' ? subject : undefined,
        message
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Send failed:', error);
      toast.error(`Failed to send ${documentType}: ${error.message}`);
    }
  };

  const isFormValid = () => {
    if (sendMethod === 'email') {
      return recipientEmail && recipientEmail.includes('@');
    } else {
      return recipientPhone && recipientPhone.length >= 10;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send {documentType}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to send this {documentType} to your client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Send Method</Label>
            <RadioGroup value={sendMethod} onValueChange={(value: 'email' | 'sms') => setSendMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          {sendMethod === 'email' && (
            <>
              <div>
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="client@example.com"
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
            </>
          )}

          {sendMethod === 'sms' && (
            <div>
              <Label htmlFor="recipientPhone">Recipient Phone</Label>
              <Input
                id="recipientPhone"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message to include"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!isFormValid() || isProcessing}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send {documentType}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
