
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { supabase } from "@/integrations/supabase/client";
import { JobMessageList } from "./components/JobMessageList";
import { useMessageAI } from "./hooks/messaging/useMessageAI";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface JobMessagesProps {
  jobId: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const { openMessageDialog, conversations } = useMessageContext();
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      try {
        const { data: job } = await supabase
          .from('jobs')
          .select(`
            *,
            clients:client_id(*)
          `)
          .eq('id', jobId)
          .single();

        if (job?.clients) {
          const clientData = {
            name: job.clients.name,
            phone: job.clients.phone || "",
            id: job.clients.id,
            email: job.clients.email || ""
          };
          setClient(clientData);

          const clientConversation = conversations.find(conv => conv.client?.id === clientData.id);
          if (clientConversation && 'messages' in clientConversation) {
            setMessages(clientConversation.messages || []);
          } else {
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId, conversations]);

  const handleOpenMessages = () => {
    if (client.id) {
      openMessageDialog(client, jobId);
    }
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages,
    client,
    jobId,
    onUseSuggestion: () => {}
  });

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Messages</h3>
              {client.name && (
                <p className="text-sm text-muted-foreground">
                  Conversation with {client.name}
                  {client.phone && ` (${client.phone})`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestResponse}
                disabled={isAILoading || isLoading || messages.length === 0}
                className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {isAILoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Response
                  </>
                )}
              </Button>
              <Button
                onClick={handleOpenMessages}
                disabled={!client.id}
                size="sm"
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Open Messages
              </Button>
            </div>
          </div>
        </div>

        <JobMessageList 
          messages={messages}
          isLoading={isLoading}
          clientName={client.name}
        />
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Use the unified message dialog to send messages
          </p>
          <Button onClick={handleOpenMessages} variant="outline" size="sm">
            Open Message Dialog
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
