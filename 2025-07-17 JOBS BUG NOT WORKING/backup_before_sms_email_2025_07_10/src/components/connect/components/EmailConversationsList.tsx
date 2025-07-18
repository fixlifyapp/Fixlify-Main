
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Plus, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface EmailConversationsListProps {
  conversations: EmailConversation[];
  selectedConversation: EmailConversation | null;
  onConversationSelect: (conversation: EmailConversation) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onNewEmail: () => void;
}

export const EmailConversationsList = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading,
  onRefresh,
  onNewEmail
}: EmailConversationsListProps) => {
  const isMobile = useIsMobile();
  
  const getConversationPreview = (conversation: EmailConversation) => {
    const latestEmail = conversation.emails?.[conversation.emails.length - 1];
    if (!latestEmail) return 'No messages yet';
    
    const content = latestEmail.body_text || latestEmail.body_html || 'No content';
    const maxLength = isMobile ? 40 : 80;
    return content.replace(/<[^>]*>/g, '').substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  };

  const getUnreadCount = (conversation: EmailConversation) => {
    return conversation.emails?.filter(email => 
      email.direction === 'inbound' && email.delivery_status !== 'read'
    ).length || 0;
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-fixlyfy mx-auto mb-2" />
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary`}>
              Loading email conversations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className={`${isMobile ? 'p-2' : 'p-3'} border-b border-fixlyfy-border/30 bg-fixlyfy-bg-interface flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-fixlyfy/10 text-fixlyfy">
              {conversations.length}
            </Badge>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary`}>conversations</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className={`${isMobile ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'}`}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={onNewEmail}
              className={`gap-1 bg-fixlyfy hover:bg-fixlyfy-light text-white ${isMobile ? 'h-8 px-2 min-h-[44px]' : 'h-8 px-3'}`}
            >
              <Plus className="h-3 w-3" />
              <span className={`${isMobile ? 'text-xs' : 'text-xs'}`}>New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className={`${isMobile ? 'p-4' : 'p-6'} text-center text-fixlyfy-text-secondary`}>
            <Mail className="h-8 w-8 mx-auto mb-3 text-fixlyfy-text-muted" />
            <p className={`${isMobile ? 'text-sm' : 'text-sm'}`}>No email conversations yet</p>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} mt-1`}>Click "New" to start an email conversation</p>
          </div>
        ) : (
          <div className="space-y-0">
            {conversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "cursor-pointer border-b border-fixlyfy-border/30 hover:bg-fixlyfy/5 transition-colors",
                    isMobile ? "p-3 min-h-[80px]" : "p-3",
                    isSelected && "bg-fixlyfy/10 border-l-2 border-l-fixlyfy"
                  )}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} flex-shrink-0`}>
                      <AvatarFallback className="bg-fixlyfy/20 text-fixlyfy font-medium">
                        {conversation.client?.name?.substring(0, 2).toUpperCase() || 'NC'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className={`font-medium truncate flex-1 text-fixlyfy-text ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {conversation.client?.name || 'Unknown Client'}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {unreadCount > 0 && (
                            <Badge className="bg-fixlyfy text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                          <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-fixlyfy-text-muted`}>
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-fixlyfy-text-secondary mb-1 font-medium truncate`}>
                        {conversation.subject}
                      </div>
                      
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-fixlyfy-text-muted line-clamp-2`}>
                        {getConversationPreview(conversation)}
                      </div>

                      {conversation.client?.email && (
                        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-fixlyfy-text-muted mt-1 truncate`}>
                          {conversation.client.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
