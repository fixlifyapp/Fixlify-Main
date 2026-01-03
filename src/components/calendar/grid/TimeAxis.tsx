import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "../CalendarProvider";

interface TimeAxisProps {
  className?: string;
}

export function TimeAxis({ className }: TimeAxisProps) {
  const getTimeSlots = useCalendarStore((state) => state.getTimeSlots);
  const slotDuration = useCalendarStore((state) => state.slotDuration);
  const slots = getTimeSlots();

  // Calculate slot height based on duration (30 min = 48px, 60 min = 96px)
  const slotHeight = (slotDuration / 30) * 48;

  return (
    <div className={cn("flex flex-col w-16 flex-shrink-0 border-r border-border", className)}>
      {/* Empty header spacer to align with day headers */}
      <div className="h-12 border-b border-border" />

      {/* Time labels */}
      <div className="flex-1 relative">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="absolute right-2 text-xs text-muted-foreground -translate-y-1/2"
            style={{ top: `${index * slotHeight}px` }}
          >
            {format(slot, "h:mm a")}
          </div>
        ))}
      </div>
    </div>
  );
}
