
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailThreadProps {
  selectedConversation: any;
}

export const EmailThread = ({ selectedConversation }: EmailThreadProps) => {
  const [isCallingLoading, setIsCallingLoading] = useState(false);

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

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-fixlyfy/5">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-fixlyfy/10 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <Mail className="h-12 w-12 text-fixlyfy" />
          </div>
          <h3 className="text-xl font-semibold text-fixlyfy-text mb-3">Welcome to Email</h3>
          <p className="text-fixlyfy-text-secondary leading-relaxed">
            Select an existing email conversation from the left sidebar, or click "New" to start a new email conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Email Header */}
      <div className="flex-shrink-0 p-4 border-b border-fixlyfy-border bg-gradient-to-r from-white to-fixlyfy/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Avatar className="h-12 w-12 border-2 border-fixlyfy/20 flex-shrink-0">
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg">
                {selectedConversation.client?.name?.substring(0, 2).toUpperCase() || 'NC'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-fixlyfy-text truncate">
                {selectedConversation.client?.name || 'New Client'}
              </h3>
              {selectedConversation.client?.email && (
                <p className="text-sm text-fixlyfy-text-secondary flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedConversation.client.email}</span>
                </p>
              )}
              {selectedConversation.client?.phone && (
                <p className="text-sm text-fixlyfy-text-secondary flex items-center gap-1 truncate">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedConversation.client.phone}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {selectedConversation.client?.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-fixlyfy-border hover:bg-fixlyfy/5"
                onClick={handleCall}
                disabled={isCallingLoading}
              >
                {isCallingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Email Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-fixlyfy-bg-interface">
        {(!selectedConversation.emails || selectedConversation.emails.length === 0) ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="bg-white rounded-full p-6 mx-auto mb-4 w-16 h-16 flex items-center justify-center shadow-sm">
                <Mail className="h-8 w-8 text-fixlyfy-text-muted" />
              </div>
              <h4 className="font-medium text-fixlyfy-text mb-2">Start the email conversation</h4>
              <p className="text-fixlyfy-text-secondary text-sm">
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
                  "flex gap-3 animate-fade-in",
                  !isFromClient && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
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
                  "flex flex-col max-w-[75%] min-w-0",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm border",
                    isFromClient 
                      ? "bg-white text-fixlyfy-text rounded-bl-md border-fixlyfy-border/50" 
                      : "bg-fixlyfy text-white rounded-br-md border-fixlyfy"
                  )}>
                    {email.subject && (
                      <div className={cn(
                        "font-semibold text-sm mb-2 pb-2 border-b",
                        isFromClient ? "border-fixlyfy-border/30" : "border-white/30"
                      )}>
                        {email.subject}
                      </div>
                    )}
                    <div 
                      className="text-sm break-words leading-relaxed overflow-hidden"
                      dangerouslySetInnerHTML={{ 
                        __html: email.body_html || email.body_text || email.body || 'No content'
                      }}
                    />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs text-fixlyfy-text-muted",
                    !isFromClient && "flex-row-reverse"
                  )}>
                    <span className="font-medium">{displaySender}</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatEmailTime(email.created_at)}</span>
                    {!isFromClient && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-xs",
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
