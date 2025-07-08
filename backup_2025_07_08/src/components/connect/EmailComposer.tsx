
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, X, Paperclip, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailComposerProps {
  recipient?: {
    id: string;
    name: string;
    email: string;
  };
  onClose?: () => void;
  onSent?: () => void;
}

export const EmailComposer = ({ recipient, onClose, onSent }: EmailComposerProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    to: recipient?.email || '',
    subject: '',
    html: '',
    text: ''
  });

  const sendEmail = async () => {
    if (!formData.to || !formData.subject) {
      toast.error('Please fill in recipient and subject');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: formData.to,
          subject: formData.subject,
          html: formData.html || formData.text,
          text: formData.text,
          companyId: 'current-company',
          conversationId: recipient?.id
        }
      });

      if (error) throw error;

      toast.success('Email sent successfully!');
      setFormData({ to: '', subject: '', html: '', text: '' });
      onSent?.();
      onClose?.();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">New Email</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {recipient && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{recipient.name}</span>
            <Badge variant="secondary">{recipient.email}</Badge>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email-to">To</Label>
          <Input
            id="email-to"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            placeholder="client@example.com"
            type="email"
            disabled={!!recipient}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-content">Message</Label>
          <Textarea
            id="email-content"
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Type your message here..."
            rows={8}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </Button>
          
          <div className="flex gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button onClick={sendEmail} disabled={loading || !formData.to || !formData.subject}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
