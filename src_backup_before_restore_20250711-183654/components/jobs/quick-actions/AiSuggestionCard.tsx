
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, DollarSign, Clock, UserPlus, Zap, Brain } from "lucide-react";
import { AiSuggestion } from "./types";
import { toast } from "sonner";

interface AiSuggestionCardProps {
  suggestion: AiSuggestion;
  onFeedback: (id: number, isPositive: boolean) => void;
}

export const AiSuggestionCard = ({ suggestion, onFeedback }: AiSuggestionCardProps) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border animate-fade-in", 
        suggestion.type === 'info' && "border-fixlyfy-info/20 bg-fixlyfy-info/5", 
        suggestion.type === 'recommendation' && "border-fixlyfy/20 bg-fixlyfy/5", 
        suggestion.type === 'insight' && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5", 
        suggestion.type === 'warning' && "border-red-400/20 bg-red-400/5", 
        suggestion.type === 'upsell' && "border-green-400/20 bg-green-400/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-0.5 p-1.5 rounded-md", 
          suggestion.type === 'info' && "bg-fixlyfy-info/20", 
          suggestion.type === 'recommendation' && "bg-fixlyfy/20", 
          suggestion.type === 'insight' && "bg-fixlyfy-warning/20", 
          suggestion.type === 'warning' && "bg-red-400/20", 
          suggestion.type === 'upsell' && "bg-green-400/20"
        )}>
          {suggestion.category === "revenue" ? <DollarSign size={14} /> : 
          suggestion.category === "efficiency" ? <Clock size={14} /> : 
          suggestion.category === "customer" ? <UserPlus size={14} /> : 
          suggestion.category === "sales" ? <Zap size={14} /> : 
          <Brain size={14} />}
        </div>
        <div className="flex-1">
          <p className="text-sm text-fixlyfy-text-secondary">{suggestion.tip}</p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => onFeedback(suggestion.id, true)}
              >
                <ThumbsUp size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => onFeedback(suggestion.id, false)}
              >
                <ThumbsDown size={14} />
              </Button>
            </div>
            {suggestion.action && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-6 text-xs font-medium" 
                onClick={suggestion.action.onClick}
              >
                {suggestion.action.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
