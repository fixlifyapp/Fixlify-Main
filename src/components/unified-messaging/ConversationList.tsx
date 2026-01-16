import { UnifiedConversation } from "@/types/unified-messaging";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChannelBadge } from "./ChannelBadge";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: UnifiedConversation[];
  activeConversationId?: string;
  onSelect: (conversation: UnifiedConversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading = false,
}: ConversationListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search header */}
      <div className="p-3 border-b bg-white dark:bg-gray-900 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 w-9"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {isLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const hasUnread = conversation.unread_count > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    "p-3 cursor-pointer transition-colors relative",
                    isActive
                      ? "bg-violet-50 dark:bg-violet-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    hasUnread && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                >
                  {/* Unread indicator line */}
                  {hasUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                  )}

                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-white font-medium text-sm",
                          conversation.channel === "sms"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                            : conversation.channel === "email"
                            ? "bg-gradient-to-br from-green-500 to-green-600"
                            : "bg-gradient-to-br from-purple-500 to-purple-600"
                        )}
                      >
                        {getInitials(conversation.client_name || conversation.contact_identifier)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "font-medium text-sm truncate",
                              hasUnread && "font-semibold text-gray-900 dark:text-white"
                            )}
                          >
                            {conversation.client_name || conversation.contact_identifier}
                          </span>
                          <ChannelBadge channel={conversation.channel} showLabel={false} />
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: false,
                          })}
                        </span>
                      </div>

                      {/* Subject (email only) */}
                      {conversation.channel === "email" && conversation.subject && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-0.5">
                          {conversation.subject}
                        </p>
                      )}

                      {/* Preview */}
                      <p
                        className={cn(
                          "text-sm truncate",
                          hasUnread
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-500 dark:text-gray-500"
                        )}
                      >
                        {conversation.last_message_preview || "No messages yet"}
                      </p>

                      {/* Bottom row - badges */}
                      <div className="flex items-center gap-2 mt-1.5">
                        {hasUnread && (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-[10px] bg-red-500"
                          >
                            {conversation.unread_count} new
                          </Badge>
                        )}
                        {conversation.is_starred && (
                          <span className="text-yellow-500 text-xs">★</span>
                        )}
                        {conversation.needsReply && (
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px] border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400"
                          >
                            Reply
                          </Badge>
                        )}
                      </div>
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
}
