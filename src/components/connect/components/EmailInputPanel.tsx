
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface EmailInputPanelProps {
  clientEmail: string;
  clientName: string;
  onEmailSent: () => void;
}

export const EmailInputPanel = ({ clientEmail, clientName, onEmailSent }: EmailInputPanelProps) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!user || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSending(true);

      // Call the send-email edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: clientEmail,
          subject: subject,
          content: content,
          clientName: clientName
        }
      });

      if (error) throw error;

      toast.success("Email sent successfully!");
      setSubject("");
      setContent("");
      onEmailSent();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">To:</span>
        <span className="text-sm text-muted-foreground">{clientEmail} ({clientName})</span>
      </div>

      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <Textarea
        placeholder="Write your email message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      <div className="flex justify-end">
        <Button onClick={handleSendEmail} disabled={isSending}>
          {isSending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Email
        </Button>
      </div>
    </div>
  );
};
