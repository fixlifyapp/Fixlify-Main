
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { MessageTextEnhancer } from "./MessageTextEnhancer";

interface ConnectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: any;
}

export const ConnectMessageDialog = ({ isOpen, onClose, conversation }: ConnectMessageDialogProps) => {
  const { activeConversation, sendMessage, isSending } = useMessageContext();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use activeConversation from context if available, otherwise fall back to prop
  const currentConversation = activeConversation || conversation;

  const handleUseSuggestion = (content: string) => {
    setMessageText(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: currentConversation?.messages || [],
    client: currentConversation?.client || { name: "", id: "" },
    jobId: '',
    onUseSuggestion: handleUseSuggestion
  });

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    // Fallback to the ref method
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when dialog opens or messages change
  useEffect(() => {
    if (isOpen) {
      // Multiple attempts to ensure scrolling works
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 150);
      setTimeout(scrollToBottom, 300);
    }
  }, [isOpen]);

  // Scroll when messages change
  useEffect(() => {
    if (isOpen && currentConversation?.messages?.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [currentConversation?.messages?.length, isOpen]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending || !currentConversation) return;
    
    await sendMessage(currentConversation.id, messageText);
    setMessageText("");
    // Scroll to bottom after sending message
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Convert messages to the format expected by UnifiedMessageList
  const convertMessagesToUnified = (messages: any[]) => {
    if (!messages) return [];
    
    // Check if messages are already in the correct format (from MessageContext)
    if (messages.length > 0 && messages[0].body !== undefined) {
      return messages;
    }
    
    // Convert from connect center format to unified format
    return messages.map(msg => ({
      id: msg.id,
      body: msg.text || msg.body,
      direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
      created_at: msg.timestamp || msg.created_at,
      sender: msg.sender,
      recipient: undefined
    }));
  };

  if (!currentConversation) return null;

  const unifiedMessages = convertMessagesToUnified(currentConversation.messages || []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Message {currentConversation.client.name}
            {currentConversation.client.phone && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({currentConversation.client.phone})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
          >
            <UnifiedMessageList 
              messages={unifiedMessages}
              isLoading={false}
              clientName={currentConversation.client.name}
              clientInfo={currentConversation.client}
            />
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex-shrink-0 space-y-3">
            <div className="flex justify-between items-center">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSuggestResponse}
                disabled={isAILoading || isSending}
                className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {isAILoading ? (
                  <>
                    <Bot className="h-4 w-4 animate-pulse" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Response
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSend} 
                disabled={isSending || !messageText.trim()}
                size="sm"
                className="px-4"
              >
                <Send size={16} />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea 
                  className="w-full p-4 pr-12 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-y min-h-[120px] text-base" 
                  placeholder="Type your message... (Press Shift+Enter for new line, Enter to send)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSending}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-3 top-3">
                  <MessageTextEnhancer 
                    messageText={messageText}
                    setMessageText={setMessageText}
                    disabled={isSending}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
