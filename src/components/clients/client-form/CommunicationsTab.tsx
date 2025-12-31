import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  PhoneCall,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { useMessageContext } from "@/contexts/MessageContext";

interface CommunicationsTabProps {
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}

interface CommunicationItem {
  id: string;
  type: "sms" | "email" | "call" | "note";
  direction: "inbound" | "outbound";
  content: string;
  subject?: string;
  status?: string;
  created_at: string;
  duration?: number;
}

export const CommunicationsTab = ({
  clientId,
  clientName,
  clientPhone,
  clientEmail
}: CommunicationsTabProps) => {
  const [communications, setCommunications] = useState<CommunicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sms" | "email" | "call">("all");
  const { openMessageDialog } = useMessageContext();

  const fetchCommunications = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const allCommunications: CommunicationItem[] = [];

      // Fetch from communication_logs
      const { data: commLogs } = await supabase
        .from("communication_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (commLogs) {
        commLogs.forEach((log) => {
          allCommunications.push({
            id: log.id,
            type: (log.communication_type as "sms" | "email" | "call" | "note") || "note",
            direction: (log.direction as "inbound" | "outbound") || "outbound",
            content: log.message_body || log.content || "",
            subject: log.subject || undefined,
            status: log.status || undefined,
            created_at: log.created_at || new Date().toISOString()
          });
        });
      }

      // Fetch SMS messages through conversations
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("client_id", clientId);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map((c) => c.id);
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
          .limit(50);

        if (messages) {
          messages.forEach((msg) => {
            // Avoid duplicates by checking if we already have this message
            if (!allCommunications.find((c) => c.id === msg.id)) {
              allCommunications.push({
                id: msg.id,
                type: "sms",
                direction: msg.direction === "inbound" ? "inbound" : "outbound",
                content: msg.body || "",
                status: msg.status || undefined,
                created_at: msg.created_at || new Date().toISOString()
              });
            }
          });
        }
      }

      // Fetch call logs
      const { data: callLogs } = await supabase
        .from("call_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (callLogs) {
        callLogs.forEach((call) => {
          allCommunications.push({
            id: call.id,
            type: "call",
            direction: call.direction === "inbound" ? "inbound" : "outbound",
            content: call.notes || `Call ${call.status || "completed"}`,
            status: call.status || undefined,
            duration: call.duration_seconds || undefined,
            created_at: call.created_at || new Date().toISOString()
          });
        });
      }

      // Sort all communications by date (newest first)
      allCommunications.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCommunications(allCommunications);
    } catch (error) {
      console.error("Error fetching communications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  // Real-time subscription
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`client-communications-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communication_logs",
          filter: `client_id=eq.${clientId}`
        },
        () => fetchCommunications()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages"
        },
        () => fetchCommunications()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "call_logs",
          filter: `client_id=eq.${clientId}`
        },
        () => fetchCommunications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, fetchCommunications]);

  const handleOpenMessages = () => {
    if (clientId && clientName) {
      openMessageDialog({
        id: clientId,
        name: clientName,
        phone: clientPhone || "",
        email: clientEmail || ""
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sms":
        return <MessageCircle className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "call":
        return <PhoneCall className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sms":
        return "bg-green-100 text-green-700 border-green-200";
      case "email":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "call":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredCommunications = communications.filter((comm) => {
    if (filter === "all") return true;
    return comm.type === filter;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication History
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCommunications}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleOpenMessages}>
              <MessageSquare className="h-4 w-4 mr-1" />
              New Message
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({communications.length})
          </Button>
          <Button
            variant={filter === "sms" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("sms")}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            SMS ({communications.filter((c) => c.type === "sms").length})
          </Button>
          <Button
            variant={filter === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("email")}
          >
            <Mail className="h-4 w-4 mr-1" />
            Email ({communications.filter((c) => c.type === "email").length})
          </Button>
          <Button
            variant={filter === "call" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("call")}
          >
            <Phone className="h-4 w-4 mr-1" />
            Calls ({communications.filter((c) => c.type === "call").length})
          </Button>
        </div>

        {/* Communications Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCommunications.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-1">No communications yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start a conversation with this client via SMS, email, or phone.
            </p>
            <Button onClick={handleOpenMessages}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send First Message
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredCommunications.map((comm) => (
                <div
                  key={comm.id}
                  className={`flex gap-3 p-3 rounded-lg border ${
                    comm.direction === "inbound" ? "bg-muted/30" : "bg-background"
                  }`}
                >
                  {/* Type Icon */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(
                      comm.type
                    )}`}
                  >
                    {getTypeIcon(comm.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {comm.type}
                      </Badge>
                      <span className="flex items-center text-xs text-muted-foreground">
                        {comm.direction === "inbound" ? (
                          <>
                            <ArrowDownLeft className="h-3 w-3 mr-1 text-green-500" />
                            Received
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-3 w-3 mr-1 text-blue-500" />
                            Sent
                          </>
                        )}
                      </span>
                      {comm.status && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {comm.status}
                        </Badge>
                      )}
                      {comm.type === "call" && comm.duration && (
                        <span className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDuration(comm.duration)}
                        </span>
                      )}
                    </div>

                    {comm.subject && (
                      <p className="font-medium text-sm mb-1">{comm.subject}</p>
                    )}
                    <p className="text-sm text-foreground line-clamp-3">{comm.content}</p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comm.created_at), { addSuffix: true })}
                      {" · "}
                      {format(new Date(comm.created_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
