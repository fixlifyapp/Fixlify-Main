import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { linkifyText } from "@/utils/linkify";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageThreadProps {
  selectedConversation: any;
}

export const MessageThread = ({ selectedConversation }: MessageThreadProps) => {
  const [isCallingLoading, setIsCallingLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when conversation changes or new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversation?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedConversation && selectedConversation.messages.length > 0) {
      scrollToBottom();
    }
  }, [selectedConversation?.messages.length]);

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return 'Unknown time';
    }
  };

  const handleCall = async () => {
    if (!selectedConversation?.client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsCallingLoading(true);
    try {
      console.log('Initiating call to:', selectedConversation.client.phone);
      
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: selectedConversation.client.phone,
          clientName: selectedConversation.client.name
        }
      });

      if (error) throw error;

      toast.success(`Calling ${selectedConversation.client.name}...`);
    } catch (error) {
      console.error('Error making call:', error);
      toast.error("Failed to initiate call. Please try again.");
    } finally {
      setIsCallingLoading(false);
    }
  };

  const handleEmail = () => {
    if (!selectedConversation?.client.email) {
      toast.error("No email address available for this client");
      return;
    }

    setIsEmailLoading(true);
    
    // Navigate to Connect Center emails tab with client information
    const params = new URLSearchParams({
      tab: 'emails',
      clientId: selectedConversation.client.id,
      clientName: selectedConversation.client.name,
      clientEmail: selectedConversation.client.email,
      autoOpen: 'true'
    });

    navigate(`/connect?${params.toString()}`);
    toast.success(`Opening email conversation with ${selectedConversation.client.name}`);
    
    // Reset loading state after navigation
    setTimeout(() => setIsEmailLoading(false), 1000);
  };

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-fixlyfy/5 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-fixlyfy/10 rounded-full p-6 mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-fixlyfy" />
          </div>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-fixlyfy-text mb-3`}>
            Welcome to Messages
          </h3>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-fixlyfy-text-secondary leading-relaxed`}>
            Select an existing conversation from the left sidebar, or search for a client above to start a new conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Message Header */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-fixlyfy-border bg-gradient-to-r from-white to-fixlyfy/5 flex-shrink-0`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} border-2 border-fixlyfy/20 flex-shrink-0`}>
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                {selectedConversation.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-fixlyfy-text truncate`}>
                {selectedConversation.client.name}
              </h3>
              {selectedConversation.client.phone && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary flex items-center gap-1 truncate`}>
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedConversation.client.phone}</span>
                </p>
              )}
              {selectedConversation.client.email && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary flex items-center gap-1 truncate`}>
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedConversation.client.email}</span>
                </p>
              )}
            </div>
          </div>
          <div className={`flex gap-1 flex-shrink-0 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            {selectedConversation.client.phone && (
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                className={`gap-2 border-fixlyfy-border hover:bg-fixlyfy/5 ${isMobile ? 'min-h-[44px] px-3' : ''}`}
                onClick={handleCall}
                disabled={isCallingLoading}
              >
                {isCallingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {!isMobile && "Call"}
              </Button>
            )}
            {selectedConversation.client.email && (
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                className={`gap-2 border-fixlyfy-border hover:bg-fixlyfy/5 ${isMobile ? 'min-h-[44px] px-3' : ''}`}
                onClick={handleEmail}
                disabled={isEmailLoading}
              >
                {isEmailLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {!isMobile && "Email"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Display Area */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-3 bg-fixlyfy-bg-interface`}
      >
        {selectedConversation.messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-white rounded-full p-4 mx-auto mb-4 w-12 h-12 flex items-center justify-center shadow-sm">
              <MessageSquare className="h-6 w-6 text-fixlyfy-text-muted" />
            </div>
            <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-fixlyfy-text mb-2`}>
              Start the conversation
            </h4>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary`}>
              Send your first message to {selectedConversation.client.name}
            </p>
          </div>
        ) : (
          <>
            {selectedConversation.messages.map((message: any) => {
            const isFromClient = message.direction === 'inbound';
            const displaySender = isFromClient ? selectedConversation.client.name : 'You';
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 animate-fade-in",
                  !isFromClient && "flex-row-reverse"
                )}
              >
                <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} flex-shrink-0`}>
                  <AvatarFallback className={cn(
                    "text-xs font-medium",
                    isFromClient 
                      ? "bg-fixlyfy-text-muted/20 text-fixlyfy-text" 
                      : "bg-fixlyfy text-white"
                  )}>
                    {isFromClient 
                      ? selectedConversation.client.name.substring(0, 2).toUpperCase()
                      : 'ME'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[85%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl shadow-sm break-words",
                    isMobile ? "max-w-[280px]" : "max-w-none",
                    isFromClient 
                      ? "bg-white text-fixlyfy-text rounded-bl-md border border-fixlyfy-border/50" 
                      : "bg-fixlyfy text-white rounded-br-md"
                  )}>
                    <p className={`${isMobile ? 'text-sm' : 'text-sm'} break-words leading-relaxed`}>
                      {linkifyText(message.body || message.content)}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs text-fixlyfy-text-muted flex-wrap",
                    !isFromClient && "flex-row-reverse"
                  )}>
                    <span className="font-medium whitespace-nowrap">{displaySender}</span>
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{formatMessageTime(message.created_at)}</span>
                    {!isFromClient && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-xs whitespace-nowrap",
                        message.status === 'delivered' ? "bg-fixlyfy-success/20 text-fixlyfy-success" :
                        message.status === 'sent' ? "bg-fixlyfy-info/20 text-fixlyfy-info" :
                        message.status === 'failed' ? "bg-fixlyfy-error/20 text-fixlyfy-error" :
                        "bg-fixlyfy-warning/20 text-fixlyfy-warning"
                      )}>
                        {message.status || 'sending'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
