
import { useState } from "react";
import { useMessageFetching } from "./useMessageFetching";
import { useMessageSending } from "./useMessageSending";
import { useMessageRealtime } from "./useMessageRealtime";
import { UseMessageDialogProps, UseMessageDialogReturn } from "./types";

export const useMessageDialog = ({ client, open }: UseMessageDialogProps): UseMessageDialogReturn => {
  const [message, setMessage] = useState("");

  const {
    messages,
    setMessages,
    isLoadingMessages,
    conversationId,
    setConversationId
  } = useMessageFetching({
    clientId: client.id,
    clientName: client.name,
    open
  });

  const { isLoading, handleSendMessage: sendMessage } = useMessageSending({
    client,
    conversationId,
    setConversationId,
    setMessages
  });

  useMessageRealtime({
    open,
    clientId: client.id,
    clientName: client.name,
    conversationId,
    messages,
    setMessages
  });

  const handleSendMessage = async () => {
    await sendMessage(message);
    setMessage("");
  };

  return {
    message,
    setMessage,
    messages,
    isLoading,
    isLoadingMessages,
    handleSendMessage,
    conversationId
  };
};
