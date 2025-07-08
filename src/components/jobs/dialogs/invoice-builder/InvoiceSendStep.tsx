
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useDocumentSending } from '@/hooks/useDocumentSending';
import { toast } from 'sonner';

interface InvoiceSendStepProps {
  invoice: any;
  onSent: () => void;
  onBack: () => void;
}

export const InvoiceSendStep: React.FC<InvoiceSendStepProps> = ({
  invoice,
  onSent,
  onBack
}) => {
  const { sendEmail, sendSMS, isProcessing } = useDocumentSending();
  const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email');
  
  // Email fields
  const [recipientEmail, setRecipientEmail] = useState(invoice?.client?.email || '');
  const [emailSubject, setEmailSubject] = useState(`Invoice ${invoice?.invoice_number || ''}`);
  const [emailContent, setEmailContent] = useState('Please find your invoice attached. Thank you for your business!');
  
  // SMS fields
  const [recipientPhone, setRecipientPhone] = useState(invoice?.client?.phone || '');
  const [smsMessage, setSmsMessage] = useState(`Your invoice ${invoice?.invoice_number || ''} is ready. Please check your email or contact us for details.`);

  const handleSend = async () => {
    try {
      if (sendMethod === 'email') {
        await sendEmail({
          recipientEmail,
          subject: emailSubject,
          content: emailContent,
          documentId: invoice.id,
          documentType: 'invoice',
          jobId: invoice.job_id
        });
      } else {
        await sendSMS({
          recipientPhone,
          message: smsMessage,
          documentId: invoice.id,
          documentType: 'invoice',
          jobId: invoice.job_id
        });
      }
      
      onSent();
    } catch (error: any) {
      console.error('Failed to send invoice:', error);
      toast.error(`Failed to send invoice: ${error.message}`);
    }
  };

  const isFormValid = () => {
    if (sendMethod === 'email') {
      return recipientEmail && emailSubject && emailContent;
    } else {
      return recipientPhone && smsMessage;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant={sendMethod === 'email' ? 'default' : 'outline'}
          onClick={() => setSendMethod('email')}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button
          variant={sendMethod === 'sms' ? 'default' : 'outline'}
          onClick={() => setSendMethod('sms')}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </Button>
      </div>

      {sendMethod === 'email' ? (
        <Card>
          <CardHeader>
            <CardTitle>Send via Email</CardTitle>
            <CardDescription>Send the invoice to your client's email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Email content"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Send via SMS</CardTitle>
            <CardDescription>Send a text message to your client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Recipient Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Enter recipient phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="SMS message"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={!isFormValid() || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Invoice
        </Button>
      </div>
    </div>
  );
};
