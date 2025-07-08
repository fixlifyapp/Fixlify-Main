
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useDocumentSending } from '@/hooks/useDocumentSending';
import { toast } from 'sonner';

interface UniversalSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  documentType: 'estimate' | 'invoice';
  jobId: string;
  onDocumentSent?: () => void;
}

export const UniversalSendDialog: React.FC<UniversalSendDialogProps> = ({
  isOpen,
  onClose,
  document,
  documentType,
  jobId,
  onDocumentSent
}) => {
  const { sendDocument, isProcessing } = useDocumentSending();
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms'>('email');
  
  // Email fields
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  
  // SMS fields
  const [recipientPhone, setRecipientPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  useEffect(() => {
    if (document && isOpen) {
      // Pre-fill email from client data
      const clientEmail = document.client?.email || document.clients?.email || '';
      const clientPhone = document.client?.phone || document.clients?.phone || '';
      
      console.log('📋 Pre-filling form with client data:', { clientEmail, clientPhone });
      
      setRecipientEmail(clientEmail);
      setRecipientPhone(clientPhone);
      
      // Set default subject and content
      const docNumber = document.estimate_number || document.invoice_number || '';
      setEmailSubject(`Your ${documentType} ${docNumber}`);
      setEmailContent(`Please find your ${documentType} attached. Thank you for your business!`);
      setSmsMessage(`Your ${documentType} ${docNumber} is ready. Please check your email or contact us for details.`);
    }
  }, [document, documentType, isOpen]);

  const handleSend = async () => {
    try {
      console.log('🚀 Starting send process:', {
        method: selectedMethod,
        documentType,
        documentId: document?.id,
        jobId,
        recipientEmail,
        recipientPhone
      });

      if (!document?.id) {
        toast.error('Document ID is missing');
        return;
      }

      const params = {
        documentId: document.id,
        documentType,
        method: selectedMethod,
        jobId,
        ...(selectedMethod === 'email' && {
          recipientEmail,
          subject: emailSubject,
          content: emailContent
        }),
        ...(selectedMethod === 'sms' && {
          recipientPhone,
          message: smsMessage
        })
      };

      console.log('📤 Sending with params:', params);
      
      await sendDocument(params);
      
      toast.success(`${documentType} sent successfully via ${selectedMethod}!`);
      onDocumentSent?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Send failed:', error);
      toast.error(`Failed to send ${documentType}: ${error.message}`);
    }
  };

  const isFormValid = () => {
    if (selectedMethod === 'email') {
      return recipientEmail && emailSubject && emailContent;
    } else {
      return recipientPhone && smsMessage;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send {documentType}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'email' | 'sms')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
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
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!isFormValid() || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            Send {selectedMethod === 'email' ? 'Email' : 'SMS'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
