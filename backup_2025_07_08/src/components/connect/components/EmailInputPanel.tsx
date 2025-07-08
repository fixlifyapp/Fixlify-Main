
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface EmailConversation {
  id: string;
  subject: string;
  last_message_at: string;
  status: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  emails: any[];
}

interface EmailInputPanelProps {
  selectedConversation: EmailConversation | null;
  onEmailSent: () => void;
}

export const EmailInputPanel = ({ selectedConversation, onEmailSent }: EmailInputPanelProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSendEmail = async () => {
    if (!message.trim() || !selectedConversation?.client?.email || isSending) {
      if (!selectedConversation?.client?.email) {
        toast.error("No email address available for this client");
      }
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending email via EmailInputPanel:', {
        client: selectedConversation.client,
        subject,
        message
      });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: selectedConversation.client.email,
          subject: subject || 'Message from Fixlyfy',
          html: message.replace(/\n/g, '<br>'),
          clientId: selectedConversation.client.id
        }
      });

      if (error) throw error;

      setSubject("");
      setMessage("");
      onEmailSent();
      toast.success("Email sent successfully!");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!selectedConversation?.emails?.length) {
      toast.error("No conversation history to generate response from");
      return;
    }

    setIsAILoading(true);
    try {
      const lastEmail = selectedConversation.emails[selectedConversation.emails.length - 1];
      
      // Simple AI response generation (you might want to integrate with an actual AI service)
      const response = `Thank you for your email. I understand your concern and will get back to you shortly with more information.

Best regards,
Fixlyfy Team`;

      setMessage(response);
      toast.success("AI response generated!");
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error("Failed to generate AI response");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendEmail();
    }
  };

  if (!selectedConversation) {
    return (
      <div className={`${isMobile ? 'p-3' : 'p-4'} text-center text-fixlyfy-text-secondary`}>
        <p className={isMobile ? 'text-sm' : 'text-base'}>
          Select a conversation to start composing an email
        </p>
      </div>
    );
  }

  const shouldShowAISuggestion = selectedConversation.emails.length > 0;
  const lastEmail = selectedConversation.emails[selectedConversation.emails.length - 1];
  const showSuggest = shouldShowAISuggestion && lastEmail?.direction === 'inbound';

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-white to-fixlyfy-bg-interface`}>
      {/* AI Suggest Response Button */}
      {showSuggest && (
        <div className="mb-3 flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleAISuggestion}
            disabled={isAILoading || isSending}
            className={`gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 ${isMobile ? 'min-h-[44px] text-sm' : ''}`}
          >
            {isAILoading ? (
              <>
                <Bot className="h-4 w-4 animate-pulse" />
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

      <div className="space-y-3">
        {/* Subject Line */}
        <div>
          <Input
            placeholder="Email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            className={cn(
              "border-fixlyfy-border/50 focus:ring-2 focus:ring-fixlyfy/50 focus:border-fixlyfy",
              isMobile ? "h-10 text-sm" : "h-10"
            )}
          />
        </div>

        {/* Message Body */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Type your email message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              onKeyDown={handleKeyDown}
              className={cn(
                "border-fixlyfy-border/50 focus:ring-2 focus:ring-fixlyfy/50 focus:border-fixlyfy focus:outline-none resize-none transition-all duration-200 bg-white shadow-sm",
                isMobile ? "min-h-[80px] max-h-[120px] text-sm" : "min-h-[100px] max-h-[150px]"
              )}
              rows={isMobile ? 3 : 4}
            />
          </div>
          
          <Button 
            onClick={handleSendEmail}
            disabled={isSending || !message.trim()}
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

        {/* Helper Text */}
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-muted`}>
          {isMobile ? 'Tap' : 'Press'} {isMobile ? 'send' : 'Ctrl+Enter'} to send email
        </p>
      </div>
    </div>
  );
};
