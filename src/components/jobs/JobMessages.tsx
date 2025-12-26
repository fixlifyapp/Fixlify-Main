import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { supabase } from "@/integrations/supabase/client";
import { JobMessageList } from "./components/JobMessageList";
import { useMessageAI } from "./hooks/messaging/useMessageAI";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface JobMessagesProps {
  jobId: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const { openMessageDialog } = useMessageContext();
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch messages from database
  const fetchMessages = useCallback(async (clientId: string) => {
    try {
      // First, find conversation for this job or client
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`job_id.eq.${jobId},client_id.eq.${clientId}`)
        .maybeSingle();

      if (conversation) {
        // Fetch messages for this conversation
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });

        if (messagesData && messagesData.length > 0) {
          setMessages(messagesData.map(msg => ({
            id: msg.id,
            body: msg.body,
            direction: msg.direction,
            created_at: msg.created_at,
            sender: msg.sender,
            recipient: msg.recipient,
            status: msg.status
          })));
          return;
        }
      }

      // Also check communication_logs for email communications
      const { data: commLogs } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (commLogs && commLogs.length > 0) {
        setMessages(commLogs.map(log => ({
          id: log.id,
          body: log.message_body || log.subject || 'Communication',
          direction: log.direction || 'outbound',
          created_at: log.created_at,
          sender: log.direction === 'inbound' ? client.name : 'You',
          recipient: log.direction === 'inbound' ? 'You' : client.name,
          status: log.status,
          type: log.type
        })));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  }, [jobId]);

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

          // Fetch actual messages from database
          await fetchMessages(clientData.id);
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
  }, [jobId, fetchMessages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!client.id) return;

    const channel = supabase
      .channel(`job-messages-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch messages when changes occur
          fetchMessages(client.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs',
          filter: `client_id=eq.${client.id}`
        },
        () => {
          // Refetch when communication logs change
          fetchMessages(client.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client.id, jobId, fetchMessages]);

  const handleOpenMessages = () => {
    if (client.id) {
      openMessageDialog(client);
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
                onClick={() => handleSuggestResponse()}
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