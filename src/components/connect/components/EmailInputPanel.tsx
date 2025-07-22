import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Send, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailInputPanelProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  jobId?: string;
  clientId?: string;
}

export const EmailInputPanel: React.FC<EmailInputPanelProps> = ({ onSend, onCancel, jobId, clientId }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (!user?.id || !clientId) {
      toast.error("User or Client ID not found.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          user_id: user.id,
          client_id: clientId || '',
          job_id: jobId || '',
          type: 'email',
          direction: 'outgoing',
          subject: subject,
          content: message,
          status: 'pending',
          from_address: user.email || '',
          to_address: '', // To be updated with actual recipient
          provider: 'system',
          recipient: ''
        })
        .select();

      if (error) {
        console.error("Error sending email:", error);
        toast.error("Failed to send email.");
      } else {
        console.log("Email saved to communication logs:", data);
        toast.success("Email saved.");
        onSend(message);
      }
    } catch (error) {
      console.error("Unexpected error sending email:", error);
      toast.error("Unexpected error occurred.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Compose Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </Button>
          <Badge variant="secondary">No files attached</Badge>
        </div>
        <Separator />
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSend}>
            Send
            <Send className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
