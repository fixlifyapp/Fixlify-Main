
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMessageContext } from "@/contexts/MessageContext";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface ConnectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export const ConnectMessageDialog = ({ isOpen, onClose, client }: ConnectMessageDialogProps) => {
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useMessageContext();

  const handleSendMessage = async () => {
    if (!client || !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (messageType === 'sms' && !client.phone) {
      toast.error('Client has no phone number');
      return;
    }

    if (messageType === 'email' && !client.email) {
      toast.error('Client has no email address');
      return;
    }

    try {
      setIsSending(true);
      await sendMessage({
        type: messageType,
        to: messageType === 'sms' ? client.phone! : client.email!,
        content: message,
        subject: messageType === 'email' ? subject : undefined,
        clientId: client.id
      });
      
      toast.success(`${messageType.toUpperCase()} sent successfully`);
      setMessage("");
      setSubject("");
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Message to {client?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={messageType === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('sms')}
              disabled={!client?.phone}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              SMS
            </Button>
            <Button
              variant={messageType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('email')}
              disabled={!client?.email}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>

          {messageType === 'email' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your ${messageType} message here...`}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? 'Sending...' : `Send ${messageType.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
