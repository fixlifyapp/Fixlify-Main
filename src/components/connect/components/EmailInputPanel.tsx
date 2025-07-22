
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";

interface EmailInputPanelProps {
  clientId?: string;
  recipientEmail?: string;
  onEmailSent?: () => void;
}

export const EmailInputPanel = ({ clientId, recipientEmail, onEmailSent }: EmailInputPanelProps) => {
  const [to, setTo] = useState(recipientEmail || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useMessageContext();

  const handleSendEmail = async () => {
    if (!to.trim() || !subject.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSending(true);
      await sendMessage({
        type: 'email',
        to: to.trim(),
        subject: subject.trim(),
        content: content.trim(),
        clientId: clientId
      });
      
      toast.success('Email sent successfully');
      
      // Clear form
      setTo(recipientEmail || "");
      setSubject("");
      setContent("");
      
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email-to">To</Label>
          <Input
            id="email-to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>
        
        <div>
          <Label htmlFor="email-content">Message</Label>
          <Textarea
            id="email-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your email message here..."
            rows={6}
          />
        </div>
        
        <Button 
          onClick={handleSendEmail} 
          disabled={isSending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>
      </CardContent>
    </Card>
  );
};
