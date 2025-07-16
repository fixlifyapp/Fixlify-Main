
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface EmailThreadViewProps {
  selectedConversation: EmailConversation | null;
}

export const EmailThreadView = ({ selectedConversation }: EmailThreadViewProps) => {
  const [isCallingLoading, setIsCallingLoading] = useState(false);
  const isMobile = useIsMobile();

  const formatEmailTime = (timestamp: string) => {
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
    if (!selectedConversation?.client?.phone) {
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

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-fixlyfy/5 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-fixlyfy/10 rounded-full mx-auto mb-6 flex items-center justify-center"
               style={{ width: isMobile ? '80px' : '96px', height: isMobile ? '80px' : '96px', padding: isMobile ? '20px' : '24px' }}>
            <Mail className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-fixlyfy`} />
          </div>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-fixlyfy-text mb-3`}>
            Select an Email Conversation
          </h3>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-fixlyfy-text-secondary leading-relaxed`}>
            Choose an existing email conversation from the left sidebar, or click "New" to start a new email conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Email Header */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-fixlyfy-border bg-gradient-to-r from-white to-fixlyfy/5 flex-shrink-0`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} border-2 border-fixlyfy/20 flex-shrink-0`}>
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                {selectedConversation.client?.name?.substring(0, 2).toUpperCase() || 'NC'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-fixlyfy-text truncate`}>
                {selectedConversation.client?.name || 'New Client'}
              </h3>
              {selectedConversation.client?.email && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary flex items-center gap-1 truncate`}>
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedConversation.client.email}</span>
                </p>
              )}
              {selectedConversation.client?.phone && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary flex items-center gap-1 truncate`}>
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedConversation.client.phone}</span>
                </p>
              )}
            </div>
          </div>
          <div className={`flex gap-1 flex-shrink-0 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            {selectedConversation.client?.phone && (
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
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"} 
              className={`gap-2 border-fixlyfy-border hover:bg-fixlyfy/5 ${isMobile ? 'min-h-[44px] px-3' : ''}`}
              onClick={() => window.open(`/connect?tab=messages&clientId=${selectedConversation.client?.id}&clientName=${selectedConversation.client?.name}&clientPhone=${selectedConversation.client?.phone}&autoOpen=true`, '_blank')}
            >
              <MessageSquare className="h-4 w-4" />
              {!isMobile && "Message"}
            </Button>
          </div>
        </div>
      </div>

      {/* Email Display Area */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-3 bg-fixlyfy-bg-interface`}>
        {(!selectedConversation.emails || selectedConversation.emails.length === 0) ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm"
                   style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', padding: isMobile ? '12px' : '16px' }}>
                <Mail className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-fixlyfy-text-muted`} />
              </div>
              <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-fixlyfy-text mb-2`}>
                Start the email conversation
              </h4>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary`}>
                Send your first email to {selectedConversation.client?.name || 'this client'}
              </p>
            </div>
          </div>
        ) : (
          selectedConversation.emails.map((email: any) => {
            const isFromClient = email.direction === 'inbound';
            const displaySender = isFromClient ? (selectedConversation.client?.name || 'Client') : 'You';
            
            return (
              <div
                key={email.id}
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
                      ? (selectedConversation.client?.name?.substring(0, 2).toUpperCase() || 'CL')
                      : 'ME'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col min-w-0",
                  isMobile ? "max-w-[85%]" : "max-w-[75%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl shadow-sm border",
                    isMobile ? "max-w-[280px]" : "max-w-none",
                    isFromClient 
                      ? "bg-white text-fixlyfy-text rounded-bl-md border-fixlyfy-border/50" 
                      : "bg-fixlyfy text-white rounded-br-md border-fixlyfy"
                  )}>
                    {email.subject && (
                      <div className={cn(
                        "font-semibold mb-2 pb-2 border-b",
                        isMobile ? "text-xs" : "text-sm",
                        isFromClient ? "border-fixlyfy-border/30" : "border-white/30"
                      )}>
                        {email.subject}
                      </div>
                    )}
                    <div 
                      className={cn(
                        "break-words leading-relaxed overflow-hidden",
                        isMobile ? "text-xs" : "text-sm"
                      )}
                      dangerouslySetInnerHTML={{ 
                        __html: email.body_html || email.body_text || email.body || 'No content'
                      }}
                    />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs text-fixlyfy-text-muted flex-wrap",
                    !isFromClient && "flex-row-reverse"
                  )}>
                    <span className="font-medium whitespace-nowrap">{displaySender}</span>
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{formatEmailTime(email.created_at)}</span>
                    {!isFromClient && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-xs whitespace-nowrap",
                        email.delivery_status === 'delivered' ? "bg-fixlyfy-success/20 text-fixlyfy-success" :
                        email.delivery_status === 'sent' ? "bg-fixlyfy-info/20 text-fixlyfy-info" :
                        email.delivery_status === 'failed' ? "bg-fixlyfy-error/20 text-fixlyfy-error" :
                        "bg-fixlyfy-warning/20 text-fixlyfy-warning"
                      )}>
                        {email.delivery_status || 'sending'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
