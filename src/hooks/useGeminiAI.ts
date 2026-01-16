import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/use-organization";
import {
  SmartReply,
  IntentDetection,
  UnifiedMessage,
  BusinessContext,
  GeminiAIRequest,
  GeminiAIResponse,
  EnhancedSmartReplyResponse,
  OneClickReply,
  ConversationInsights,
} from "@/types/unified-messaging";
import { toast } from "sonner";

interface UseGeminiAIOptions {
  skipCredits?: boolean;
  onError?: (error: string) => void;
}

interface UseGeminiAIReturn {
  // State
  isLoading: boolean;
  smartReplies: SmartReply[];
  detectedIntent: IntentDetection | null;
  conversationInsights: ConversationInsights | null;
  lastError: string | null;

  // Actions
  generateSmartReplies: (
    messages: UnifiedMessage[],
    clientName?: string,
    context?: Partial<BusinessContext>
  ) => Promise<SmartReply[]>;

  // Enhanced AI actions
  generateEnhancedReplies: (
    messages: UnifiedMessage[],
    clientName?: string,
    context?: Partial<BusinessContext>,
    options?: { replyStyle?: "short" | "detailed" | "action-oriented"; maxReplies?: number }
  ) => Promise<EnhancedSmartReplyResponse | null>;

  generateOneClickReply: (
    messages: UnifiedMessage[],
    clientName?: string,
    context?: Partial<BusinessContext>,
    style?: "short" | "detailed" | "action-oriented"
  ) => Promise<OneClickReply | null>;

  detectIntent: (
    message: string | UnifiedMessage[]
  ) => Promise<IntentDetection | null>;

  summarizeConversation: (
    messages: UnifiedMessage[]
  ) => Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    sentiment: "positive" | "neutral" | "negative";
  } | null>;

  composeMessage: (
    prompt: string,
    context?: Partial<BusinessContext>
  ) => Promise<{ message: string; subject?: string } | null>;

  // Reset
  clearReplies: () => void;
  clearIntent: () => void;
  clearInsights: () => void;
}

