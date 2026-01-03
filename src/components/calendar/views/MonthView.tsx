import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarStore, CalendarEvent, useCalendarContext } from "../CalendarProvider";

interface MonthViewProps {
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({ className }: MonthViewProps) {
  const currentDate = useCalendarStore((state) => state.currentDate);
  const events = useCalendarStore((state) => state.events);
  const { onSlotClick, onEventClick } = useCalendarContext();
  const setSelectedEvent = useCalendarStore((state) => state.setSelectedEvent);

  // Generate all days to display (including padding days from prev/next month)
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group events by date
  const eventsByDate = React.useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const dateKey = format(new Date(event.start), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const handleDayClick = (day: Date) => {
    onSlotClick?.(day);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    onEventClick?.(event);
  };

  // Keyboard handler for day cells
  const handleDayKeyDown = (e: React.KeyboardEvent, day: Date) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDayClick(day);
    }
  };

  // Keyboard handler for events
  const handleEventKeyDown = (e: React.KeyboardEvent, event: CalendarEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setSelectedEvent(event);
      onEventClick?.(event);
    }
  };

  // Split days into weeks
  const weeks = React.useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div
      className={cn("flex flex-col flex-1", className)}
      role="grid"
      aria-label={`Calendar for ${format(currentDate, "MMMM yyyy")}`}
    >
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border" role="row">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
            role="columnheader"
            aria-label={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index]}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6" role="rowgroup">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-border last:border-b-0" role="row">
            {week.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const dayLabel = format(day, "EEEE, MMMM d, yyyy");
              const eventCount = dayEvents.length;

              return (
                <div
                  key={dateKey}
                  role="gridcell"
                  tabIndex={0}
                  aria-label={`${dayLabel}${eventCount > 0 ? `, ${eventCount} event${eventCount > 1 ? "s" : ""}` : ""}`}
                  aria-current={isCurrentDay ? "date" : undefined}
                  className={cn(
                    "min-h-[100px] p-1 border-r border-border last:border-r-0 cursor-pointer",
                    "hover:bg-accent/50 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",
                    !isCurrentMonth && "bg-muted/30",
                    isCurrentDay && "bg-primary/5"
                  )}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => handleDayKeyDown(e, day)}
                >
                  {/* Day number */}
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                        !isCurrentMonth && "text-muted-foreground",
                        isCurrentDay && "bg-primary text-primary-foreground font-semibold"
                      )}
                      aria-hidden="true"
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="mt-1 space-y-0.5" role="list" aria-label="Events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${event.title} at ${format(new Date(event.start), "h:mm a")}`}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded truncate cursor-pointer",
                          "hover:opacity-80 transition-opacity",
                          "focus:outline-none focus:ring-2 focus:ring-white/50"
                        )}
                        style={{
                          backgroundColor: event.backgroundColor || "#3b82f6",
                          color: event.textColor || "#ffffff",
                        }}
                        onClick={(e) => handleEventClick(event, e)}
                        onKeyDown={(e) => handleEventKeyDown(e, event)}
                      >
                        <span aria-hidden="true">
                          {format(new Date(event.start), "h:mm")} {event.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1" aria-hidden="true">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
