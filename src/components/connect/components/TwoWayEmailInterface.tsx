import { useState, useEffect } from "react";
import { useEmail } from "@/contexts/EmailContext";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Mail, 
  Send, 
  Search, 
  Archive, 
  Trash2, 
  Star,
  Paperclip,
  MoreVertical,
  RefreshCw,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TwoWayEmailInterface() {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    selectedConversation,
    isLoading,
    selectConversation,
    sendEmail,
    archiveConversation,
    deleteConversation,
    refreshConversations
  } = useEmail();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [composeMode, setComposeMode] = useState(false);
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    body: ""
  });
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.email_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendEmail = async () => {
    if (composeMode) {
      // Send new email
      if (!newEmail.to || !newEmail.body) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsSending(true);
      await sendEmail(newEmail.to, newEmail.subject, newEmail.body);
      setNewEmail({ to: "", subject: "", body: "" });
      setComposeMode(false);
      setIsSending(false);
    } else if (selectedConversation && messageInput.trim()) {
      // Reply to existing conversation
      setIsSending(true);
      await sendEmail(
        selectedConversation.email_address,
        `Re: ${selectedConversation.subject}`,
        messageInput
      );
      setMessageInput("");
      setIsSending(false);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-[600px] bg-background rounded-lg overflow-hidden border">
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Email Conversations</h3>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={refreshConversations}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setComposeMode(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No email conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  selectConversation(conversation);
                  setComposeMode(false);
                }}
                className={`p-4 hover:bg-accent cursor-pointer transition-colors border-b
                  ${selectedConversation?.id === conversation.id ? 'bg-accent' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      {getInitials(conversation.email_address)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conversation.client_name || conversation.email_address}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conversation.last_message_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {conversation.subject}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message_preview}
                    </p>
                  </div>
                  
                  {conversation.unread_count > 0 && (
                    <Badge variant="default" className="ml-2">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>
      {/* Email Content Area */}
      <div className="flex-1 flex flex-col">
        {composeMode ? (
          // Compose New Email
          <div className="flex-1 flex flex-col p-6">
            <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium">To</label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Email subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                  className="min-h-[200px] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setComposeMode(false);
                  setNewEmail({ to: "", subject: "", body: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>        ) : selectedConversation ? (
          // Email Thread View
          <>
            <div className="border-b p-4 flex items-center justify-between bg-card">
              <div>
                <h3 className="font-semibold">{selectedConversation.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.client_name || selectedConversation.email_address}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => archiveConversation(selectedConversation.id)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteConversation(selectedConversation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <Card className={`max-w-[70%] p-4 ${
                      message.direction === 'outbound' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(
                              message.direction === 'outbound' 
                                ? message.from_email 
                                : message.from_email
                            )}
                          </AvatarFallback>
                        </Avatar>                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">
                              {message.direction === 'outbound' ? 'You' : message.from_email}
                            </p>
                            <span className="text-xs opacity-70">
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              <span className="text-xs">
                                {message.attachments.length} attachment(s)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your reply..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendEmail();
                    }
                  }}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  onClick={handleSendEmail}
                  disabled={!messageInput.trim() || isSending}
                  className="self-end"
                >
                  {isSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // No Conversation Selected
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation or compose a new email</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}