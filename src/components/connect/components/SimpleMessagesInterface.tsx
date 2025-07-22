
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Plus, Archive, Unarchive } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { ConversationThread } from "./ConversationThread";
import { ConnectMessageDialog } from "./ConnectMessageDialog";

export const SimpleMessagesInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const { conversations } = useMessageContext();

  const filteredConversations = conversations.filter(conv => {
    if (showArchived !== conv.archived) return false;
    
    if (searchQuery) {
      return conv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (conv.client.phone && conv.client.phone.includes(searchQuery)) ||
             (conv.client.email && conv.client.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return true;
  });

  const handleArchiveConversation = async (conversationId: string) => {
    // Archive conversation logic would go here
    console.log('Archive conversation:', conversationId);
  };

  const handleRestoreConversation = async (conversationId: string) => {
    // Restore conversation logic would go here
    console.log('Restore conversation:', conversationId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? <Unarchive className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowNewMessageDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {showArchived ? 'No archived conversations' : 'No active conversations'}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClient?.id === conversation.client.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedClient(conversation.client)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{conversation.client.name}</h4>
                        <p className="text-sm text-gray-600">
                          {conversation.client.phone && `📱 ${conversation.client.phone}`}
                          {conversation.client.phone && conversation.client.email && ' • '}
                          {conversation.client.email && `📧 ${conversation.client.email}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Thread */}
      <div className="lg:col-span-2">
        {selectedClient ? (
          <ConversationThread
            client={selectedClient}
            onArchive={() => handleArchiveConversation(selectedClient.id)}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConnectMessageDialog
        isOpen={showNewMessageDialog}
        onClose={() => setShowNewMessageDialog(false)}
      />
    </div>
  );
};
