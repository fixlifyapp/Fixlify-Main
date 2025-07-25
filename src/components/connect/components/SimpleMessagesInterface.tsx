import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Plus, Archive, Phone, User } from "lucide-react";
import { useSMS } from "@/contexts/SMSContext";
import { ConversationThread } from "./ConversationThread";
import { ConnectMessageDialog } from "./ConnectMessageDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export const SimpleMessagesInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const { 
    conversations, 
    activeConversation, 
    messages,
    isLoading,
    fetchConversations, 
    setActiveConversation,
    fetchMessages,
    markAsRead
  } = useSMS();

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
      markAsRead(activeConversation.id);
    }
  }, [activeConversation?.id, fetchMessages, markAsRead]);

  const filteredConversations = conversations.filter(conv => {
    // Filter by archived status
    const isArchived = conv.status === 'archived';
    if (showArchived !== isArchived) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.client?.name?.toLowerCase().includes(query) ||
        conv.client?.phone?.includes(searchQuery) ||
        conv.client_phone?.includes(searchQuery) ||
        conv.phone_number?.includes(searchQuery)
      );
    }
    
    return true;
  });

  const handleArchiveConversation = async (conversationId: string) => {
    // TODO: Implement archive functionality
    console.log('Archive conversation:', conversationId);
  };

  const handleSelectConversation = (conversation: any) => {
    setActiveConversation(conversation);
  };

  const formatLastMessage = (conversation: any) => {
    if (!conversation.last_message_at) return null;
    
    const date = new Date(conversation.last_message_at);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1 p-0 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </h3>
            <div className="flex gap-2">
              <Button
                variant={showArchived ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setShowNewMessageDialog(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="h-[500px]">
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery 
                    ? 'No conversations found' 
                    : showArchived 
                      ? 'No archived conversations' 
                      : 'No active conversations'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all mb-2
                    ${activeConversation?.id === conversation.id 
                      ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {conversation.client?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {conversation.client?.name || 'Unknown'}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {conversation.client?.phone || conversation.client_phone}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-[20px] px-1">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      {conversation.last_message_preview && (
                        <p className="text-sm text-gray-500 truncate mt-1 ml-10">
                          {conversation.last_message_preview}
                        </p>
                      )}
                    </div>
                    {conversation.last_message_at && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatLastMessage(conversation)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Conversation Thread */}
      <div className="lg:col-span-2">
        {activeConversation ? (
          <ConversationThread
            messages={messages}
            clientName={activeConversation.client?.name || 'Unknown'}
            client={activeConversation.client}
            onArchive={() => handleArchiveConversation(activeConversation.id)}
          />
        ) : (
          <Card className="h-full min-h-[600px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
              <p className="text-sm mt-2">Or start a new conversation</p>
              <Button
                onClick={() => setShowNewMessageDialog(true)}
                className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* New Message Dialog */}
      <ConnectMessageDialog
        isOpen={showNewMessageDialog}
        onClose={() => setShowNewMessageDialog(false)}
      />
    </div>
  );
};