import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useMessageContext } from '@/contexts/MessageContext';
import { toast } from 'sonner';

interface EmailInputProps {
  conversation?: {
    client?: {
      id: string;
      name: string;
      email?: string;
    };
  };
  onSent?: () => void;
}

export const EmailInput: React.FC<EmailInputProps> = ({ conversation, onSent }) => {
  const { user } = useAuth();
  const { sendEmail, isSending } = useMessageContext();
  const [to, setTo] = useState(conversation?.client?.email || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSend = async () => {
    if (!to || !subject || !content) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to send emails');
      return;
    }

    try {
      const success = await sendEmail(
        to, 
        subject, 
        content, 
        conversation?.client?.id
      );
      
      if (success) {
        // Reset form
        setTo(conversation?.client?.email || "");
        setSubject("");
        setContent("");
        onSent?.();
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Send Email</CardTitle>
        {conversation?.client?.name && (
          <p className="text-sm text-muted-foreground">
            To: {conversation.client.name}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-to">Email Address</Label>
          <Input
            id="email-to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={!!conversation?.client?.email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            placeholder="Enter email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-content">Message</Label>
          <Textarea
            id="email-content"
            placeholder="Type your email message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="min-h-[120px]"
          />
        </div>

        <Button 
          onClick={handleSend}
          disabled={!to || !subject || !content || isSending}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};