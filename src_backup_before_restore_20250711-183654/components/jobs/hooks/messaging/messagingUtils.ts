import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendMessageParams {
  content: string;
  clientPhone: string;
  jobId?: string;
  clientId?: string;
  existingConversationId?: string | null;
}

interface MessageResult {
  success: boolean;
  error?: string;
  conversationId?: string;
}

export const sendClientMessage = async ({
  content,
  clientPhone,
  jobId = "",
  clientId,
  existingConversationId
}: SendMessageParams): Promise<MessageResult> => {
  console.log("sendClientMessage called with:", {
    content: content.substring(0, 50) + "...",
    clientPhone,
    jobId,
    clientId,
    existingConversationId
  });

  if (!content.trim()) {
    console.error("Message content is empty");
    return { success: false, error: "Message content cannot be empty" };
  }

  if (!clientPhone) {
    console.error("Client phone number is required");
    return { success: false, error: "Client phone number is required" };
  }

  try {
    console.log("Calling telnyx-sms function...");
    
    // Get current user ID for message storage
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.error("User not authenticated");
      return { success: false, error: "User authentication required" };
    }
    
    // Send SMS via Telnyx edge function - let it handle conversation creation and message storage
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: clientPhone,
        message: content,
        client_id: clientId || '',
        job_id: jobId || '',
        user_id: userId,
        conversation_id: existingConversationId // Pass existing conversation ID if available
      }
    });

    console.log("telnyx-sms response:", { data, error });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message || 'Failed to send message');
    }

    if (!data?.success) {
      console.error("SMS sending failed:", data);
      throw new Error(data?.error || 'Failed to send message');
    }

    console.log("Message sent successfully via telnyx-sms");
    
    return { 
      success: true, 
      conversationId: data.conversationId || existingConversationId || undefined
    };

  } catch (error) {
    console.error("Error in sendClientMessage:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage
    };
  }
};
