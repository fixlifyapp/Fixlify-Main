import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, User, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AIRecommendation } from "./useAIScheduling";

interface AIFormHintProps {
  recommendation: AIRecommendation | null;
  alternativeRecommendations?: AIRecommendation[];
  isLoading?: boolean;
  onAccept?: (recommendation: AIRecommendation) => void;
  onRequestNew?: () => void;
  className?: string;
}

export function AIFormHint({
  recommendation,
  alternativeRecommendations = [],
  isLoading = false,
  onAccept,
  onRequestNew,
  className,
}: AIFormHintProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (isLoading) {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border border-primary/20 bg-primary/5",
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Finding optimal scheduling...</span>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>AI scheduling recommendations available</span>
          </div>
          {onRequestNew && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRequestNew}
              className="text-xs"
            >
              Get suggestions
            </Button>
          )}
        </div>
      </div>
    );
  }

  const { slot, technician, score, reasoning } = recommendation;

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        score >= 80
          ? "border-green-500/50 bg-green-500/5"
          : score >= 60
          ? "border-yellow-500/50 bg-yellow-500/5"
          : "border-orange-500/50 bg-orange-500/5",
        className
      )}
    >
      {/* Main recommendation */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-1.5 rounded-full",
                score >= 80
                  ? "bg-green-500/20"
                  : score >= 60
                  ? "bg-yellow-500/20"
                  : "bg-orange-500/20"
              )}
            >
              <Sparkles
                className={cn(
                  "h-4 w-4",
                  score >= 80
                    ? "text-green-500"
                    : score >= 60
                    ? "text-yellow-500"
                    : "text-orange-500"
                )}
              />
            </div>
            <div>
              <div className="text-sm font-medium">AI Recommendation</div>
              <div className="text-xs text-muted-foreground">
                Best available slot
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-bold",
              score >= 80
                ? "bg-green-500/20 text-green-700"
                : score >= 60
                ? "bg-yellow-500/20 text-yellow-700"
                : "bg-orange-500/20 text-orange-700"
            )}
          >
            {score}% match
          </Badge>
        </div>

        {/* Slot details */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {format(slot.start, "EEE, MMM d")} at {format(slot.start, "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{technician.name}</span>
          </div>
        </div>

        {/* Reasoning */}
        {reasoning.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {reasoning.slice(0, 2).map((reason, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {reason}
              </span>
            ))}
            {reasoning.length > 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{reasoning.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAccept?.(recommendation)}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Use this slot
          </Button>
          {alternativeRecommendations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? "Hide" : "Show"} alternatives
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 ml-1 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Alternative recommendations */}
      {alternativeRecommendations.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="border-t bg-muted/30 p-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Alternative slots:
              </div>
              {alternativeRecommendations.map((alt, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors text-sm"
                  onClick={() => onAccept?.(alt)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {format(alt.slot.start, "EEE h:mm a")}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>{alt.technician.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      alt.score >= 80
                        ? "border-green-500/50 text-green-600"
                        : alt.score >= 60
                        ? "border-yellow-500/50 text-yellow-600"
                        : "border-orange-500/50 text-orange-600"
                    )}
                  >
                    {alt.score}%
                  </Badge>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

/**
 * Compact inline hint for forms
 */
interface AIInlineHintProps {
  recommendation: AIRecommendation | null;
  isLoading?: boolean;
  onAccept?: (recommendation: AIRecommendation) => void;
}

export function AIInlineHint({
  recommendation,
  isLoading,
  onAccept,
}: AIInlineHintProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Finding best time...</span>
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <button
      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
      onClick={() => onAccept?.(recommendation)}
    >
      <Sparkles className="h-3 w-3" />
      <span>
        Best: {format(recommendation.slot.start, "EEE h:mm a")} with{" "}
        {recommendation.technician.name}
      </span>
    </button>
  );
}
