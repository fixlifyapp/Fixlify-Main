import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Plus,
  Archive,
  Phone,
  Users,
  Briefcase,
  Calendar,
  AlertCircle,
  HelpCircle,
  Filter,
  Bot,
  Clock,
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { useSMS } from "@/contexts/SMSContext";
import { ConversationThread } from "./components/ConversationThread";
import { ConnectMessageDialog } from "./components/ConnectMessageDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type CategoryType = 'all' | 'needs_reply' | 'active_jobs' | 'scheduled' | 'clients' | 'team' | 'unknown' | 'archived';

interface JobInfo {
  id: string;
  title: string;
  status: string;
  scheduled_date?: string;
}

interface EnhancedConversation {
  id: string;
  user_id: string;
  client_id?: string;
  phone_number: string;
  client_phone: string;
  status: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  lastMessageDirection?: 'inbound' | 'outbound';
  activeJobs?: JobInfo[];
  scheduledJobs?: JobInfo[];
  category?: 'client' | 'team' | 'unknown';
  needsReply?: boolean;
}

const CATEGORY_CONFIG: Record<CategoryType, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All', icon: MessageSquare, color: 'text-gray-600' },
  needs_reply: { label: 'Needs Reply', icon: AlertCircle, color: 'text-red-500' },
  active_jobs: { label: 'Active Jobs', icon: Briefcase, color: 'text-blue-500' },
  scheduled: { label: 'Scheduled', icon: Calendar, color: 'text-purple-500' },
  clients: { label: 'Clients', icon: Users, color: 'text-green-500' },
  team: { label: 'Team', icon: Users, color: 'text-indigo-500' },
  unknown: { label: 'Unknown', icon: HelpCircle, color: 'text-orange-500' },
  archived: { label: 'Archived', icon: Archive, color: 'text-gray-400' }
};

