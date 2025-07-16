
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface UseMessageAIProps {
  messages: any[];
  client: {
    name: string;
    phone?: string;
    id?: string;
  };
  jobId: string;
  onUseSuggestion: (content: string) => void;
}

export const useMessageAI = ({ messages, client, jobId, onUseSuggestion }: UseMessageAIProps) => {
  const { user } = useAuth();
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: `You are a professional field service representative. You are responding to messages from clients about their service jobs. Always be courteous, professional, and helpful. Keep responses concise and actionable.`
  });

  const handleSuggestResponse = async () => {
    if (isAILoading) return;
    
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.direction === "outbound") {
        toast.info("Waiting for client response before suggesting a reply.");
        return;
      }

      // Get user profile and company information
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, business_niche')
        .eq('id', user?.id)
        .single();

      // Get job details for context
      const { data: job } = await supabase
        .from('jobs')
        .select('title, service, description, status')
        .eq('id', jobId)
        .single();

      const userName = profile?.name || user?.email || "Service Representative";
      const companyNiche = profile?.business_niche || "Field Service";
      const clientName = client.name || "Valued Client";
      
      const contextPrompt = `
You are ${userName} from ${companyNiche} company responding to ${clientName}.

Job Context:
- Job Title: ${job?.title || 'Service Call'}
- Service Type: ${job?.service || 'General Service'}
- Job Status: ${job?.status || 'In Progress'}
- Description: ${job?.description || 'Service job'}

Client's last message: "${lastMessage.body}"

Generate a professional response that:
1. Addresses the client by name (${clientName})
2. Shows you understand their concern/question
3. Provides helpful information or next steps
4. Maintains a professional but friendly tone
5. Signs off with your name (${userName})

Keep the response concise and actionable.`;
      
      const suggestedResponse = await generateText(contextPrompt);
      
      if (suggestedResponse) {
        toast.success("AI suggestion ready", {
          description: suggestedResponse,
          action: {
            label: "Use",
            onClick: () => {
              onUseSuggestion(suggestedResponse);
            }
          }
        });
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to generate response suggestion");
    }
  };

  return {
    isAILoading,
    handleSuggestResponse
  };
};