export function useGeminiAI(options: UseGeminiAIOptions = {}): UseGeminiAIReturn {
  const { skipCredits = false, onError } = options;
  const { organization } = useOrganization();

  const [isLoading, setIsLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<SmartReply[]>([]);
  const [detectedIntent, setDetectedIntent] = useState<IntentDetection | null>(null);
  const [conversationInsights, setConversationInsights] = useState<ConversationInsights | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleError = useCallback(
    (error: string) => {
      setLastError(error);
      if (onError) {
        onError(error);
      } else {
        toast.error(error);
      }
    },
    [onError]
  );

  const callGeminiAI = useCallback(
    async (request: Omit<GeminiAIRequest, "organization_id" | "skip_credits">) => {
      setIsLoading(true);
      setLastError(null);

      try {
        const { data, error } = await supabase.functions.invoke("gemini-ai", {
          body: {
            ...request,
            organization_id: organization?.id,
            skip_credits: skipCredits,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data?.success) {
          throw new Error(data?.error || "Unknown error");
        }

        return data as GeminiAIResponse;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to call Gemini AI";

        // Handle specific errors
        if (errorMessage.includes("Insufficient credits")) {
          handleError("Insufficient credits for AI feature. Please add more credits.");
        } else if (errorMessage.includes("not configured")) {
          handleError("AI features are not configured. Contact support.");
        } else {
          handleError(errorMessage);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [organization?.id, skipCredits, handleError]
  );

  const generateSmartReplies = useCallback(
    async (
      messages: UnifiedMessage[],
      clientName?: string,
      context?: Partial<BusinessContext>
    ): Promise<SmartReply[]> => {
      const formattedMessages = messages.map((m) => ({
        direction: m.direction as "inbound" | "outbound",
        body: m.body,
        sender: m.sender,
        created_at: m.created_at,
      }));

      const response = await callGeminiAI({
        action: "smart_replies",
        messages: formattedMessages,
        clientName,
        businessContext: {
          businessName: organization?.name || undefined,
          ...context,
        },
      });

      if (response?.result) {
        const replies = response.result as SmartReply[];
        setSmartReplies(replies);
        return replies;
      }

      return [];
    },
    [callGeminiAI, organization?.name]
  );

  // Enhanced smart replies with conversation insights
  const generateEnhancedReplies = useCallback(
    async (
      messages: UnifiedMessage[],
      clientName?: string,
      context?: Partial<BusinessContext>,
      options?: { replyStyle?: "short" | "detailed" | "action-oriented"; maxReplies?: number }
    ): Promise<EnhancedSmartReplyResponse | null> => {
      const formattedMessages = messages.map((m) => ({
        direction: m.direction as "inbound" | "outbound",
        body: m.body,
        sender: m.sender,
        created_at: m.created_at,
        metadata: m.metadata,
      }));

      const response = await callGeminiAI({
        action: "enhanced_smart_replies",
        messages: formattedMessages,
        clientName,
        businessContext: {
          businessName: organization?.name || undefined,
          ...context,
        },
        replyStyle: options?.replyStyle || "short",
        maxReplies: options?.maxReplies || 3,
      });

      if (response?.result) {
        const result = response.result as EnhancedSmartReplyResponse;
        setSmartReplies(result.replies || []);
        if (result.insights) {
          setConversationInsights(result.insights);
        }
        return result;
      }

      return null;
    },
    [callGeminiAI, organization?.name]
  );

  // One-click AI reply - generates the single best response
  const generateOneClickReply = useCallback(
    async (
      messages: UnifiedMessage[],
      clientName?: string,
      context?: Partial<BusinessContext>,
      style: "short" | "detailed" | "action-oriented" = "short"
    ): Promise<OneClickReply | null> => {
      const formattedMessages = messages.map((m) => ({
        direction: m.direction as "inbound" | "outbound",
        body: m.body,
        sender: m.sender,
        created_at: m.created_at,
      }));

      const response = await callGeminiAI({
        action: "one_click_reply",
        messages: formattedMessages,
        clientName,
        businessContext: {
          businessName: organization?.name || undefined,
          ...context,
        },
        replyStyle: style,
      });

      if (response?.result) {
        return response.result as OneClickReply;
      }

      return null;
    },
    [callGeminiAI, organization?.name]
  );

  const detectIntent = useCallback(
    async (messageOrMessages: string | UnifiedMessage[]): Promise<IntentDetection | null> => {
      let messages: { direction: "inbound" | "outbound"; body: string; sender: string; created_at: string }[] = [];
      let prompt: string | undefined;

      if (typeof messageOrMessages === "string") {
        prompt = messageOrMessages;
      } else {
        messages = messageOrMessages.map((m) => ({
          direction: m.direction as "inbound" | "outbound",
          body: m.body,
          sender: m.sender,
          created_at: m.created_at,
        }));
      }

      const response = await callGeminiAI({
        action: "detect_intent",
        messages: messages.length > 0 ? messages : undefined,
        prompt,
      });

      if (response?.result) {
        const intent = response.result as IntentDetection;
        setDetectedIntent(intent);
        return intent;
      }

      return null;
    },
    [callGeminiAI]
  );

  const summarizeConversation = useCallback(
    async (messages: UnifiedMessage[]) => {
      const formattedMessages = messages.map((m) => ({
        direction: m.direction as "inbound" | "outbound",
        body: m.body,
        sender: m.sender,
        created_at: m.created_at,
      }));

      const response = await callGeminiAI({
        action: "summarize",
        messages: formattedMessages,
      });

      if (response?.result) {
        return response.result as {
          summary: string;
          keyPoints: string[];
          actionItems: string[];
          sentiment: "positive" | "neutral" | "negative";
        };
      }

      return null;
    },
    [callGeminiAI]
  );

  const composeMessage = useCallback(
    async (prompt: string, context?: Partial<BusinessContext>) => {
      const response = await callGeminiAI({
        action: "compose",
        prompt,
        businessContext: {
          businessName: organization?.name || undefined,
          ...context,
        },
      });

      if (response?.result) {
        return response.result as { message: string; subject?: string };
      }

      return null;
    },
    [callGeminiAI, organization?.name]
  );

  const clearReplies = useCallback(() => {
    setSmartReplies([]);
  }, []);

  const clearIntent = useCallback(() => {
    setDetectedIntent(null);
  }, []);

  const clearInsights = useCallback(() => {
    setConversationInsights(null);
  }, []);

  return {
    isLoading,
    smartReplies,
    detectedIntent,
    conversationInsights,
    lastError,
    generateSmartReplies,
    generateEnhancedReplies,
    generateOneClickReply,
    detectIntent,
    summarizeConversation,
    composeMessage,
    clearReplies,
    clearIntent,
    clearInsights,
  };
}
