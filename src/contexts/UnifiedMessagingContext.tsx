import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { useGeminiAI } from "@/hooks/useGeminiAI";
import {
  UnifiedConversation,
  UnifiedMessage,
  MessageChannel,
  SmartCategory,
  ConversationFilter,
  SmartReply,
  IntentDetection,
  ConversationCountsResponse,
} from "@/types/unified-messaging";

const PAGE_SIZE = 20;

interface UnifiedMessagingContextType {
  // Data
  conversations: UnifiedConversation[];
  activeConversation: UnifiedConversation | null;
  messages: UnifiedMessage[];
  categoryCounts: ConversationCountsResponse | null;

  // Filters
  activeFilter: ConversationFilter;
  searchQuery: string;
  activeCategory: SmartCategory;

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // AI state
  smartReplies: SmartReply[];
  detectedIntent: IntentDetection | null;
  isLoadingAI: boolean;

  // Pagination
  hasMoreConversations: boolean;
  hasMoreMessages: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (conversation: UnifiedConversation) => Promise<void>;
  sendMessage: (message: string, channel?: MessageChannel) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  starConversation: (id: string, starred: boolean) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;

  // Filter actions
  setActiveCategory: (category: SmartCategory) => void;
  setSearchQuery: (query: string) => void;

  // AI actions
  generateSmartReplies: () => Promise<void>;
  detectMessageIntent: (message: string) => Promise<IntentDetection | null>;

  // Refresh
  refresh: () => Promise<void>;
}

const UnifiedMessagingContext = createContext<UnifiedMessagingContextType | undefined>(
  undefined
);

export const useUnifiedMessaging = () => {
  const context = useContext(UnifiedMessagingContext);
  if (!context) {
    throw new Error(
      "useUnifiedMessaging must be used within UnifiedMessagingProvider"
    );
  }
  return context;
};

interface UnifiedMessagingProviderProps {
  children: ReactNode;
}

