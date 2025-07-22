import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, FileText } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useMessageContext } from '@/contexts/MessageContext';

interface EmailComposerProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultContent?: string;
  clientId?: string;
  onSent?: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  defaultTo = "",
  defaultSubject = "",
  defaultContent = "",
  clientId,
  onSent
}) => {
  const { user } = useAuth();
  const { sendEmail, isSending } = useMessageContext();
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState(defaultContent);

  const handleSend = async () => {
    if (!to || !subject || !content || !user?.id) {
      return;
    }

    const success = await sendEmail(to, subject, content, clientId);
    if (success && onSent) {
      onSent();
      // Reset form
      setTo("");
      setSubject("");
      setContent("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-to">To</Label>
          <Input
            id="email-to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-content">Message</Label>
          <Textarea
            id="email-content"
            placeholder="Write your email message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
        </div>

        <Button 
          onClick={handleSend}
          disabled={!to || !subject || !content || isSending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>
      </CardContent>
    </Card>
  );
};