import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Sparkles, Phone, Mail, ExternalLink, History,
  Send, X, Loader2
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMessageAI } from "./hooks/messaging/useMessageAI";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

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
  conversation_id?: string;
}

const PAGE_SIZE = 15;

interface JobMessagesProps {
  jobId: string;
  embedded?: boolean;
}

type MessageChannel = 'sms' | 'email';

export const JobMessages = ({ jobId, embedded = false }: JobMessagesProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Two-way messaging state
  const [messageText, setMessageText] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [channel, setChannel] = useState<MessageChannel>('sms');
  const [isSending, setIsSending] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [hasOrgPhone, setHasOrgPhone] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if organization has a phone number configured
  useEffect(() => {
    const checkOrgPhone = async () => {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) {
          const { data: phones } = await supabase
            .from('phone_numbers')
            .select('id')
            .eq('organization_id', profile.organization_id)
            .in('status', ['active', 'purchased'])
            .limit(1);

          setHasOrgPhone(phones && phones.length > 0);
        } else {
          setHasOrgPhone(false);
        }
      } catch (err) {
        console.error('Error checking org phone:', err);
        setHasOrgPhone(false);
      }
    };
    checkOrgPhone();
  }, [user?.id]);

  // Normalize phone number for database query
  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
  };

  // Fetch messages from unified sms_messages table (with pagination)
  const fetchClientMessages = useCallback(async (
    clientPhone: string,
    clientName: string,
    offset: number = 0,
    append: boolean = false
  ) => {
    try {
      if (!clientPhone) {
        setMessages([]);
        setHasMore(false);
        return;
      }

      const normalizedPhone = normalizePhone(clientPhone);

      // Find all conversations for this client's phone number
      const { data: conversations } = await supabase
        .from('sms_conversations')
        .select('id, client_id')
        .or(`client_phone.ilike.%${normalizedPhone}%,client_phone.eq.+1${normalizedPhone}`);

      if (!conversations || conversations.length === 0) {
        if (!append) {
          setMessages([]);
          setTotalCount(0);
          setHasMore(false);
        }
        return;
      }

      const conversationIds = conversations.map(c => c.id);

      // Get total count first
      const { count } = await supabase
        .from('sms_messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds);

      setTotalCount(count || 0);

      // Fetch messages with pagination (newest first for initial load, then we reverse)
      const { data: smsMessages, error } = await supabase
        .from('sms_messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      if (smsMessages && smsMessages.length > 0) {
        // Transform to Message format and reverse for display (oldest first)
        const transformedMessages: Message[] = smsMessages
          .reverse()
          .map(msg => ({
            id: msg.id,
            body: msg.content,
            direction: msg.direction,
            created_at: msg.created_at,
            sender: msg.direction === 'inbound' ? clientName : 'You',
            recipient: msg.direction === 'inbound' ? 'You' : clientName,
            status: msg.status,
            type: 'sms',
            conversation_id: msg.conversation_id
          }));

        if (append) {
          // Prepend older messages at the beginning
          setMessages(prev => [...transformedMessages, ...prev]);
        } else {
          setMessages(transformedMessages);
        }

        // Check if there are more messages to load
        const loadedSoFar = append ? messages.length + smsMessages.length : smsMessages.length;
        setHasMore(loadedSoFar < (count || 0));
      } else if (!append) {
        setMessages([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching client messages:", error);
      if (!append) {
        setMessages([]);
        setHasMore(false);
      }
    }
  }, [messages.length]);

  // Load more messages (older ones)
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !client.phone) return;

    setLoadingMore(true);
    try {
      await fetchClientMessages(client.phone, client.name, messages.length, true);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, client.phone, client.name, messages.length, fetchClientMessages]);

  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      try {
        const { data: job } = await supabase
          .from('jobs')
          .select(`*, clients:client_id(*)`)
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

          if (clientData.phone) {
            setChannel('sms');
          } else if (clientData.email) {
            setChannel('email');
          }

          // Use new unified fetch directly with client phone
          if (clientData.phone) {
            await fetchClientMessages(clientData.phone, clientData.name, 0, false);
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
  }, [jobId, fetchClientMessages]);

  // Real-time subscription for sms_messages (unified system)
  useEffect(() => {
    if (!client.phone) return;

    const normalizedPhone = normalizePhone(client.phone);

    // Subscribe to sms_messages changes
    const sub = supabase
      .channel(`sms-messages-client-${normalizedPhone}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_messages' }, (payload) => {
        // Check if this message is for our client
        const msg = payload.new as any;
        if (msg.to_number?.includes(normalizedPhone) || msg.from_number?.includes(normalizedPhone)) {
          // Refresh messages (just latest, not all)
          fetchClientMessages(client.phone, client.name, 0, false);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [client.phone, client.name, fetchClientMessages]);

  const handleViewClientPage = () => {
    if (client.id) navigate(`/clients/${client.id}`);
  };

  // AI suggestion handler
  const handleUseSuggestion = useCallback((suggestion: string) => {
    setAiSuggestion(suggestion);
    setShowAISuggestion(true);
  }, []);

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages,
    client,
    jobId,
    onUseSuggestion: handleUseSuggestion
  });

  const applyAISuggestion = () => {
    setMessageText(aiSuggestion);
    setShowAISuggestion(false);
    setAiSuggestion("");
    textareaRef.current?.focus();
  };

  const dismissAISuggestion = () => {
    setShowAISuggestion(false);
    setAiSuggestion("");
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    if (channel === 'sms' && !client.phone) {
      toast.error("Client has no phone number");
      return;
    }
    if (channel === 'email' && !client.email) {
      toast.error("Client has no email address");
      return;
    }

    setIsSending(true);
    try {
      if (channel === 'sms') {
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            recipientPhone: client.phone,
            message: messageText,
            user_id: user?.id,
            metadata: { clientId: client.id, jobId }
          }
        });
        if (error) throw error;
        if (data && !data.success) {
          throw new Error(data.error || 'Failed to send SMS');
        }
        toast.success("SMS sent successfully");
      } else {
        const { error } = await supabase.functions.invoke('mailgun-email', {
          body: { to: client.email, subject: emailSubject || `Update on your job`, body: messageText, clientId: client.id, jobId }
        });
        if (error) throw error;
        toast.success("Email sent successfully");
      }

      setMessageText("");
      setEmailSubject("");
      // Refresh messages from unified sms_messages system
      if (client.phone) {
        await fetchClientMessages(client.phone, client.name, 0, false);
      }
    } catch (error: any) {
      console.error("Send error:", error);
      // Check if it's a "no phone number" error
      const errorMsg = error.message || '';
      if (errorMsg.includes('No phone number available')) {
        toast.error("No business phone number configured", {
          description: "Go to Settings → Phone Numbers to set up your phone number",
          action: {
            label: "Set Up",
            onClick: () => navigate('/settings/phone-numbers')
          },
          duration: 8000
        });
      } else {
        toast.error(`Failed to send ${channel}: ${errorMsg || 'Unknown error'}`);
      }
    } finally {
      setIsSending(false);
    }
  };

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

  const formatTime = (timestamp: string) => format(new Date(timestamp), 'h:mm a');

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
  const charCount = messageText.length;
  const maxSmsChars = 160;

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
                  {messages.length}
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
                <span className="flex items-center gap-1 truncate max-w-[150px]">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {!embedded && (
          <Button variant="ghost" size="sm" onClick={handleViewClientPage} className="text-slate-500 hover:text-slate-700">
            <ExternalLink className="h-4 w-4 mr-1" />
            View Client
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto max-h-64 space-y-4 mb-4 pr-1">
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
          <>
            {/* Load More Button (for older messages) */}
            {hasMore && (
              <div className="flex justify-center mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <History className="h-3.5 w-3.5" />
                      Load Earlier Messages ({totalCount - messages.length} more)
                    </>
                  )}
                </Button>
              </div>
            )}
            {messageGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-medium text-slate-400 px-2">{formatDateHeader(group.date)}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isFromClient = message.direction === 'inbound';
                  const isCurrentJob = message.job_id === jobId;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-2", !isFromClient && "flex-row-reverse")}
                    >
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className={cn(
                          "text-xs font-medium",
                          isFromClient ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-white"
                        )}>
                          {isFromClient ? client.name?.substring(0, 2).toUpperCase() : 'ME'}
                        </AvatarFallback>
                      </Avatar>

                      <div className={cn("flex flex-col max-w-[80%]", !isFromClient && "items-end")}>
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm",
                          isFromClient ? "bg-slate-100 text-slate-800 rounded-bl-sm" : "bg-slate-800 text-white rounded-br-sm"
                        )}>
                          <p className="break-words whitespace-pre-wrap">{message.body}</p>
                        </div>

                        <div className={cn("flex items-center gap-2 mt-1 text-xs text-slate-400", !isFromClient && "flex-row-reverse")}>
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
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestion Panel */}
      <AnimatePresence>
        {showAISuggestion && aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">AI Suggestion</span>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-amber-600 hover:text-amber-800" onClick={dismissAISuggestion}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-amber-800 mb-3 whitespace-pre-wrap">{aiSuggestion}</p>
              <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white h-8" onClick={applyAISuggestion}>
                Use This Response
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input Section */}
      <div className="border-t border-slate-200 pt-3">
        {/* Channel Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setChannel('sms')}
              disabled={!client.phone}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                channel === 'sms' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                !client.phone && "opacity-50 cursor-not-allowed"
              )}
            >
              <Phone className="h-3.5 w-3.5" />
              SMS
            </button>
            <button
              onClick={() => setChannel('email')}
              disabled={!client.email}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                channel === 'email' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                !client.email && "opacity-50 cursor-not-allowed"
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
          </div>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestResponse()}
            disabled={isAILoading || isLoading || messages.length === 0}
            className="gap-1.5 text-xs h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            {isAILoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Assist
          </Button>
        </div>

        {/* No Phone Number Warning */}
        {channel === 'sms' && hasOrgPhone === false && (
          <div className="flex items-center gap-2 p-2.5 mb-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs flex-1">No business phone number configured.</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-amber-700 hover:text-amber-900"
              onClick={() => navigate('/settings/phone-numbers')}
            >
              Set up now →
            </Button>
          </div>
        )}

        {/* Email Subject */}
        {channel === 'email' && (
          <Input
            placeholder="Subject (optional)"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="mb-2 h-9 text-sm"
          />
        )}

        {/* Message Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={channel === 'sms' ? "Type your SMS message..." : "Type your email message..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="min-h-[80px] pr-12 resize-none text-sm"
          />

          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending || (channel === 'sms' && hasOrgPhone === false)}
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 rounded-full transition-all",
              messageText.trim() && !(channel === 'sms' && hasOrgPhone === false) ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-300"
            )}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Character count for SMS */}
        {channel === 'sms' && messageText.length > 0 && (
          <div className="flex justify-between items-center mt-1.5 text-xs">
            <span className={cn(charCount > maxSmsChars ? "text-orange-500" : "text-slate-400")}>
              {charCount}/{maxSmsChars} characters
              {charCount > maxSmsChars && ` (${Math.ceil(charCount / maxSmsChars)} SMS)`}
            </span>
            <span className="text-slate-400">Press Enter to send</span>
          </div>
        )}
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