export const UnifiedMessagingProvider: React.FC<UnifiedMessagingProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { hasRole, hasPermission } = useRBAC();

  // Role-based filtering
  const isTechnician = hasRole("technician");
  const canViewAllMessages = hasPermission("messages.view.all") || hasPermission("clients.view.all");

  // State
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);

  // Ref to track active conversation for real-time subscriptions (avoids re-subscribing on every change)
  const activeConversationRef = useRef<UnifiedConversation | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);
  const [categoryCounts, setCategoryCounts] =
    useState<ConversationCountsResponse | null>(null);
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);

  // Filter state
  const [activeCategory, setActiveCategory] = useState<SmartCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>({
    category: "all",
  });

  // Loading state
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Pagination
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // AI integration
  const {
    isLoading: isLoadingAI,
    smartReplies,
    detectedIntent,
    generateSmartReplies: generateReplies,
    detectIntent,
  } = useGeminiAI();

  // Fetch assigned clients for technicians
  useEffect(() => {
    const fetchAssignedClients = async () => {
      if (!user?.id || !isTechnician) {
        setAssignedClientIds([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("client_id")
          .eq("technician_id", user.id)
          .not("client_id", "is", null);

        if (error) {
          console.error("Error fetching assigned clients:", error);
          return;
        }

        const clientIds = [...new Set(data?.map((j) => j.client_id).filter(Boolean) as string[])];
        setAssignedClientIds(clientIds);
      } catch (error) {
        console.error("Error in fetchAssignedClients:", error);
      }
    };

    fetchAssignedClients();
  }, [user?.id, isTechnician]);

  // Fetch conversation counts
  const fetchCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Build SMS query with organization and permission filtering
      let smsQuery = supabase
        .from("sms_conversations")
        .select("id, unread_count, client_id")
        .eq("status", "active");

      // Filter by organization if available, else by user_id
      if (organization?.id) {
        smsQuery = smsQuery.or(`organization_id.eq.${organization.id},user_id.eq.${user.id}`);
      } else {
        smsQuery = smsQuery.eq("user_id", user.id);
      }

      const { data: smsData } = await smsQuery;

      // Filter for technicians - only show assigned clients
      let filteredSmsData = smsData || [];
      if (isTechnician && !canViewAllMessages && assignedClientIds.length > 0) {
        filteredSmsData = filteredSmsData.filter(
          (c) => c.client_id && assignedClientIds.includes(c.client_id)
        );
      } else if (isTechnician && !canViewAllMessages && assignedClientIds.length === 0) {
        filteredSmsData = [];
      }

      const smsTotal = filteredSmsData.length;
      const smsUnread = filteredSmsData.reduce((sum, c) => sum + (c.unread_count || 0), 0);

      // Build Email query with organization and permission filtering
      let emailQuery = supabase
        .from("email_conversations")
        .select("id, unread_count, client_id")
        .eq("is_archived", false);

      if (organization?.id) {
        emailQuery = emailQuery.or(`organization_id.eq.${organization.id},user_id.eq.${user.id}`);
      } else {
        emailQuery = emailQuery.eq("user_id", user.id);
      }

      const { data: emailData } = await emailQuery;

      // Filter for technicians
      let filteredEmailData = emailData || [];
      if (isTechnician && !canViewAllMessages && assignedClientIds.length > 0) {
        filteredEmailData = filteredEmailData.filter(
          (c) => c.client_id && assignedClientIds.includes(c.client_id)
        );
      } else if (isTechnician && !canViewAllMessages && assignedClientIds.length === 0) {
        filteredEmailData = [];
      }

      const emailTotal = filteredEmailData.length;
      const emailUnread = filteredEmailData.reduce((sum, c) => sum + (c.unread_count || 0), 0);

      // Get needs reply count
      const needsReplyCount =
        filteredSmsData.filter((c) => (c.unread_count || 0) > 0).length +
        filteredEmailData.filter((c) => (c.unread_count || 0) > 0).length;

      setCategoryCounts({
        sms: { total: smsTotal, unread: smsUnread },
        email: { total: emailTotal, unread: emailUnread },
        in_app: { total: 0, unread: 0 },
        needs_reply: needsReplyCount,
        active_jobs: 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  }, [user?.id, organization?.id, isTechnician, canViewAllMessages, assignedClientIds]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingConversations(true);
    try {
      const unifiedConversations: UnifiedConversation[] = [];

      // Only load SMS
      const shouldLoadSMS =
        activeCategory === "all" ||
        activeCategory === "sms_only" ||
        activeCategory === "needs_reply" ||
        activeCategory === "unread";

      // Only load Email
      const shouldLoadEmail =
        activeCategory === "all" ||
        activeCategory === "email_only" ||
        activeCategory === "needs_reply" ||
        activeCategory === "unread";

      // Fetch SMS conversations with organization filtering
      if (shouldLoadSMS) {
        let smsQuery = supabase
          .from("sms_conversations")
          .select(
            `
            *,
            client:clients(id, name, phone, email)
          `
          )
          .eq("status", "active")
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(PAGE_SIZE);

        // Apply organization or user filter
        if (organization?.id) {
          smsQuery = smsQuery.or(`organization_id.eq.${organization.id},user_id.eq.${user.id}`);
        } else {
          smsQuery = smsQuery.eq("user_id", user.id);
        }

        if (activeCategory === "needs_reply" || activeCategory === "unread") {
          smsQuery = smsQuery.gt("unread_count", 0);
        }

        const { data: smsData, error: smsError } = await smsQuery;

        if (smsError) {
          console.error("SMS fetch error:", smsError);
        } else if (smsData) {
          // Filter by assigned clients for technicians
          let filteredSmsData = smsData;
          if (isTechnician && !canViewAllMessages) {
            if (assignedClientIds.length > 0) {
              filteredSmsData = smsData.filter(
                (conv) => conv.client_id && assignedClientIds.includes(conv.client_id)
              );
            } else {
              filteredSmsData = [];
            }
          }

          filteredSmsData.forEach((conv) => {
            unifiedConversations.push({
              id: conv.id,
              channel: "sms",
              user_id: conv.user_id,
              client_id: conv.client_id || null,
              organization_id: conv.organization_id || null,
              contact_identifier: conv.client_phone,
              business_identifier: conv.phone_number,
              subject: null,
              last_message_at: conv.last_message_at || conv.created_at,
              last_message_preview: conv.last_message_preview || "",
              unread_count: conv.unread_count || 0,
              status: conv.status === "active" ? "active" : "archived",
              is_archived: conv.status !== "active",
              is_starred: false,
              assigned_to: null,
              created_at: conv.created_at,
              updated_at: conv.updated_at,
              client_name: conv.client?.name || null,
              client_email: conv.client?.email || null,
              client_phone_formatted: conv.client?.phone || conv.client_phone,
              needsReply: (conv.unread_count || 0) > 0,
            });
          });
        }
      }

      // Fetch Email conversations with organization filtering
      if (shouldLoadEmail) {
        let emailQuery = supabase
          .from("email_conversations")
          .select("*")
          .order("last_message_at", { ascending: false })
          .limit(PAGE_SIZE);

        // Apply organization or user filter
        if (organization?.id) {
          emailQuery = emailQuery.or(`organization_id.eq.${organization.id},user_id.eq.${user.id}`);
        } else {
          emailQuery = emailQuery.eq("user_id", user.id);
        }

        if (activeCategory !== "archived") {
          emailQuery = emailQuery.eq("is_archived", false);
        }

        if (activeCategory === "needs_reply" || activeCategory === "unread") {
          emailQuery = emailQuery.gt("unread_count", 0);
        }

        if (activeCategory === "starred") {
          emailQuery = emailQuery.eq("is_starred", true);
        }

        const { data: emailData, error: emailError } = await emailQuery;

        if (emailError) {
          console.error("Email fetch error:", emailError);
        } else if (emailData) {
          // Filter by assigned clients for technicians
          let filteredEmailData = emailData;
          if (isTechnician && !canViewAllMessages) {
            if (assignedClientIds.length > 0) {
              filteredEmailData = emailData.filter(
                (conv) => conv.client_id && assignedClientIds.includes(conv.client_id)
              );
            } else {
              filteredEmailData = [];
            }
          }

          filteredEmailData.forEach((conv) => {
            unifiedConversations.push({
              id: conv.id,
              channel: "email",
              user_id: conv.user_id,
              client_id: conv.client_id || null,
              organization_id: conv.organization_id || null,
              contact_identifier: conv.email_address || conv.client_email,
              business_identifier: null,
              subject: conv.subject,
              last_message_at: conv.last_message_at || conv.created_at,
              last_message_preview: conv.last_message_preview || "",
              unread_count: conv.unread_count || 0,
              status: conv.is_archived ? "archived" : "active",
              is_archived: conv.is_archived || false,
              is_starred: conv.is_starred || false,
              assigned_to: conv.assigned_to || null,
              created_at: conv.created_at,
              updated_at: conv.updated_at,
              client_name: conv.client_name || null,
              client_email: conv.email_address || conv.client_email || null,
              client_phone_formatted: null,
              needsReply: (conv.unread_count || 0) > 0,
            });
          });
        }
      }

      // Sort by last_message_at
      unifiedConversations.sort((a, b) => {
        const dateA = new Date(a.last_message_at || 0).getTime();
        const dateB = new Date(b.last_message_at || 0).getTime();
        return dateB - dateA;
      });

      // Apply search filter
      let filtered = unifiedConversations;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = unifiedConversations.filter(
          (c) =>
            c.client_name?.toLowerCase().includes(query) ||
            c.contact_identifier?.toLowerCase().includes(query) ||
            c.subject?.toLowerCase().includes(query) ||
            c.last_message_preview?.toLowerCase().includes(query)
        );
      }

      setConversations(filtered);
      setHasMoreConversations(filtered.length >= PAGE_SIZE);

      // Fetch counts
      await fetchCounts();
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user?.id, organization?.id, activeCategory, searchQuery, fetchCounts, isTechnician, canViewAllMessages, assignedClientIds]);

  // Select conversation
  const selectConversation = useCallback(
    async (conversation: UnifiedConversation) => {
      // Immediately mark as read in local state to update UI
      const updatedConversation = { ...conversation, unread_count: 0, needsReply: false };
      setActiveConversation(updatedConversation);
      setMessages([]);
      setIsLoadingMessages(true);

      // Update conversations list immediately for responsive UI
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unread_count: 0, needsReply: false } : c
        )
      );

      try {
        if (conversation.channel === "sms") {
          // Fetch SMS messages
          const { data, error } = await supabase
            .from("sms_messages")
            .select("*")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true });

          if (error) throw error;

          const unifiedMessages: UnifiedMessage[] = (data || []).map((msg) => ({
            id: msg.id,
            channel: "sms" as MessageChannel,
            conversation_id: msg.conversation_id,
            user_id: null,
            direction: msg.direction as "inbound" | "outbound",
            sender: msg.from_number,
            recipient: msg.to_number,
            body: msg.content,
            subject: null,
            html_body: null,
            attachments: null,
            is_read: msg.direction === "outbound",
            status: msg.status,
            ai_intent: msg.ai_intent || null,
            ai_confidence: msg.ai_confidence || null,
            metadata: msg.metadata || {},
            created_at: msg.created_at,
          }));

          setMessages(unifiedMessages);

          // Mark as read in database
          if (conversation.unread_count > 0) {
            await supabase
              .from("sms_conversations")
              .update({ unread_count: 0 })
              .eq("id", conversation.id);

            // Refresh counts after marking as read
            await fetchCounts();
          }
        } else if (conversation.channel === "email") {
          // Fetch Email messages
          const { data, error } = await supabase
            .from("email_messages")
            .select("*")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true });

          if (error) throw error;

          const unifiedMessages: UnifiedMessage[] = (data || []).map((msg) => ({
            id: msg.id,
            channel: "email" as MessageChannel,
            conversation_id: msg.conversation_id,
            user_id: msg.user_id,
            direction: msg.direction as "inbound" | "outbound",
            sender: msg.from_email,
            recipient: msg.to_email,
            body: msg.body,
            subject: msg.subject,
            html_body: msg.html_body,
            attachments: msg.attachments || null,
            is_read: msg.is_read || false,
            status: msg.status,
            ai_intent: msg.ai_intent || null,
            ai_confidence: msg.ai_confidence || null,
            metadata: msg.metadata || {},
            created_at: msg.created_at,
          }));

          setMessages(unifiedMessages);

          // Mark as read in database
          if (conversation.unread_count > 0) {
            await supabase
              .from("email_messages")
              .update({ is_read: true })
              .eq("conversation_id", conversation.id)
              .eq("direction", "inbound")
              .eq("is_read", false);

            await supabase
              .from("email_conversations")
              .update({ unread_count: 0 })
              .eq("id", conversation.id);

            // Refresh counts after marking as read
            await fetchCounts();
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [fetchCounts]
  );

  // Send message
  const sendMessage = useCallback(
    async (message: string, channel?: MessageChannel) => {
      if (!activeConversation || !user?.id || !message.trim()) return;

      const targetChannel = channel || activeConversation.channel;
      setIsSending(true);

      try {
        if (targetChannel === "sms") {
          // Get organization's or user's phone number
          let phoneQuery = supabase
            .from("phone_numbers")
            .select("phone_number")
            .eq("is_primary", true);

          // Prefer organization phone, fallback to user phone
          if (organization?.id) {
            phoneQuery = phoneQuery.eq("organization_id", organization.id);
          } else {
            phoneQuery = phoneQuery.eq("user_id", user.id);
          }

          const { data: phoneData } = await phoneQuery.single();

          if (!phoneData) {
            toast.error("Please configure a primary phone number first");
            return;
          }

          // Send SMS
          const { error } = await supabase.functions.invoke("telnyx-sms", {
            body: {
              recipientPhone: activeConversation.contact_identifier,
              message: message,
              user_id: user.id,
              metadata: {
                conversationId: activeConversation.id,
                clientId: activeConversation.client_id,
                source: "unified_messaging",
              },
            },
          });

          if (error) throw error;

          toast.success("SMS sent");
        } else if (targetChannel === "email") {
          // Send Email
          const { error } = await supabase.functions.invoke("mailgun-email", {
            body: {
              to: activeConversation.contact_identifier,
              subject: `Re: ${activeConversation.subject || "No Subject"}`,
              text: message,
              userId: user.id,
              clientId: activeConversation.client_id,
              conversationId: activeConversation.id,
            },
          });

          if (error) throw error;

          toast.success("Email sent");
        }

        // Just refresh conversation list - real-time will update messages
        await loadConversations();
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [activeConversation, user?.id, loadConversations, organization?.id]
  );

  // Archive conversation
  const archiveConversation = useCallback(
    async (id: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation) return;

      try {
        if (conversation.channel === "sms") {
          await supabase
            .from("sms_conversations")
            .update({ status: "archived" })
            .eq("id", id);
        } else if (conversation.channel === "email") {
          await supabase
            .from("email_conversations")
            .update({ is_archived: true })
            .eq("id", id);
        }

        toast.success("Conversation archived");
        await loadConversations();

        if (activeConversation?.id === id) {
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error archiving:", error);
        toast.error("Failed to archive conversation");
      }
    },
    [conversations, activeConversation, loadConversations]
  );

  // Star conversation
  const starConversation = useCallback(
    async (id: string, starred: boolean) => {
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation || conversation.channel !== "email") return;

      try {
        await supabase
          .from("email_conversations")
          .update({ is_starred: starred })
          .eq("id", id);

        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_starred: starred } : c))
        );
      } catch (error) {
        console.error("Error starring:", error);
      }
    },
    [conversations]
  );

  // Mark as read
  const markAsRead = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      try {
        if (conversation.channel === "sms") {
          await supabase
            .from("sms_conversations")
            .update({ unread_count: 0 })
            .eq("id", conversationId);
        } else if (conversation.channel === "email") {
          await supabase
            .from("email_conversations")
            .update({ unread_count: 0 })
            .eq("id", conversationId);
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, unread_count: 0 } : c
          )
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    },
    [conversations]
  );

  // Generate smart replies
  const generateSmartReplies = useCallback(async () => {
    if (!activeConversation || messages.length === 0) return;

    await generateReplies(
      messages,
      activeConversation.client_name || undefined,
      {
        businessName: organization?.name,
        tone: "professional",
      }
    );
  }, [activeConversation, messages, generateReplies, organization?.name]);

  // Detect message intent
  const detectMessageIntent = useCallback(
    async (message: string) => {
      return await detectIntent(message);
    },
    [detectIntent]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await loadConversations();
    if (activeConversation) {
      await selectConversation(activeConversation);
    }
  }, [loadConversations, activeConversation, selectConversation]);

  // Load on mount and when category/organization/assigned clients change
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id, organization?.id, activeCategory, assignedClientIds, loadConversations]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // SMS subscription
    const smsChannel = supabase
      .channel("unified-sms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sms_messages",
        },
        async (payload) => {
          console.log("SMS update:", payload);

          // Use ref to get current active conversation (avoids stale closure)
          const currentConversation = activeConversationRef.current;

          // Handle new message for active conversation
          if (payload.eventType === "INSERT" && payload.new && currentConversation?.channel === "sms") {
            if (payload.new.conversation_id === currentConversation.id) {
              const newMsg = payload.new as any;

              // Skip messages with empty content (will be updated later)
              // Note: SMS table uses 'content' field, not 'body'
              if (!newMsg.content || newMsg.content.trim() === "") {
                return;
              }

              // Add new message to the list without reloading
              const unifiedMessage: UnifiedMessage = {
                id: newMsg.id,
                conversation_id: newMsg.conversation_id,
                channel: "sms",
                direction: newMsg.direction,
                body: newMsg.content,
                subject: null,
                status: newMsg.status,
                ai_intent: newMsg.ai_intent || null,
                ai_confidence: newMsg.ai_confidence || null,
                metadata: newMsg.metadata || {},
                created_at: newMsg.created_at,
              };

              setMessages((prev) => {
                // Check if message already exists (avoid duplicates)
                if (prev.some((m) => m.id === newMsg.id)) {
                  return prev;
                }
                return [...prev, unifiedMessage];
              });
            }
          }

          // Handle message updates (for content that was initially empty)
          if (payload.eventType === "UPDATE" && payload.new && currentConversation?.channel === "sms") {
            if (payload.new.conversation_id === currentConversation.id) {
              const updatedMsg = payload.new as any;

              // Only process if content exists now (SMS uses 'content' field)
              if (updatedMsg.content && updatedMsg.content.trim() !== "") {
                setMessages((prev) => {
                  // Check if message exists - update it
                  const existingIndex = prev.findIndex((m) => m.id === updatedMsg.id);
                  if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      body: updatedMsg.content,
                      status: updatedMsg.status,
                    };
                    return updated;
                  }
                  // Message doesn't exist yet - add it
                  return [...prev, {
                    id: updatedMsg.id,
                    conversation_id: updatedMsg.conversation_id,
                    channel: "sms",
                    direction: updatedMsg.direction,
                    body: updatedMsg.content,
                    subject: null,
                    status: updatedMsg.status,
                    ai_intent: updatedMsg.ai_intent || null,
                    ai_confidence: updatedMsg.ai_confidence || null,
                    metadata: updatedMsg.metadata || {},
                    created_at: updatedMsg.created_at,
                  }];
                });
              }
            }
          }

          // Refresh conversation list for updated previews
          await loadConversations();

          // Notification for inbound only (not for outbound that we just sent)
          if (payload.eventType === "INSERT" && payload.new?.direction === "inbound") {
            toast.success("New SMS received");
          }
        }
      )
      .subscribe();

    // Email subscription
    const emailChannel = supabase
      .channel("unified-email")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_messages",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("Email update:", payload);

          // Use ref to get current active conversation (avoids stale closure)
          const currentConversation = activeConversationRef.current;

          // Handle new message for active conversation
          if (payload.eventType === "INSERT" && payload.new && currentConversation?.channel === "email") {
            if (payload.new.conversation_id === currentConversation.id) {
              // Add new message to the list without reloading
              const newMsg = payload.new as any;
              const unifiedMessage: UnifiedMessage = {
                id: newMsg.id,
                conversation_id: newMsg.conversation_id,
                channel: "email",
                direction: newMsg.direction,
                body: newMsg.body_text || newMsg.body_html || "",
                subject: newMsg.subject,
                status: newMsg.status,
                ai_intent: newMsg.ai_intent || null,
                ai_confidence: newMsg.ai_confidence || null,
                metadata: newMsg.metadata || {},
                created_at: newMsg.created_at,
              };

              setMessages((prev) => {
                // Check if message already exists (avoid duplicates)
                if (prev.some((m) => m.id === newMsg.id)) {
                  return prev;
                }
                return [...prev, unifiedMessage];
              });
            }
          }

          // Refresh conversation list for updated previews
          await loadConversations();

          // Notification for inbound only
          if (payload.eventType === "INSERT" && payload.new?.direction === "inbound") {
            toast.success("New email received");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(smsChannel);
      supabase.removeChannel(emailChannel);
    };
    // Note: activeConversation is accessed via ref to avoid re-subscribing on every conversation change
  }, [user?.id, loadConversations]);

  const value: UnifiedMessagingContextType = {
    conversations,
    activeConversation,
    messages,
    categoryCounts,
    activeFilter,
    searchQuery,
    activeCategory,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    smartReplies,
    detectedIntent,
    isLoadingAI,
    hasMoreConversations,
    hasMoreMessages,
    loadConversations,
    selectConversation,
    sendMessage,
    archiveConversation,
    starConversation,
    markAsRead,
    setActiveCategory,
    setSearchQuery,
    generateSmartReplies,
    detectMessageIntent,
    refresh,
  };

  return (
    <UnifiedMessagingContext.Provider value={value}>
      {children}
    </UnifiedMessagingContext.Provider>
  );
};
