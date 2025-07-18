
import { useState } from "react";
import { sendClientMessage } from "@/components/jobs/hooks/messaging/messagingUtils";
import { toast } from "sonner";
import { FormattedMessage, Client } from "./types";

interface UseMessageSendingProps {
  client: Client;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<FormattedMessage[]>>;
}

interface UseMessageSendingReturn {
  isLoading: boolean;
  handleSendMessage: (messageText: string) => Promise<void>;
}

export const useMessageSending = ({
  client,
  conversationId,
  setConversationId,
  setMessages
}: UseMessageSendingProps): UseMessageSendingReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!messageText.trim() || isLoading) {
      return;
    }

    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    if (!client.id) {
      toast.error("Client information is missing");
      return;
    }

    setIsLoading(true);
    console.log("Sending message to client:", client.name, "Phone:", client.phone);

    try {
      const result = await sendClientMessage({
        content: messageText.trim(),
        clientPhone: client.phone,
        jobId: "",
        clientId: client.id,
        existingConversationId: conversationId
      });

      console.log("Message send result:", result);

      if (result.success) {
        // Add message to local state immediately for better UX
        const newMessage: FormattedMessage = {
          id: `temp-${Date.now()}`,
          text: messageText.trim(),
          sender: 'You',
          timestamp: new Date().toLocaleString(),
          isClient: false
        };

        setMessages(prev => [...prev, newMessage]);
        toast.success("Message sent successfully");
        
        // The real-time subscription in MessageContext will handle the refresh
      } else {
        console.error("Message sending failed:", result.error);
        toast.error(`Failed to send message: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
