
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface UseEmailAIProps {
  email: {
    id: string;
    subject: string;
    body: string;
    email_address: string;
    clients?: {
      name: string;
    } | null;
  } | null;
  onUseSuggestion: (content: string) => void;
}

export const useEmailAI = ({ email, onUseSuggestion }: UseEmailAIProps) => {
  const { user } = useAuth();
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: `You are a professional customer service representative. You are responding to customer emails. Always be courteous, professional, and helpful. Keep responses concise and actionable.`
  });

  const handleSuggestResponse = async () => {
    if (isAILoading || !email) return;
    
    try {
      // Get user profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, business_niche')
        .eq('id', user?.id)
        .single();

      const userName = profile?.name || user?.email || "Customer Service Representative";
      const companyNiche = profile?.business_niche || "Service Company";
      const clientName = email.clients?.name || "Valued Customer";
      
      const contextPrompt = `
You are ${userName} from ${companyNiche} responding to an email from ${clientName} (${email.email_address}).

Email Subject: "${email.subject}"
Email Content: "${email.body}"

Generate a professional email response that:
1. Addresses the customer by name (${clientName})
2. Acknowledges their email and shows you understand their message
3. Provides helpful information or next steps
4. Maintains a professional but friendly tone
5. Signs off with your name (${userName})

Keep the response concise and actionable. Format it as a proper email response.`;
      
      const suggestedResponse = await generateText(contextPrompt);
      
      if (suggestedResponse) {
        toast.success("AI email response ready", {
          description: "Click 'Use' to apply the suggested response",
          action: {
            label: "Use",
            onClick: () => {
              onUseSuggestion(suggestedResponse);
            }
          }
        });
      }
    } catch (error) {
      console.error("AI email suggestion error:", error);
      toast.error("Failed to generate email response");
    }
  };

  return {
    isAILoading,
    handleSuggestResponse
  };
};
