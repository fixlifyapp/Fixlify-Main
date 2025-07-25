import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Send, Archive, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSMS } from "@/contexts/SMSContext";
import { ConversationThread } from "./components/ConversationThread";
import { MessageInput } from "./components/MessageInput";
import { NewConversationDialog } from "@/components/connect-center/NewConversationDialog";

export const MessagesListWrapper = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    messages, 
    isLoading,
    isSending,
    setActiveConversation,
    sendMessage,
    markAsRead
  } = useSMS();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  // Mark conversation as read when selected
  useEffect(() => {
    if (activeConversation?.id && activeConversation.unread_count > 0) {
      markAsRead(activeConversation.id);
    }
  }, [activeConversation?.id]);

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.client?.name?.toLowerCase().includes(searchLower) ||
      conv.client_phone?.includes(searchQuery) ||
      conv.last_message_preview?.toLowerCase().includes(searchLower)
    );
  });

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;
    await sendMessage(activeConversation.id, content);
  };

  return (
    <div className="flex h-[calc(100vh-250px)] gap-4">
      {/* Conversations List */}
      <div className="w-1/3 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              size="icon"
              onClick={() => setIsNewConversationOpen(true)}
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium">
                      {conversation.client?.name || conversation.client_phone}
                    </h4>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  {conversation.last_message_preview && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message_preview}
                    </p>
                  )}
                  {conversation.last_message_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Messages View */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {activeConversation.client?.name || activeConversation.client_phone}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.client_phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ConversationThread 
              messages={messages}
              isLoading={isLoading}
              currentUserPhone={activeConversation.phone_number}
            />

            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isSending}
              placeholder="Type a message..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>

      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
      />
    </div>
  );
};
