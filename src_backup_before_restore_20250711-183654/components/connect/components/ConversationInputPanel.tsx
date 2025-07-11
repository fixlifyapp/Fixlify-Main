
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageTextEnhancer } from "./MessageTextEnhancer";

interface ConversationInputPanelProps {
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isSending: boolean;
}

export const ConversationInputPanel = ({ 
  messageText, 
  setMessageText, 
  onSendMessage, 
  onKeyDown, 
  isSending 
}: ConversationInputPanelProps) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="h-full bg-gradient-to-r from-white to-fixlyfy-bg-interface border-t border-fixlyfy-border/50 p-4 flex flex-col">
      <form onSubmit={handleFormSubmit} className="h-full flex flex-col gap-3">
        <div className="flex-1 relative">
          <textarea 
            className="w-full h-full p-4 pr-12 border border-fixlyfy-border/50 rounded-lg focus:ring-2 focus:ring-fixlyfy/50 focus:border-fixlyfy focus:outline-none resize-none transition-all duration-200 bg-white shadow-sm min-h-[120px]" 
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={isSending}
            onKeyDown={onKeyDown}
          />
          <div className="absolute right-3 top-3">
            <MessageTextEnhancer 
              messageText={messageText}
              setMessageText={setMessageText}
              disabled={isSending}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isSending || !messageText.trim()}
            className="px-8 py-3 bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy-light hover:to-fixlyfy text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