export const SmartSMSInbox = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [jobsMap, setJobsMap] = useState<Map<string, JobInfo[]>>(new Map());
  const [lastMessageDirections, setLastMessageDirections] = useState<Map<string, 'inbound' | 'outbound'>>(new Map());

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

  // Fetch jobs for clients to enable smart categorization
  useEffect(() => {
    const fetchJobsForClients = async () => {
      if (!user?.id || conversations.length === 0) return;

      const clientIds = conversations
        .filter(c => c.client_id)
        .map(c => c.client_id!);

      if (clientIds.length === 0) return;

      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, status, scheduled_date, client_id')
        .in('client_id', clientIds)
        .in('status', ['scheduled', 'in_progress', 'pending', 'confirmed']);

      if (jobs) {
        const map = new Map<string, JobInfo[]>();
        jobs.forEach(job => {
          const existing = map.get(job.client_id) || [];
          existing.push({
            id: job.id,
            title: job.title,
            status: job.status,
            scheduled_date: job.scheduled_date
          });
          map.set(job.client_id, existing);
        });
        setJobsMap(map);
      }
    };

    fetchJobsForClients();
  }, [user?.id, conversations]);

  // Fetch last message direction for each conversation
  useEffect(() => {
    const fetchLastMessageDirections = async () => {
      if (conversations.length === 0) return;

      const directions = new Map<string, 'inbound' | 'outbound'>();

      for (const conv of conversations) {
        const { data } = await supabase
          .from('sms_messages')
          .select('direction')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          directions.set(conv.id, data.direction as 'inbound' | 'outbound');
        }
      }

      setLastMessageDirections(directions);
    };

    fetchLastMessageDirections();
  }, [conversations]);

  // Enhanced conversations with smart categorization
  const enhancedConversations = useMemo((): EnhancedConversation[] => {
    return conversations.map(conv => {
      const clientJobs = conv.client_id ? jobsMap.get(conv.client_id) || [] : [];
      const lastDirection = lastMessageDirections.get(conv.id);

      // Determine if needs reply (unread + last message was inbound)
      const needsReply = conv.unread_count > 0 && lastDirection === 'inbound';

      // Categorize active vs scheduled jobs
      const activeJobs = clientJobs.filter(j => j.status === 'in_progress');
      const scheduledJobs = clientJobs.filter(j =>
        j.status === 'scheduled' || j.status === 'confirmed' || j.status === 'pending'
      );

      // Determine contact category
      let category: 'client' | 'team' | 'unknown' = 'unknown';
      if (conv.client_id) {
        category = 'client';
      }
      // TODO: Add team member detection based on phone number or metadata

      return {
        ...conv,
        lastMessageDirection: lastDirection,
        activeJobs,
        scheduledJobs,
        category,
        needsReply
      };
    });
  }, [conversations, jobsMap, lastMessageDirections]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      all: enhancedConversations.filter(c => c.status !== 'archived').length,
      needs_reply: enhancedConversations.filter(c => c.needsReply && c.status !== 'archived').length,
      active_jobs: enhancedConversations.filter(c => (c.activeJobs?.length || 0) > 0 && c.status !== 'archived').length,
      scheduled: enhancedConversations.filter(c => (c.scheduledJobs?.length || 0) > 0 && c.status !== 'archived').length,
      clients: enhancedConversations.filter(c => c.category === 'client' && c.status !== 'archived').length,
      team: enhancedConversations.filter(c => c.category === 'team' && c.status !== 'archived').length,
      unknown: enhancedConversations.filter(c => c.category === 'unknown' && c.status !== 'archived').length,
      archived: enhancedConversations.filter(c => c.status === 'archived').length
    };
    return counts;
  }, [enhancedConversations]);

  // Filter conversations based on active category and search
  const filteredConversations = useMemo(() => {
    let filtered = enhancedConversations;

    // Filter by category
    switch (activeCategory) {
      case 'needs_reply':
        filtered = filtered.filter(c => c.needsReply && c.status !== 'archived');
        break;
      case 'active_jobs':
        filtered = filtered.filter(c => (c.activeJobs?.length || 0) > 0 && c.status !== 'archived');
        break;
      case 'scheduled':
        filtered = filtered.filter(c => (c.scheduledJobs?.length || 0) > 0 && c.status !== 'archived');
        break;
      case 'clients':
        filtered = filtered.filter(c => c.category === 'client' && c.status !== 'archived');
        break;
      case 'team':
        filtered = filtered.filter(c => c.category === 'team' && c.status !== 'archived');
        break;
      case 'unknown':
        filtered = filtered.filter(c => c.category === 'unknown' && c.status !== 'archived');
        break;
      case 'archived':
        filtered = filtered.filter(c => c.status === 'archived');
        break;
      default:
        filtered = filtered.filter(c => c.status !== 'archived');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.client?.name?.toLowerCase().includes(query) ||
        conv.client?.phone?.includes(searchQuery) ||
        conv.client_phone?.includes(searchQuery) ||
        conv.phone_number?.includes(searchQuery) ||
        conv.last_message_preview?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [enhancedConversations, activeCategory, searchQuery]);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getCategoryBadge = (conv: EnhancedConversation) => {
    if (conv.category === 'client') {
      return <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Client</Badge>;
    }
    if (conv.category === 'team') {
      return <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200">Team</Badge>;
    }
    return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">Unknown</Badge>;
  };

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[600px] gap-4">
      {/* Smart Categories Sidebar */}
      <Card className="w-56 flex-shrink-0 p-0 overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-violet-600" />
            Smart Inbox
          </h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const count = categoryCounts[category];
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", isActive ? "text-violet-600" : config.color)} />
                    {config.label}
                  </span>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "min-w-[24px] justify-center",
                      isActive && "bg-violet-600",
                      category === 'needs_reply' && count > 0 && !isActive && "bg-red-500 text-white"
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Conversations List */}
      <Card className="w-80 flex-shrink-0 p-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-violet-600" />
              <span className="font-semibold text-sm">Messages</span>
            </div>
            <Button
              size="sm"
              onClick={() => setShowNewMessageDialog(true)}
              className="h-8 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm">Loading...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all mb-1.5 relative",
                    activeConversation?.id === conversation.id
                      ? "bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => setActiveConversation(conversation)}
                >
                  {/* Unread indicator */}
                  {conversation.needsReply && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
                      conversation.needsReply
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-violet-600 to-purple-600"
                    )}>
                      {conversation.client?.name?.charAt(0) || 'U'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.client?.name || `+${conversation.client_phone}`}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        {getCategoryBadge(conversation)}
                        {(conversation.activeJobs?.length || 0) > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                            <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                            {conversation.activeJobs?.length}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.last_message_preview || 'No messages'}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-red-500 text-white h-5 min-w-[20px] px-1.5">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Conversation Thread */}
      <div className="flex-1 min-w-0">
        {activeConversation ? (
          <ConversationThread
            messages={messages}
            clientName={activeConversation.client?.name || 'Unknown'}
            client={activeConversation.client}
            onArchive={() => {}}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Or start a new one</p>
              <Button
                onClick={() => setShowNewMessageDialog(true)}
                className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
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

export default SmartSMSInbox;
