import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useMessageContext } from '@/contexts/MessageContext';
import { toast } from 'sonner';

interface EmailInputPanelProps {
  selectedConversation?: {
    id: string;
    client?: {
      id: string;
      name: string;
      email?: string;
    };
    emails?: Array<{
      id: string;
      subject: string;
      content: string;
      created_at: string;
      status: string;
    }>;
  };
  onEmailSent?: () => void;
}

export const EmailInputPanel: React.FC<EmailInputPanelProps> = ({
  selectedConversation,
  onEmailSent
}) => {
  const { user } = useAuth();
  const { sendEmail, isSending } = useMessageContext();
  const [to, setTo] = useState(selectedConversation?.client?.email || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  React.useEffect(() => {
    if (selectedConversation?.client?.email) {
      setTo(selectedConversation.client.email);
    }
  }, [selectedConversation?.client?.email]);

  const handleSend = async () => {
    if (!to || !subject || !content) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to send emails');
      return;
    }

    setIsSending(true);
    try {
      const success = await sendEmail(
        to,
        subject,
        content,
        selectedConversation?.client?.id
      );

      if (success) {
        // Reset form
        setSubject("");
        setContent("");
        onEmailSent?.();
        toast.success('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!selectedConversation?.emails?.length) {
      toast.error('No email history to analyze');
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Simple AI suggestion based on previous emails
      const lastEmail = selectedConversation.emails[selectedConversation.emails.length - 1];
      const suggestion = generateFollowUpSuggestion(lastEmail);
      
      setSubject(suggestion.subject);
      setContent(suggestion.content);
      toast.success('AI suggestion generated!');
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast.error('Failed to generate AI suggestion');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateFollowUpSuggestion = (lastEmail: any) => {
    const isFollowUp = lastEmail.subject.toLowerCase().includes('follow');
    
    return {
      subject: isFollowUp 
        ? `Re: ${lastEmail.subject}` 
        : `Follow-up: ${lastEmail.subject}`,
      content: `Hi ${selectedConversation?.client?.name || 'there'},

I wanted to follow up on our previous communication regarding ${lastEmail.subject.toLowerCase()}.

${isFollowUp 
  ? 'I hope this finds you well. Please let me know if you have any questions or need any additional information.'
  : 'I wanted to check in and see if you need any further assistance or have any questions about our discussion.'
}

Looking forward to hearing from you.

Best regards,
${user?.user_metadata?.full_name || 'Your Fixlify Team'}`
    };
  };

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
          <p className="text-sm">
            Select an email conversation to start composing a reply
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Email
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAISuggestion}
            disabled={isGeneratingAI || !selectedConversation?.emails?.length}
          >
            {isGeneratingAI ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Suggest
          </Button>
        </CardTitle>
        {selectedConversation.client && (
          <p className="text-sm text-muted-foreground">
            To: {selectedConversation.client.name} ({selectedConversation.client.email})
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-to">To</Label>
          <Input
            id="email-to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            disabled={!!selectedConversation.client?.email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-content">Message</Label>
          <Textarea
            id="email-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your email message here..."
            rows={8}
            className="min-h-[200px] resize-none"
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