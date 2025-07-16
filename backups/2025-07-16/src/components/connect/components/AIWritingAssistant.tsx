
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";

interface AIWritingAssistantProps {
  onUseSuggestion: (text: string) => void;
  clientName?: string;
  conversationContext?: string;
  disabled?: boolean;
}

export const AIWritingAssistant = ({ 
  onUseSuggestion, 
  clientName = "the client", 
  conversationContext = "",
  disabled = false 
}: AIWritingAssistantProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { generateText, isLoading } = useAI({
    systemContext: `You are a professional customer service assistant. Generate helpful, polite, and professional messages for business communication. Keep responses concise and actionable.`
  });

  const quickSuggestions = [
    {
      label: "Greeting",
      prompt: `Generate a friendly professional greeting message to ${clientName}`
    },
    {
      label: "Follow up",
      prompt: `Generate a polite follow-up message to ${clientName} asking about their service needs`
    },
    {
      label: "Reminder",
      prompt: `Generate a professional appointment reminder message for ${clientName}`
    },
    {
      label: "Thank you",
      prompt: `Generate a professional thank you message to ${clientName} for their business`
    }
  ];

  const handleQuickSuggestion = async (prompt: string) => {
    if (isLoading || disabled) return;

    try {
      const contextualPrompt = conversationContext 
        ? `${prompt}. Context of previous conversation: ${conversationContext.slice(-200)}...`
        : prompt;

      const suggestion = await generateText(contextualPrompt);
      
      if (suggestion) {
        onUseSuggestion(suggestion);
        toast.success("AI suggestion applied!");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to generate suggestion");
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim() || isLoading || disabled) return;

    try {
      const fullPrompt = `Generate a professional message to ${clientName}: ${customPrompt}`;
      const suggestion = await generateText(fullPrompt);
      
      if (suggestion) {
        onUseSuggestion(suggestion);
        setCustomPrompt("");
        toast.success("Custom AI suggestion applied!");
      }
    } catch (error) {
      console.error("Custom AI suggestion error:", error);
      toast.error("Failed to generate custom suggestion");
    }
  };

  return (
    <div className="border-t border-fixlyfy-border/50 bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
      <div className="p-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-3 w-3 text-fixlyfy" />
            <span className="text-xs font-medium text-fixlyfy-text">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-5 w-5 p-0"
            disabled={disabled}
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Compact Quick Suggestions - Always visible */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          {quickSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSuggestion(suggestion.prompt)}
              disabled={isLoading || disabled}
              className="text-xs h-6 px-1 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
            >
              {isLoading ? (
                <Loader2 className="h-2 w-2 animate-spin" />
              ) : (
                <Sparkles className="h-2 w-2" />
              )}
              <span className="ml-1 truncate">{suggestion.label}</span>
            </Button>
          ))}
        </div>

        {/* Custom Prompt - Only when expanded */}
        {isExpanded && (
          <div className="space-y-2">
            <Textarea
              placeholder="Describe what you want to write..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading || disabled}
              className="min-h-[50px] text-xs border-fixlyfy-border/50 focus:ring-fixlyfy/20 focus:border-fixlyfy"
            />
            <Button
              onClick={handleCustomPrompt}
              disabled={!customPrompt.trim() || isLoading || disabled}
              size="sm"
              className="w-full h-7 bg-fixlyfy hover:bg-fixlyfy-light text-white text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-2 w-2 animate-spin mr-1" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="h-2 w-2 mr-1" />
                  Generate Custom Message
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
