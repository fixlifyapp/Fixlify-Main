// Unified Messaging System Types
// Combines SMS, Email, and In-app messages into a unified interface

// ============================================
// Channel & Status Types
// ============================================

export type MessageChannel = 'sms' | 'email' | 'in_app';

export type MessageDirection = 'inbound' | 'outbound' | 'system';

export type MessageStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read';

export type ConversationStatus =
  | 'active'
  | 'archived'
  | 'spam'
  | 'blocked';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================
// AI Intent Types
// ============================================

export type DetectedIntent =
  | 'scheduling'      // Client wants to schedule/reschedule
  | 'inquiry'         // General question about services
  | 'complaint'       // Issue or complaint
  | 'payment'         // Payment related
  | 'confirmation'    // Confirming appointment/quote
  | 'cancellation'    // Wants to cancel
  | 'follow_up'       // Following up on previous work
  | 'urgent'          // Urgent/emergency request
  | 'appreciation'    // Thank you/positive feedback
  | 'unknown';        // Could not determine intent

export interface IntentDetection {
  intent: DetectedIntent;
  confidence: number; // 0-1
  keywords: string[];
  suggestedAction?: string;
}

// ============================================
// Smart Reply Types
// ============================================

export interface SmartReply {
  id: string;
  text: string;
  tone: 'professional' | 'friendly' | 'empathetic' | 'direct';
  confidence: number;
  intent?: DetectedIntent;
  reasoning?: string; // Why this reply is appropriate (from enhanced mode)
}

// Enhanced smart reply with conversation insights
export interface EnhancedSmartReplyResponse {
  replies: SmartReply[];
  insights: ConversationInsights | null;
}

export interface ConversationInsights {
  clientSentiment: 'positive' | 'neutral' | 'negative';
  topicsDiscussed: string[];
  unresolvedQuestions: string[];
  suggestedFollowUp: string;
}

// One-click reply response
export interface OneClickReply {
  text: string;
  confidence: number;
  suggestedAction?: string;
}

