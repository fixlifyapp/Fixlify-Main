
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

interface EmailInputProps {
  recipientEmail?: string;
  onSent?: () => void;
}

export const EmailInput = ({ recipientEmail = "", onSent }: EmailInputProps) => {
  const { companySettings, isLoading } = useCompanySettings();
  const [to, setTo] = useState(recipientEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('mailgun-email', {
        body: {
          to: to.trim(),
          subject: subject.trim(),
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
          text: message.trim(),
          userId: (await supabase.auth.getUser()).data.user?.id,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Email sent successfully!");
        setTo("");
        setSubject("");
        setMessage("");
        onSent?.();
      } else {
        throw new Error(data?.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
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
            Send Email
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
          Send Email
        </CardTitle>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-message">Message</Label>
          <Textarea
            id="email-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Email message"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label>From</Label>
          <div className="text-sm text-gray-600">
            <p>{companySettings?.company_name || 'Your Company'} &lt;{companySettings?.company_email || 'noreply@fixlify.com'}&gt;</p>
          </div>
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

