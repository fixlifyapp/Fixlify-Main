import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "../CalendarProvider";
import { AlertTriangle, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface ConflictIndicatorProps {
  conflicts: CalendarEvent[];
  targetTime: Date;
  severity?: "warning" | "error";
  className?: string;
}

export function ConflictIndicator({
  conflicts,
  targetTime,
  severity = "error",
  className,
}: ConflictIndicatorProps) {
  if (conflicts.length === 0) return null;

  const Icon = severity === "error" ? XCircle : AlertTriangle;
  const colors =
    severity === "error"
      ? {
          bg: "bg-red-500/20",
          border: "border-red-500",
          text: "text-red-600 dark:text-red-400",
          icon: "text-red-500",
        }
      : {
          bg: "bg-amber-500/20",
          border: "border-amber-500",
          text: "text-amber-600 dark:text-amber-400",
          icon: "text-amber-500",
        };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded border",
              colors.bg,
              colors.border,
              className
            )}
          >
            <Icon className={cn("h-4 w-4", colors.icon)} />
            <span className={cn("text-xs font-medium", colors.text)}>
              {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-2">
            <p className={cn("font-medium text-sm", colors.text)}>
              {severity === "error" ? "Scheduling Conflict" : "Potential Overlap"}
            </p>
            <p className="text-xs text-muted-foreground">
              Target time: {format(targetTime, "h:mm a")}
            </p>
            <div className="space-y-1.5">
              {conflicts.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-1.5 bg-muted/50 rounded text-xs"
                >
                  <div
                    className="h-3 w-1 rounded-full mt-0.5"
                    style={{ backgroundColor: event.backgroundColor || "#3b82f6" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.start), "h:mm a")} -{" "}
                      {format(new Date(event.end), "h:mm a")}
                    </p>
                    {event.extendedProps?.clientName && (
                      <p className="text-muted-foreground truncate">
                        {event.extendedProps.clientName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              {severity === "error"
                ? "This technician already has jobs scheduled during this time."
                : "This slot may have overlapping commitments."}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Inline conflict warning for drag feedback
export function ConflictOverlay({
  show,
  message,
  className,
}: {
  show: boolean;
  message?: string;
  className?: string;
}) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-[1px] pointer-events-none z-10",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-md shadow-lg animate-pulse">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          {message || "Conflict detected"}
        </span>
      </div>
    </div>
  );
}

// Business hours warning indicator
export function OutsideHoursIndicator({
  className,
}: {
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-muted/50 text-muted-foreground border border-dashed border-muted-foreground/30",
              className
            )}
          >
            <span>Outside hours</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>This time slot is outside of business hours</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
