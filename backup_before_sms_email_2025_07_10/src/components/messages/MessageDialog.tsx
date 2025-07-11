
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageInput } from "./MessageInput";
import { UnifiedMessageList } from "./UnifiedMessageList";
import { useMessageDialog } from "./hooks/useMessageDialog";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone?: string;
    id?: string;
  };
}

export const MessageDialog = ({ open, onOpenChange, client }: MessageDialogProps) => {
  const {
    message,
    setMessage,
    messages,
    isLoading,
    isLoadingMessages,
    handleSendMessage,
    conversationId
  } = useMessageDialog({ client, open });

  const handleUseSuggestion = (content: string) => {
    setMessage(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: messages.map(msg => ({
      id: msg.id,
      body: msg.text,
      direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
      created_at: msg.timestamp,
      sender: msg.sender
    })),
    client: client,
    jobId: '', // No job context in message dialog
    onUseSuggestion: handleUseSuggestion
  });

  // Prevent form submission from refreshing the page
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSendMessage();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Message {client.name}
            {client.phone && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({client.phone})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto">
            <UnifiedMessageList 
              messages={messages}
              isLoading={isLoadingMessages}
              clientName={client.name}
            />
          </div>
          
          <form onSubmit={handleFormSubmit} className="flex-shrink-0">
            <MessageInput
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              isLoading={isLoading}
              showSuggestResponse={true}
              onSuggestResponse={handleSuggestResponse}
              isAILoading={isAILoading}
              clientInfo={client}
              messages={messages}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
