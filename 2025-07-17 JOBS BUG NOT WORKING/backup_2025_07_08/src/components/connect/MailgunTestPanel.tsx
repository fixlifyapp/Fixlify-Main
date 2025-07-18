
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';

export const MailgunTestPanel = () => {
  const { companySettings, isLoading } = useCompanySettings();
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Test Email from Mailgun');
  const [testMessage, setTestMessage] = useState('This is a test email sent through Mailgun integration.');
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('mailgun-email', {
        body: {
          to: testEmail,
          subject: testSubject,
          html: `<p>${testMessage}</p>`,
          text: testMessage,
          userId: (await supabase.auth.getUser()).data.user?.id,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Test email sent successfully!');
        setTestEmail('');
      } else {
        throw new Error(data?.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Mailgun Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Mailgun Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-subject">Subject</Label>
          <Input
            id="test-subject"
            value={testSubject}
            onChange={(e) => setTestSubject(e.target.value)}
            placeholder="Test Subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-message">Message</Label>
          <Input
            id="test-message"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Test message content"
          />
        </div>

        <div className="space-y-2">
          <Label>Company Email Settings</Label>
          <div className="text-sm text-gray-600">
            <p>Company Email: {companySettings?.company_email || 'Not configured'}</p>
            <p>Company Name: {companySettings?.company_name || 'Not configured'}</p>
          </div>
        </div>

        <Button 
          onClick={handleSendTest} 
          disabled={isSending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Test Email'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MailgunTestPanel;
