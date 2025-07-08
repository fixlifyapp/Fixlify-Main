
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useDocumentSending } from '@/hooks/useDocumentSending';
import { toast } from 'sonner';

export interface UniversalSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'estimate' | 'invoice';
  documentId: string;
  documentNumber: string;
  total: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess?: () => void;
}

export function UniversalSendDialog({
  open,
  onOpenChange,
  documentType,
  documentId,
  documentNumber,
  total,
  contactInfo,
  onSuccess
}: UniversalSendDialogProps) {
  const [selectedTab, setSelectedTab] = useState('email');
  const [emailData, setEmailData] = useState({
    to: contactInfo.email || '',
    subject: `${documentType === 'estimate' ? 'Estimate' : 'Invoice'} ${documentNumber}`,
    message: `Please find your ${documentType} attached.`
  });
  const [smsData, setSmsData] = useState({
    to: contactInfo.phone || '',
    message: `Hi ${contactInfo.name}, your ${documentType} ${documentNumber} for $${total} is ready. Please check your email for details.`
  });

  const { sendDocument, isProcessing } = useDocumentSending();

  const handleSend = async () => {
    try {
      const recipient = {
        name: contactInfo.name,
        email: selectedTab === 'email' ? emailData.to : contactInfo.email,
        phone: selectedTab === 'sms' ? smsData.to : contactInfo.phone
      };

      const result = await sendDocument({
        documentType,
        documentId,
        method: selectedTab as 'email' | 'sms',
        recipient,
        customMessage: selectedTab === 'email' ? emailData.message : smsData.message,
        subject: selectedTab === 'email' ? emailData.subject : undefined
      });

      if (result.success) {
        toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} sent successfully via ${selectedTab}!`);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.error || `Failed to send ${documentType}`);
      }
    } catch (error) {
      console.error('Error sending document:', error);
      toast.error(`Failed to send ${documentType}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Send {documentType === 'estimate' ? 'Estimate' : 'Invoice'} {documentNumber}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Enter subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Enter your message"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sms-to">To</Label>
              <Input
                id="sms-to"
                type="tel"
                value={smsData.to}
                onChange={(e) => setSmsData({ ...smsData, to: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={smsData.message}
                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                placeholder="Enter your message"
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isProcessing || (selectedTab === 'email' && !emailData.to) || (selectedTab === 'sms' && !smsData.to)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              `Send ${selectedTab === 'email' ? 'Email' : 'SMS'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
