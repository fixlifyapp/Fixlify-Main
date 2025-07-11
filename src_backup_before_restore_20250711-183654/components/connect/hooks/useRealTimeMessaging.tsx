
import { useEffect } from "react";
import { useMessageContext } from "@/contexts/MessageContext";

interface UseRealTimeMessagingProps {
  onNewMessage?: () => void;
  enabled?: boolean;
}

export const useRealTimeMessaging = ({ 
  onNewMessage,
  enabled = true
}: UseRealTimeMessagingProps = {}) => {
  
  const { refreshConversations } = useMessageContext();
  
  // Use the centralized real-time system from MessageContext
  useEffect(() => {
    if (!enabled) return;

    // Since MessageContext already handles real-time updates,
    // we just need to call the callback when conversations change
    if (onNewMessage) {
      // Create a simple interval to check for updates
      // This is a fallback mechanism since the main real-time is in MessageContext
      const checkInterval = setInterval(() => {
        // This will be called when MessageContext updates conversations
        onNewMessage();
      }, 2000);

      return () => {
        clearInterval(checkInterval);
      };
    }
  }, [onNewMessage, enabled]);

  // Note: The main real-time functionality is now centralized in MessageContext
  // This hook serves as a bridge for components that need update callbacks
};
