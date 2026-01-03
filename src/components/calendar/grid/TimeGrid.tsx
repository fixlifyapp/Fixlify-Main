import * as React from "react";
import { format, isSameDay, isToday, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarStore, CalendarEvent } from "../CalendarProvider";
import { TimeSlot } from "./TimeSlot";
import { TimeAxis } from "./TimeAxis";
import { CalendarEventBlock } from "../CalendarEvent";
import { NowIndicator } from "../NowIndicator";

interface TimeGridProps {
  days: Date[];
  resourceId?: string;
  className?: string;
  showTimeAxis?: boolean;
  showDayHeaders?: boolean;
}

export function TimeGrid({
  days,
  resourceId,
  className,
  showTimeAxis = true,
  showDayHeaders = true,
}: TimeGridProps) {
  const events = useCalendarStore((state) => state.events);
  const getTimeSlots = useCalendarStore((state) => state.getTimeSlots);
  const slotDuration = useCalendarStore((state) => state.slotDuration);
  const timeSlots = getTimeSlots();

  // Filter events for the visible days and resource
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const matchesResource = resourceId ? event.resourceId === resourceId : true;
      const matchesDay = days.some((day) => isSameDay(eventStart, day));
      return matchesResource && matchesDay;
    });
  }, [events, days, resourceId]);

  // Group events by day
  const eventsByDay = React.useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    days.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      grouped[dayKey] = filteredEvents.filter((event) =>
        isSameDay(new Date(event.start), day)
      );
    });
    return grouped;
  }, [filteredEvents, days]);

  // Calculate slot height (30 min = 48px)
  const slotHeight = (slotDuration / 30) * 48;
  const totalGridHeight = timeSlots.length * slotHeight;

  // Keyboard navigation handler
  const handleGridKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const slotId = target.getAttribute("data-slot-id");
      if (!slotId) return;

      // Parse current position from slot id
      const slotIndex = Array.from(
        target.parentElement?.children || []
      ).indexOf(target);
      const dayColumn = target.closest("[data-day-index]") as HTMLElement;
      const dayIndex = parseInt(dayColumn?.getAttribute("data-day-index") || "0");

      let nextSlotIndex = slotIndex;
      let nextDayIndex = dayIndex;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          nextSlotIndex = Math.max(0, slotIndex - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          nextSlotIndex = Math.min(timeSlots.length - 1, slotIndex + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextDayIndex = Math.max(0, dayIndex - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          nextDayIndex = Math.min(days.length - 1, dayIndex + 1);
          break;
        default:
          return;
      }

      // Find and focus the target slot
      const targetDayColumn = document.querySelector(
        `[data-day-index="${nextDayIndex}"]`
      );
      const targetSlot = targetDayColumn?.querySelectorAll(
        '[role="gridcell"]'
      )[nextSlotIndex] as HTMLElement;
      targetSlot?.focus();
    },
    [timeSlots.length, days.length]
  );

  return (
    <div
      className={cn("flex flex-1 min-h-0", className)}
      role="grid"
      aria-label="Calendar time grid"
      onKeyDown={handleGridKeyDown}
    >
      {/* Time axis */}
      {showTimeAxis && <TimeAxis />}

      {/* Days grid */}
      <div className="flex-1 flex overflow-x-auto overflow-y-auto" role="rowgroup">
        {days.map((day, dayIndex) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[dayKey] || [];
          const todayClass = isToday(day);

          return (
            <div
              key={dayKey}
              className={cn(
                "flex-1 min-w-[120px] flex flex-col border-r border-border last:border-r-0",
                todayClass && "bg-primary/5"
              )}
              role="row"
              data-day-index={dayIndex}
              aria-label={format(day, "EEEE, MMMM d, yyyy")}
            >
              {/* Day header */}
              {showDayHeaders && (
                <div
                  className={cn(
                    "h-12 flex flex-col items-center justify-center border-b border-border",
                    todayClass && "bg-primary/10"
                  )}
                  role="columnheader"
                  aria-label={format(day, "EEEE, MMMM d")}
                >
                  <span className="text-xs text-muted-foreground" aria-hidden="true">
                    {format(day, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      todayClass && "text-primary"
                    )}
                    aria-hidden="true"
                  >
                    {format(day, "d")}
                  </span>
                  {todayClass && <span className="sr-only">Today</span>}
                </div>
              )}

              {/* Time slots container */}
              <div className="relative" style={{ height: `${totalGridHeight}px`, minHeight: `${totalGridHeight}px` }}>
                {/* Time slots grid */}
                <div className="absolute inset-0">
                  {timeSlots.map((slot, slotIndex) => (
                    <TimeSlot
                      key={`${dayKey}-${slotIndex}`}
                      date={day}
                      time={slot}
                      resourceId={resourceId}
                    />
                  ))}
                </div>

                {/* Events layer */}
                <div className="absolute inset-0 pointer-events-none" aria-live="polite">
                  {dayEvents.map((event) => (
                    <CalendarEventBlock
                      key={event.id}
                      event={event}
                      dayStart={startOfDay(day)}
                      slotHeight={slotHeight}
                      slotDuration={slotDuration}
                    />
                  ))}
                </div>

                {/* Now indicator */}
                {isToday(day) && (
                  <NowIndicator slotHeight={slotHeight} slotDuration={slotDuration} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
