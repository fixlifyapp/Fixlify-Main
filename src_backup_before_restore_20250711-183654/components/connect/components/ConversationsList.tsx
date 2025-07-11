
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Loader2, RefreshCw, Archive } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConversationsListProps {
  conversations: any[];
  selectedConversation: any;
  onConversationSelect: (conversation: any) => void;
  isLoading: boolean;
  onRefresh: () => void;
  hideSearch?: boolean;
}

export const ConversationsList = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading,
  onRefresh,
  hideSearch = false
}: ConversationsListProps) => {
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch {
      return '';
    }
  };

  const handleArchiveConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivedConversations(prev => new Set([...prev, conversationId]));
    toast.success("Conversation archived");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-fixlyfy mx-auto mb-2" />
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary`}>
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  const visibleConversations = conversations.filter(conv => !archivedConversations.has(conv.id));

  if (visibleConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="bg-fixlyfy/10 rounded-full p-4 mb-4">
          <MessageSquare className="h-8 w-8 text-fixlyfy" />
        </div>
        <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-fixlyfy-text mb-2`}>
          No conversations yet
        </h3>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-fixlyfy-text-secondary mb-4 max-w-xs`}>
          Search for a client above to start a new conversation or wait for incoming messages.
        </p>
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          className={`gap-2 ${isMobile ? 'min-h-[44px]' : ''}`}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className={`${isMobile ? 'p-2' : 'p-3'} space-y-1`}>
        {visibleConversations.map((conversation) => {
          const isSelected = selectedConversation?.id === conversation.id;
          const lastMessage = conversation.lastMessage || 'No messages yet';
          const truncatedMessage = lastMessage.length > (isMobile ? 40 : 60) 
            ? lastMessage.substring(0, isMobile ? 40 : 60) + "..."
            : lastMessage;

          return (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-200 border group hover:shadow-sm",
                isMobile ? "min-h-[72px]" : "min-h-[80px]",
                isSelected 
                  ? "bg-fixlyfy/10 border-fixlyfy/30 shadow-sm" 
                  : "hover:bg-fixlyfy/5 border-transparent hover:border-fixlyfy/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} border border-fixlyfy/20`}>
                    <AvatarFallback className="bg-gradient-primary text-white font-medium text-sm">
                      {conversation.client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-fixlyfy text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={cn(
                      "font-medium text-fixlyfy-text truncate",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {conversation.client.name}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={cn(
                        "text-fixlyfy-text-muted whitespace-nowrap",
                        isMobile ? "text-xs" : "text-xs"
                      )}>
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                  </div>

                  {conversation.client.phone && (
                    <p className={cn(
                      "text-fixlyfy-text-secondary mb-1 flex items-center gap-1 truncate",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{conversation.client.phone}</span>
                    </p>
                  )}

                  <p className={cn(
                    "text-fixlyfy-text-secondary truncate",
                    isMobile ? "text-xs" : "text-sm",
                    conversation.unreadCount > 0 && "font-medium"
                  )}>
                    {truncatedMessage}
                  </p>
                </div>

                {/* Archive button - hidden on mobile for cleaner look */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleArchiveConversation(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
