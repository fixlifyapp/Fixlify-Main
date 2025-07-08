
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, Send, User, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentSending } from '@/hooks/useDocumentSending';

interface UniversalSendDialogProps {
  documentType: 'estimate' | 'invoice';
  documentId: string;
  documentNumber: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  children: React.ReactNode;
}

export const UniversalSendDialog = ({
  documentType,
  documentId,
  documentNumber,
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  children
}: UniversalSendDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [emailData, setEmailData] = useState({
    recipientEmail: clientEmail || '',
    subject: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber}`,
    message: ''
  });
  const [smsData, setSmsData] = useState({
    recipientPhone: clientPhone || '',
    message: ''
  });

  const { sendEmail, sendSMS, isLoading } = useDocumentSending();

  useEffect(() => {
    if (isOpen) {
      // Set default messages
      const defaultEmailMessage = `Hello ${clientName || 'Client'},\n\nPlease find your ${documentType} attached.\n\nBest regards,\nYour Service Team`;
      const defaultSmsMessage = `Hi ${clientName || 'Client'}, your ${documentType} ${documentNumber} is ready. Please check your email or contact us for details.`;
      
      setEmailData(prev => ({
        ...prev,
        recipientEmail: clientEmail || '',
        message: prev.message || defaultEmailMessage
      }));
      
      setSmsData(prev => ({
        ...prev,
        recipientPhone: clientPhone || '',
        message: prev.message || defaultSmsMessage
      }));
    }
  }, [isOpen, clientName, clientEmail, clientPhone, documentType, documentNumber]);

  const handleSendEmail = async () => {
    console.log('📧 Attempting to send email with data:', {
      recipientEmail: emailData.recipientEmail,
      recipientName: clientName,
      documentType,
      documentId,
      documentNumber,
      subject: emailData.subject,
      message: emailData.message
    });

    if (!emailData.recipientEmail.trim()) {
      toast.error('Please enter a recipient email address');
      return;
    }

    try {
      await sendEmail({
        recipientEmail: emailData.recipientEmail,
        recipientName: clientName,
        documentType,
        documentId,
        documentNumber,
        subject: emailData.subject,
        message: emailData.message
      });
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
    }
  };

  const handleSendSMS = async () => {
    console.log('📱 Attempting to send SMS with data:', {
      recipientPhone: smsData.recipientPhone,
      recipientName: clientName,
      documentType,
      documentId,
      documentNumber,
      message: smsData.message
    });

    if (!smsData.recipientPhone.trim()) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    try {
      await sendSMS({
        recipientPhone: smsData.recipientPhone,
        recipientName: clientName,
        documentType,
        documentId,
        documentNumber,
        message: smsData.message
      });
      setIsOpen(false);
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
    }
  };

  const hasEmailInfo = !!clientEmail;
  const hasPhoneInfo = !!clientPhone;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{documentType.charAt(0).toUpperCase() + documentType.slice(1)} {documentNumber}</p>
                  {clientName && (
                    <p className="text-sm text-muted-foreground flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{clientName}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Methods */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
                {!hasEmailInfo && <AlertCircle className="w-3 h-3 text-orange-500" />}
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>SMS</span>
                {!hasPhoneInfo && <AlertCircle className="w-3 h-3 text-orange-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              {!hasEmailInfo && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-700">
                    No email address found for this client. Please enter one below.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={emailData.recipientEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailMessage">Message</Label>
                <Textarea
                  id="emailMessage"
                  placeholder="Enter your email message..."
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendEmail}
                disabled={isLoading || !emailData.recipientEmail.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Mail className="w-4 h-4 mr-2 animate-pulse" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              {!hasPhoneInfo && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-700">
                    No phone number found for this client. Please enter one below.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input
                  id="recipientPhone"
                  type="tel"
                  placeholder="+1234567890"
                  value={smsData.recipientPhone}
                  onChange={(e) => setSmsData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsMessage">Message</Label>
                <Textarea
                  id="smsMessage"
                  placeholder="Enter your SMS message..."
                  value={smsData.message}
                  onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendSMS}
                disabled={isLoading || !smsData.recipientPhone.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                    Sending SMS...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
