
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";
import { MessageTextEnhancer } from "./MessageTextEnhancer";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { useIsMobile } from "@/hooks/use-mobile";
import { sendClientMessage } from "@/components/jobs/hooks/messaging/messagingUtils";

interface MessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const MessageInput = ({ selectedConversation, onMessageSent }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { refreshConversations } = useMessageContext();
  const isMobile = useIsMobile();

  const messages = selectedConversation?.messages || [];
  const formattedMessages = messages.map((msg: any) => ({
    id: msg.id,
    body: msg.body,
    direction: msg.direction,
    created_at: msg.created_at,
    sender: msg.sender
  }));

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: formattedMessages,
    client: selectedConversation?.client || {},
    jobId: '', // No job context in message interface
    onUseSuggestion: (content: string) => setMessageText(content)
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.client.phone || isSending) {
      if (!selectedConversation?.client.phone) {
        toast.error("No phone number available for this client");
      }
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending message via MessageInput:', {
        client: selectedConversation.client,
        message: messageText
      });

      const result = await sendClientMessage({
        content: messageText.trim(),
        clientPhone: selectedConversation.client.phone,
        clientId: selectedConversation.client.id,
        jobId: '', // No job context in connect center
        existingConversationId: selectedConversation.id || null
      });

      if (result.success) {
        setMessageText("");
        onMessageSent();
        await refreshConversations();
        toast.success("Message sent successfully!");
      } else {
        toast.error(`Failed to send message: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canSuggestResponse = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const shouldShowSuggest = canSuggestResponse && lastMessage?.direction === 'inbound';

  if (!selectedConversation) {
    return (
      <div className={`${isMobile ? 'p-3' : 'p-4'} text-center text-fixlyfy-text-secondary`}>
        <p className={isMobile ? 'text-sm' : 'text-base'}>
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-white to-fixlyfy-bg-interface`}>
      {/* AI Suggest Response Button */}
      {shouldShowSuggest && (
        <div className="mb-3 flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSuggestResponse}
            disabled={isAILoading || isSending}
            className={`gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 ${isMobile ? 'min-h-[44px] text-sm' : ''}`}
          >
            {isAILoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Response
              </>
            )}
          </Button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea 
            className={cn(
              "w-full p-3 pr-12 border border-fixlyfy-border/50 rounded-lg focus:ring-2 focus:ring-fixlyfy/50 focus:border-fixlyfy focus:outline-none resize-none transition-all duration-200 bg-white shadow-sm",
              isMobile ? "min-h-[44px] max-h-[120px] text-sm" : "min-h-[60px] max-h-[120px]"
            )}
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={isSending}
            onKeyDown={handleKeyDown}
            rows={isMobile ? 2 : 2}
          />
          <div className="absolute right-3 top-3">
            <MessageTextEnhancer 
              messageText={messageText}
              setMessageText={setMessageText}
              disabled={isSending}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSendMessage}
          disabled={isSending || !messageText.trim()}
          className={cn(
            "bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy-light hover:to-fixlyfy text-white transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0",
            isMobile ? "min-h-[44px] min-w-[44px] px-3" : "px-6 py-3"
          )}
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {!isMobile && "Sending..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {!isMobile && "Send"}
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
