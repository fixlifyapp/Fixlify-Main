import { useState, useMemo } from "react";
import { SectionCard, SectionHeader, EmptyState } from "../shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  MessageSquare,
  Clock,
  FileText,
  CreditCard,
  Bot,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  type: "note" | "status-change" | "payment" | "estimate" | "invoice" | "ai-conversation" | "ai-message";
  title: string;
  description: string;
  user_name?: string;
  created_at: string;
  visibility?: string;
}

interface Message {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  created_at: string;
  sender?: string;
  recipient?: string;
  status?: string;
  type?: "sms" | "email";
}

interface ActivityFeedProps {
  historyItems: HistoryItem[];
  messages: Message[];
  isLoading?: boolean;
  onOpenMessages?: () => void;
  onViewHistory?: () => void;
}

type ActivityItem =
  | { kind: "history"; data: HistoryItem }
  | { kind: "message"; data: Message };

export const ActivityFeed = ({
  historyItems,
  messages,
  isLoading,
  onOpenMessages,
  onViewHistory
}: ActivityFeedProps) => {
  const [filter, setFilter] = useState<"all" | "history" | "messages">("all");
  const [showAll, setShowAll] = useState(false);

  // Combine and sort all activities by date
  const allActivities = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...historyItems.map((item) => ({ kind: "history" as const, data: item })),
      ...messages.map((item) => ({ kind: "message" as const, data: item }))
    ];

    return items.sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
    );
  }, [historyItems, messages]);

  const filteredActivities = useMemo(() => {
    if (filter === "all") return allActivities;
    return allActivities.filter((item) =>
      filter === "history" ? item.kind === "history" : item.kind === "message"
    );
  }, [allActivities, filter]);

  const displayedActivities = showAll
    ? filteredActivities
    : filteredActivities.slice(0, 6);

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "status-change":
        return <Clock className="h-3.5 w-3.5" />;
      case "payment":
        return <CreditCard className="h-3.5 w-3.5" />;
      case "estimate":
      case "invoice":
        return <FileText className="h-3.5 w-3.5" />;
      case "ai-conversation":
      case "ai-message":
        return <Bot className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case "status-change":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "payment":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "estimate":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "invoice":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "ai-conversation":
      case "ai-message":
        return "bg-violet-50 text-violet-600 border-violet-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getMessageStatusIcon = (status?: string, direction?: string) => {
    if (direction === "inbound") {
      return <ArrowDownLeft className="h-3 w-3 text-blue-500" />;
    }
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <ArrowUpRight className="h-3 w-3 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <SectionCard>
        <SectionHeader icon={Activity} title="Activity" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={Activity}
        title="Activity"
        subtitle={
          allActivities.length > 0 ? `${allActivities.length} events` : undefined
        }
        action={
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="messages">Messages</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {allActivities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here as the job progresses"
        />
      ) : (
        <div className="space-y-2">
          {displayedActivities.map((activity) => (
            <div
              key={`${activity.kind}-${activity.data.id}`}
              className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
            >
              {activity.kind === "history" ? (
                <>
                  {/* History Item */}
                  <div
                    className={cn(
                      "flex-shrink-0 p-1.5 rounded-md border",
                      getHistoryColor(activity.data.type)
                    )}
                  >
                    {getHistoryIcon(activity.data.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {activity.data.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 h-4 font-medium",
                          getHistoryColor(activity.data.type)
                        )}
                      >
                        {activity.data.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {activity.data.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      {activity.data.user_name && (
                        <span>{activity.data.user_name}</span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(activity.data.created_at), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Message Item */}
                  <div
                    className={cn(
                      "flex-shrink-0 p-1.5 rounded-md border",
                      activity.data.direction === "inbound"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}
                  >
                    {activity.data.type === "email" ? (
                      <Mail className="h-3.5 w-3.5" />
                    ) : activity.data.type === "sms" ? (
                      <Phone className="h-3.5 w-3.5" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-slate-800">
                        {activity.data.direction === "inbound"
                          ? activity.data.sender || "Client"
                          : "You"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        {getMessageStatusIcon(
                          activity.data.status,
                          activity.data.direction
                        )}
                        {activity.data.direction === "inbound" ? "received" : "sent"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {activity.data.body}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {formatDistanceToNow(new Date(activity.data.created_at), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Show More / Quick Actions */}
          <div className="flex items-center justify-between pt-2">
            {filteredActivities.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="h-7 text-xs text-slate-500 hover:text-slate-700"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 mr-1 transition-transform",
                    showAll && "rotate-180"
                  )}
                />
                {showAll
                  ? "Show less"
                  : `Show all ${filteredActivities.length} activities`}
              </Button>
            )}

            {onOpenMessages && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenMessages}
                className="h-7 text-xs text-slate-500 hover:text-slate-700 ml-auto"
              >
                <Send className="h-3 w-3 mr-1" />
                Open Messages
              </Button>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
};
