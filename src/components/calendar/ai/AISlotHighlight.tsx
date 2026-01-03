import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, User } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AIRecommendation } from "./useAIScheduling";

interface AISlotHighlightProps {
  recommendation: AIRecommendation;
  slotHeight: number;
  className?: string;
  onClick?: () => void;
}

export function AISlotHighlight({
  recommendation,
  slotHeight,
  className,
  onClick,
}: AISlotHighlightProps) {
  const { slot, technician, score, reasoning } = recommendation;

  // Calculate height based on duration
  const durationMinutes =
    (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
  const height = (durationMinutes / 30) * slotHeight;

  // Score-based styling
  const getScoreColor = () => {
    if (score >= 80) return "bg-green-500/20 border-green-500";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500";
    return "bg-orange-500/20 border-orange-500";
  };

  const getScoreBadgeColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute inset-x-0 cursor-pointer transition-all",
              "border-l-4 rounded-r-md",
              "hover:ring-2 hover:ring-primary/50",
              "animate-pulse",
              getScoreColor(),
              className
            )}
            style={{ height: `${height}px` }}
            onClick={onClick}
          >
            {/* AI Badge */}
            <div className="absolute top-1 right-1 flex items-center gap-1">
              <div
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-0.5",
                  getScoreBadgeColor()
                )}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {score}%
              </div>
            </div>

            {/* Slot info */}
            <div className="p-2 pt-6">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {format(slot.start, "h:mm a")} - {format(slot.end, "h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <User className="w-3 h-3" />
                <span className="truncate">{technician.name}</span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[280px]">
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Recommendation
            </div>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technician:</span>
                <span className="font-medium">{technician.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">
                  {format(slot.start, "MMM d, h:mm a")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score:</span>
                <span
                  className={cn(
                    "font-bold",
                    score >= 80
                      ? "text-green-500"
                      : score >= 60
                      ? "text-yellow-500"
                      : "text-orange-500"
                  )}
                >
                  {score}%
                </span>
              </div>
            </div>
            {reasoning.length > 0 && (
              <div className="space-y-1 pt-2 border-t">
                <div className="text-xs font-medium text-muted-foreground">
                  Why this slot:
                </div>
                <ul className="text-xs space-y-0.5">
                  {reasoning.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Click to use this slot
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Overlay container for showing AI recommendations on the calendar grid
 */
interface AISlotOverlayProps {
  recommendations: AIRecommendation[];
  dayStart: Date;
  slotHeight: number;
  slotMinTime: string;
  onSelectSlot?: (recommendation: AIRecommendation) => void;
}

export function AISlotOverlay({
  recommendations,
  dayStart,
  slotHeight,
  slotMinTime,
  onSelectSlot,
}: AISlotOverlayProps) {
  const [minHour] = slotMinTime.split(":").map(Number);

  // Filter recommendations for this day
  const dayRecommendations = recommendations.filter((rec) => {
    return rec.slot.start.toDateString() === dayStart.toDateString();
  });

  if (dayRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {dayRecommendations.map((rec, index) => {
        // Calculate position
        const startMinutes =
          rec.slot.start.getHours() * 60 + rec.slot.start.getMinutes();
        const minStartMinutes = minHour * 60;
        const offsetMinutes = startMinutes - minStartMinutes;
        const topPosition = (offsetMinutes / 30) * slotHeight;

        return (
          <div
            key={`${rec.technician.id}-${rec.slot.start.toISOString()}-${index}`}
            className="absolute pointer-events-auto"
            style={{
              top: `${topPosition}px`,
              left: "2px",
              right: "2px",
            }}
          >
            <AISlotHighlight
              recommendation={rec}
              slotHeight={slotHeight}
              onClick={() => onSelectSlot?.(rec)}
            />
          </div>
        );
      })}
    </div>
  );
}
