import { useState, useRef, useEffect } from "react";
import { UnifiedConversation, UnifiedMessage, SmartReply, OneClickReply as OneClickReplyType } from "@/types/unified-messaging";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelBadge } from "./ChannelBadge";
import { IntentBadge } from "./IntentBadge";
import { SmartReplies } from "./SmartReplies";
import { OneClickAIReply } from "./OneClickAIReply";
import {
  Send,
  Phone,
  Mail,
  MoreVertical,
  Archive,
  Star,
  Loader2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { linkifyText } from "@/utils/linkify";

interface UnifiedConversationThreadProps {
  conversation: UnifiedConversation;
  messages: UnifiedMessage[];
  onSend: (message: string) => void;
  onArchive?: () => void;
  onStar?: (starred: boolean) => void;
  isSending?: boolean;
  isLoadingMessages?: boolean;
  // AI Props
  smartReplies?: SmartReply[];
  isLoadingAI?: boolean;
  onGenerateReplies?: () => void;
  // One-Click AI Reply
  onGenerateOneClickReply?: () => Promise<OneClickReplyType | null>;
}

export function UnifiedConversationThread({
  conversation,
  messages,
  onSend,
  onArchive,
  onStar,
  isSending = false,
  isLoadingMessages = false,
  smartReplies = [],
  isLoadingAI = false,
  onGenerateReplies,
  onGenerateOneClickReply,
}: UnifiedConversationThreadProps) {
  const [messageText, setMessageText] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && scrollAreaRef.current) {
      // Find the viewport element inside ScrollArea (Radix UI structure)
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Helper function to scroll to bottom
        const scrollToBottom = () => {
          viewport.scrollTop = viewport.scrollHeight;
        };

        // Multiple scroll attempts to ensure content is fully rendered
        // First immediate attempt
        scrollToBottom();

        // Second attempt after short delay
        const timer1 = setTimeout(scrollToBottom, 50);

        // Third attempt after longer delay for any async content
        const timer2 = setTimeout(scrollToBottom, 200);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, [messages.length, messages[messages.length - 1]?.id]);

  // Auto-generate smart replies when conversation changes
  useEffect(() => {
    if (onGenerateReplies && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.direction === "inbound") {
        onGenerateReplies();
      }
    }
  }, [conversation.id]);

  const handleSend = () => {
    if (messageText.trim() && !isSending) {
      onSend(messageText.trim());
      setMessageText("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSmartReplySelect = (reply: SmartReply) => {
    setMessageText(reply.text);
    textareaRef.current?.focus();
  };

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
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className={cn(
                  "text-white font-medium",
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

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">
                  {conversation.client_name || conversation.contact_identifier}
                </h3>
                <ChannelBadge channel={conversation.channel} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {conversation.client_phone_formatted && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {conversation.client_phone_formatted}
                  </span>
                )}
                {conversation.client_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {conversation.client_email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onGenerateReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateReplies}
                disabled={isLoadingAI}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              >
                {isLoadingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onStar && (
                  <DropdownMenuItem onClick={() => onStar(!conversation.is_starred)}>
                    <Star
                      className={cn(
                        "h-4 w-4 mr-2",
                        conversation.is_starred && "fill-yellow-400 text-yellow-400"
                      )}
                    />
                    {conversation.is_starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                )}
                {onArchive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isOutbound = message.direction === "outbound";

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5",
                        isOutbound
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      )}
                    >
                      {/* Subject for email */}
                      {message.channel === "email" && message.subject && (
                        <p
                          className={cn(
                            "text-xs font-medium mb-1",
                            isOutbound ? "text-violet-200" : "text-gray-500"
                          )}
                        >
                          {message.subject}
                        </p>
                      )}

                      {/* Message body */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {linkifyText(message.body)}
                      </p>

                      {/* Footer */}
                      <div
                        className={cn(
                          "flex items-center gap-2 mt-1.5 text-xs",
                          isOutbound ? "text-violet-200" : "text-gray-500"
                        )}
                      >
                        <span>
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </span>

                        {/* AI Intent badge */}
                        {message.ai_intent && message.ai_intent !== "unknown" && (
                          <IntentBadge
                            intent={message.ai_intent}
                            confidence={message.ai_confidence || undefined}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Smart Replies */}
        <SmartReplies
          replies={smartReplies}
          onSelect={handleSmartReplySelect}
          onRefresh={onGenerateReplies}
          isLoading={isLoadingAI}
        />

        {/* Input */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-900 space-y-3">
          {/* One-Click AI Reply */}
          {onGenerateOneClickReply && (
            <OneClickAIReply
              onGenerate={onGenerateOneClickReply}
              onSend={async (msg) => {
                onSend(msg);
              }}
              onPopulateInput={(text) => {
                setMessageText(text);
                textareaRef.current?.focus();
              }}
              isLoading={isLoadingAI}
              isSending={isSending}
            />
          )}

          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder={`Type a ${conversation.channel === "sms" ? "message" : "reply"}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="min-h-[80px] resize-none bg-white dark:bg-gray-800"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || isSending}
              className="self-end bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-10 px-4"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
