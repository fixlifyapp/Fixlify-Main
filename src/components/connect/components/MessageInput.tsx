
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";

interface MessageInputProps {
  clientId: string;
  clientPhone?: string;
  clientEmail?: string;
  messageType: 'sms' | 'email';
  onMessageSent?: () => void;
}

export const MessageInput = ({ 
  clientId, 
  clientPhone, 
  clientEmail, 
  messageType, 
  onMessageSent 
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useMessageContext();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const recipient = messageType === 'sms' ? clientPhone : clientEmail;
    if (!recipient) {
      toast.error(`Client has no ${messageType === 'sms' ? 'phone number' : 'email address'}`);
      return;
    }

    try {
      setIsSending(true);
      await sendMessage({
        type: messageType,
        to: recipient,
        content: message.trim(),
        clientId: clientId
      });
      
      toast.success(`${messageType.toUpperCase()} sent successfully`);
      setMessage("");
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Type your ${messageType} message here...`}
        rows={2}
        className="flex-1"
      />
      <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
