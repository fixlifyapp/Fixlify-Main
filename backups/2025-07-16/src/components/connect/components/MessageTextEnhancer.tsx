
import { useState } from "react";
import { Pencil, Check, Sparkles, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";

interface MessageTextEnhancerProps {
  messageText: string;
  setMessageText: (text: string) => void;
  disabled?: boolean;
}

export const MessageTextEnhancer = ({ 
  messageText, 
  setMessageText, 
  disabled 
}: MessageTextEnhancerProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { generateText } = useAI();

  const enhanceText = async (type: 'professional' | 'grammar' | 'extend') => {
    if (!messageText.trim()) return;
    
    setIsEnhancing(true);
    
    try {
      let prompt = "";
      let systemContext = "";
      
      switch (type) {
        case 'professional':
          prompt = `Rewrite this message to make it more professional and polished while keeping the same meaning: "${messageText}"`;
          systemContext = "You are a professional writing assistant. Rewrite messages to be more professional, clear, and polished while maintaining the original intent and tone appropriateness.";
          break;
        case 'grammar':
          prompt = `Correct the grammar, spelling, and punctuation in this message while keeping the same tone and meaning: "${messageText}"`;
          systemContext = "You are a grammar and spelling correction assistant. Fix errors while preserving the original tone and meaning.";
          break;
        case 'extend':
          prompt = `Extend and improve this message by adding more detail and clarity while keeping it natural and appropriate for a business communication: "${messageText}"`;
          systemContext = "You are a writing assistant that helps extend and improve messages by adding relevant detail and clarity.";
          break;
      }
      
      const enhancedText = await generateText(prompt, {
        systemContext,
        temperature: 0.3,
        maxTokens: 200
      });
      
      if (enhancedText) {
        // Remove quotes if the AI wrapped the response in them
        const cleanedText = enhancedText.replace(/^["'](.*)["']$/s, '$1').trim();
        setMessageText(cleanedText);
        toast.success("Message enhanced successfully");
      }
    } catch (error) {
      console.error("Error enhancing message:", error);
      toast.error("Failed to enhance message");
    } finally {
      setIsEnhancing(false);
    }
  };

  if (!messageText.trim()) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || isEnhancing}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          {isEnhancing ? (
            <Sparkles className="h-4 w-4 animate-pulse" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => enhanceText('professional')}
          disabled={isEnhancing}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Make Professional
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => enhanceText('grammar')}
          disabled={isEnhancing}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Fix Grammar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => enhanceText('extend')}
          disabled={isEnhancing}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          Extend Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
