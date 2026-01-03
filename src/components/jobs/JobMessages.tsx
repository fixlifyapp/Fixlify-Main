import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Phone, Mail, ExternalLink, History } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { supabase } from "@/integrations/supabase/client";
import { useMessageAI } from "./hooks/messaging/useMessageAI";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  body: string;
  direction: string;
  created_at: string;
  sender?: string;
  recipient?: string;
  status?: string;
  type?: string;
  job_id?: string;
  job_title?: string;
}

interface JobMessagesProps {
  jobId: string;
  embedded?: boolean;
}

export const JobMessages = ({ jobId, embedded = false }: JobMessagesProps) => {
  const navigate = useNavigate();
  const { openMessageDialog } = useMessageContext();
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);

  // Fetch ALL messages for this client (across all jobs)
  const fetchAllClientMessages = useCallback(async (clientId: string, clientName: string) => {
    try {
      const allMessages: Message[] = [];

      // 1. Fetch ALL conversations for this client
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          id,
          job_id,
          jobs:job_id(title)
        `)
        .eq('client_id', clientId);

      if (conversations && conversations.length > 0) {
        setTotalConversations(conversations.length);

        // Fetch messages from all conversations
        const conversationIds = conversations.map(c => c.id);
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: true });

        if (messagesData) {
          // Map messages with job info
          const conversationJobMap = new Map(
            conversations.map(c => [c.id, { job_id: c.job_id, job_title: (c.jobs as any)?.title }])
          );

          messagesData.forEach(msg => {
            const jobInfo = conversationJobMap.get(msg.conversation_id);
            allMessages.push({
              id: msg.id,
              body: msg.body,
              direction: msg.direction,
              created_at: msg.created_at,
              sender: msg.sender,
              recipient: msg.recipient,
              status: msg.status,
              type: 'sms',
              job_id: jobInfo?.job_id,
              job_title: jobInfo?.job_title
            });
          });
        }
      }

      // 2. Fetch ALL communication_logs for this client
      const { data: commLogs } = await supabase
        .from('communication_logs')
        .select(`
          *,
          jobs:job_id(title)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (commLogs && commLogs.length > 0) {
        commLogs.forEach(log => {
          allMessages.push({
            id: log.id,
            body: log.message_body || log.subject || 'Communication',
            direction: log.direction || 'outbound',
            created_at: log.created_at,
            sender: log.direction === 'inbound' ? clientName : 'You',
            recipient: log.direction === 'inbound' ? 'You' : clientName,
            status: log.status,
            type: log.communication_type || log.type || 'email',
            job_id: log.job_id,
            job_title: (log.jobs as any)?.title
          });
        });
      }

      // Sort all messages by date
      allMessages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(allMessages);
    } catch (error) {
      console.error("Error fetching client messages:", error);
      setMessages([]);
    }
  }, []);

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

          // Fetch ALL messages for this client
          await fetchAllClientMessages(clientData.id, clientData.name);
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
  }, [jobId, fetchAllClientMessages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!client.id) return;

    const channel = supabase
      .channel(`client-messages-${client.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchAllClientMessages(client.id, client.name);
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
          fetchAllClientMessages(client.id, client.name);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client.id, client.name, fetchAllClientMessages]);

  const handleOpenMessages = () => {
    if (client.id) {
      openMessageDialog(client);
    }
  };

  const handleViewClientPage = () => {
    if (client.id) {
      navigate(`/clients/${client.id}`);
    }
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages,
    client,
    jobId,
    onUseSuggestion: () => {}
  });

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: Date; messages: Message[] }[] = [];
    let currentGroup: { date: Date; messages: Message[] } | null = null;

    msgs.forEach(msg => {
      const msgDate = new Date(msg.created_at);
      if (!currentGroup || !isSameDay(currentGroup.date, msgDate)) {
        currentGroup = { date: msgDate, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    });

    return groups;
  };

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const getTypeIcon = (type?: string) => {
    if (type === 'email') return <Mail className="h-3 w-3" />;
    return <Phone className="h-3 w-3" />;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-slate-200">
            <AvatarFallback className="bg-slate-100 text-slate-700 font-medium">
              {client.name?.substring(0, 2).toUpperCase() || 'CL'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{client.name || 'Client'}</h3>
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  <History className="h-3 w-3 mr-1" />
                  {messages.length} messages
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
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
          </div>
        </div>

        {!embedded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewClientPage}
            className="text-slate-500 hover:text-slate-700"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Client
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto max-h-80 space-y-4 mb-4 pr-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Start a conversation with {client.name}</p>
          </div>
        ) : (
          messageGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-medium text-slate-400 px-2">
                  {formatDateHeader(group.date)}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isFromClient = message.direction === 'inbound';
                  const isCurrentJob = message.job_id === jobId;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        !isFromClient && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className={cn(
                          "text-xs font-medium",
                          isFromClient
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-800 text-white"
                        )}>
                          {isFromClient ? client.name?.substring(0, 2).toUpperCase() : 'ME'}
                        </AvatarFallback>
                      </Avatar>

                      <div className={cn(
                        "flex flex-col max-w-[80%]",
                        !isFromClient && "items-end"
                      )}>
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm",
                          isFromClient
                            ? "bg-slate-100 text-slate-800 rounded-bl-sm"
                            : "bg-slate-800 text-white rounded-br-sm"
                        )}>
                          <p className="break-words whitespace-pre-wrap">{message.body}</p>
                        </div>

                        <div className={cn(
                          "flex items-center gap-2 mt-1 text-xs text-slate-400",
                          !isFromClient && "flex-row-reverse"
                        )}>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(message.type)}
                            {formatTime(message.created_at)}
                          </span>

                          {message.status && !isFromClient && (
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", getStatusColor(message.status))}>
                              {message.status}
                            </Badge>
                          )}

                          {message.job_title && !isCurrentJob && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300">
                              {message.job_title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with actions */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Full conversation history with this client
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestResponse()}
            disabled={isAILoading || isLoading || messages.length === 0}
            className="gap-1.5 text-xs h-8 border-slate-200 hover:bg-slate-50"
          >
            {isAILoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            )}
            AI
          </Button>
          <Button
            onClick={handleOpenMessages}
            size="sm"
            className="gap-1.5 text-xs h-8 bg-slate-800 hover:bg-slate-700"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        {content}
      </CardContent>
    </Card>
  );
};
