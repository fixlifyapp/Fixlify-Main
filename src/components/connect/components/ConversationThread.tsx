import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Phone, Mail, User, CheckCheck, Check, X, Clock, MoreVertical, MessageSquare, Loader2, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationInputPanel } from "./ConversationInputPanel";
import { AIWritingAssistant } from "./AIWritingAssistant";
import { useSMS } from "@/contexts/SMSContext";
import { linkifyText } from "@/utils/linkify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  content: string;
  status: string;
  created_at: string;
}

interface ConversationThreadProps {
  messages: Message[];
  clientName: string;
  client?: any;
  onArchive?: () => void;
}

export const ConversationThread = ({ messages, clientName, client, onArchive }: ConversationThreadProps) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {
    activeConversation,
    sendMessage,
    isSending,
    hasMoreMessages,
    loadingMoreMessages,
    loadMoreMessages,
    totalMessageCount
  } = useSMS();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages change (new message arrives)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length, messages[messages.length - 1]?.id]);

  // Build conversation context for AI assistant
  const conversationContext = messages
    .slice(-5)
    .map(m => `${m.direction === 'inbound' ? 'Client' : 'You'}: ${m.content}`)
    .join('\n');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'failed':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': 
        return 'text-green-500';
      case 'sent':
        return 'text-blue-500';
      case 'failed': 
        return 'text-red-500';
      case 'pending': 
        return 'text-gray-400';
      default: 
        return 'text-gray-400';
    }
  };

  const handleSendMessage = async () => {
    if (activeConversation?.id && messageText.trim()) {
      await sendMessage(activeConversation.id, messageText);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    setMessageText(suggestion);
  };

  return (
    <Card className="h-full flex flex-col min-h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white font-medium">
              {clientName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold">{clientName}</h3>
              {client && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Send a message to start!</p>
              </div>
            ) : (
              <>
                {/* Load More Button (for older messages) */}
                {hasMoreMessages && (
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadMoreMessages}
                      disabled={loadingMoreMessages}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 gap-2"
                    >
                      {loadingMoreMessages ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <History className="h-3.5 w-3.5" />
                          Load Earlier Messages ({totalMessageCount - messages.length} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`
                      max-w-[70%] rounded-2xl px-4 py-2
                      ${message.direction === 'outbound'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {linkifyText(message.content)}
                    </p>
                    <div className={`
                      flex items-center gap-2 mt-1 text-xs
                      ${message.direction === 'outbound' ? 'text-violet-100' : 'text-gray-500'}
                    `}>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                      {message.direction === 'outbound' && (
                        <span className={`flex items-center gap-1 ${getStatusColor(message.status)}`}>
                          {getStatusIcon(message.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
        
        {/* AI Writing Assistant */}
        <AIWritingAssistant
          onUseSuggestion={handleAISuggestion}
          clientName={clientName}
          conversationContext={conversationContext}
          disabled={isSending || !activeConversation}
        />

        {/* AI-Enhanced Message Input */}
        <ConversationInputPanel
          messageText={messageText}
          setMessageText={setMessageText}
          onSendMessage={handleSendMessage}
          onKeyDown={handleKeyDown}
          isSending={isSending}
        />
      </CardContent>
    </Card>
  );
};