export interface SmartReplyRequest {
  conversationId: string;
  channel: MessageChannel;
  recentMessages: UnifiedMessage[];
  clientName: string;
  replyStyle?: 'short' | 'detailed' | 'action-oriented';
  maxReplies?: number;
  businessContext?: {
    activeJobs?: number;
    pendingInvoices?: number;
    pendingEstimates?: number;
    lastServiceDate?: string;
    clientHistory?: string;
    urgencyLevel?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

// ============================================
// Unified Conversation Type
// ============================================

export interface UnifiedConversation {
  id: string;
  channel: MessageChannel;
  user_id: string;
  client_id: string | null;
  organization_id: string | null;

  // Contact info
  contact_identifier: string; // Phone for SMS, email for Email
  business_identifier: string | null; // Business phone/email
  subject: string | null; // For email threads

  // Last message info
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;

  // Status
  status: ConversationStatus;
  is_archived: boolean;
  is_starred: boolean;
  assigned_to: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Client info (joined)
  client_name: string | null;
  client_email: string | null;
  client_phone_formatted: string | null;

  // Computed/UI fields (not from DB)
  hasActiveJob?: boolean;
  activeJobId?: string;
  needsReply?: boolean;
  lastInboundAt?: string;
}

// ============================================
// Unified Message Type
// ============================================

export interface UnifiedMessage {
  id: string;
  channel: MessageChannel;
  conversation_id: string;
  user_id: string | null;

  // Message content
  direction: MessageDirection;
  sender: string;
  recipient: string;
  body: string;
  subject: string | null;
  html_body: string | null;

  // Attachments
  attachments: MessageAttachment[] | null;

  // Status
  is_read: boolean;
  status: MessageStatus;

  // AI enrichment
  ai_intent: DetectedIntent | null;
  ai_confidence: number | null;
  ai_suggested_replies?: SmartReply[];

  // Metadata
  metadata: Record<string, any>;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
}

// ============================================
// In-App Message Type (New Channel)
// ============================================

export interface InAppMessage {
  id: string;
  user_id: string;
  organization_id: string | null;
  client_id: string | null;

  // Content
  direction: MessageDirection;
  title: string | null;
  body: string;
  message_type: InAppMessageType;

  // Status
  is_read: boolean;
  priority: MessagePriority;

  // Linking
  job_id: string | null;
  estimate_id: string | null;
  invoice_id: string | null;

  // AI enrichment
  ai_intent: DetectedIntent | null;
  ai_confidence: number | null;

  // Metadata
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type InAppMessageType =
  | 'notification'
  | 'reminder'
  | 'alert'
  | 'update'
  | 'job_status'
  | 'payment'
  | 'system';

// ============================================
// Filter & Category Types
// ============================================

export type SmartCategory =
  | 'all'
  | 'needs_reply'
  | 'active_jobs'
  | 'scheduled'
  | 'unread'
  | 'starred'
  | 'sms_only'
  | 'email_only'
  | 'in_app_only'
  | 'archived';

export interface ConversationFilter {
  category: SmartCategory;
  channel?: MessageChannel;
  clientId?: string;
  assignedTo?: string;
  hasJob?: boolean;
  isUnread?: boolean;
  isStarred?: boolean;
  searchQuery?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface CategoryCount {
  category: SmartCategory;
  count: number;
  unreadCount: number;
}

// ============================================
// API Response Types
// ============================================

export interface ConversationListResponse {
  conversations: UnifiedConversation[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessageListResponse {
  messages: UnifiedMessage[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ConversationCountsResponse {
  sms: { total: number; unread: number };
  email: { total: number; unread: number };
  in_app: { total: number; unread: number };
  needs_reply: number;
  active_jobs: number;
}

// ============================================
// Gemini AI Types
// ============================================

export type GeminiAIAction =
  | 'smart_replies'
  | 'enhanced_smart_replies'
  | 'one_click_reply'
  | 'detect_intent'
  | 'summarize'
  | 'compose';

export interface GeminiAIRequest {
  action: GeminiAIAction;
  conversationId?: string;
  messages: UnifiedMessage[];
  clientName?: string;
  businessContext?: BusinessContext;
  prompt?: string;
  replyStyle?: 'short' | 'detailed' | 'action-oriented';
  maxReplies?: number;
}

export interface GeminiAIResponse {
  success: boolean;
  action: GeminiAIAction;
  result: EnhancedSmartReplyResponse | OneClickReply | IntentDetection | ConversationSummary | ComposedMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface ConversationSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ComposedMessage {
  message: string;
  subject?: string;
}

export interface BusinessContext {
  businessName: string;
  industry: string;
  tone?: 'professional' | 'friendly' | 'casual';
  activeJobs?: number;
  pendingEstimates?: number;
  pendingInvoices?: number;
  lastServiceDate?: string;
  clientHistory?: string;
}

// ============================================
// Real-time Subscription Types
// ============================================

export type MessagingEvent =
  | 'new_message'
  | 'message_status_update'
  | 'conversation_update'
  | 'new_conversation';

export interface MessagingEventPayload {
  event: MessagingEvent;
  channel: MessageChannel;
  conversationId: string;
  messageId?: string;
  data: UnifiedMessage | UnifiedConversation;
}

// ============================================
// Context State Types
// ============================================

export interface UnifiedMessagingState {
  // Data
  conversations: UnifiedConversation[];
  activeConversation: UnifiedConversation | null;
  messages: UnifiedMessage[];
  categoryCounts: ConversationCountsResponse | null;

  // Filters
  activeFilter: ConversationFilter;
  searchQuery: string;

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  isLoadingAI: boolean;

  // AI state
  smartReplies: SmartReply[];
  detectedIntent: IntentDetection | null;

  // Pagination
  hasMoreConversations: boolean;
  hasMoreMessages: boolean;
}

export interface UnifiedMessagingActions {
  // Conversation actions
  loadConversations: (filter?: ConversationFilter) => Promise<void>;
  selectConversation: (conversation: UnifiedConversation) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  starConversation: (id: string, starred: boolean) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;

  // Message actions
  loadMessages: (conversationId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (conversationId: string, body: string, channel?: MessageChannel) => Promise<void>;

  // AI actions
  generateSmartReplies: (conversationId: string) => Promise<SmartReply[]>;
  detectIntent: (message: string) => Promise<IntentDetection>;

  // Filter actions
  setFilter: (filter: Partial<ConversationFilter>) => void;
  setSearchQuery: (query: string) => void;

  // Refresh
  refresh: () => Promise<void>;
}

// ============================================
// Component Props Types
// ============================================

export interface UnifiedInboxProps {
  defaultFilter?: SmartCategory;
  showCategories?: boolean;
  showAIFeatures?: boolean;
}

export interface ConversationListProps {
  conversations: UnifiedConversation[];
  activeConversationId?: string;
  onSelect: (conversation: UnifiedConversation) => void;
  isLoading?: boolean;
}

export interface ConversationThreadProps {
  conversation: UnifiedConversation;
  messages: UnifiedMessage[];
  onSend: (message: string) => void;
  isSending?: boolean;
  smartReplies?: SmartReply[];
  detectedIntent?: IntentDetection | null;
}

export interface SmartRepliesProps {
  replies: SmartReply[];
  onSelect: (reply: SmartReply) => void;
  isLoading?: boolean;
}

export interface ChannelBadgeProps {
  channel: MessageChannel;
  size?: 'sm' | 'md' | 'lg';
}

export interface IntentBadgeProps {
  intent: DetectedIntent;
  confidence?: number;
  showConfidence?: boolean;
}
