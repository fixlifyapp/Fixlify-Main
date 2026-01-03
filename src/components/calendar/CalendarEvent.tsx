import * as React from "react";
import { format, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEvent, STATUS_COLORS, useCalendarContext, useCalendarStore } from "./CalendarProvider";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Clock, MapPin, Phone, User } from "lucide-react";

interface CalendarEventBlockProps {
  event: CalendarEvent;
  dayStart: Date;
  slotHeight: number;
  slotDuration: number;
}

export function CalendarEventBlock({
  event,
  dayStart,
  slotHeight,
  slotDuration,
}: CalendarEventBlockProps) {
  const { onEventClick } = useCalendarContext();
  const setSelectedEvent = useCalendarStore((state) => state.setSelectedEvent);

  // Calculate position and size
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  // Get slot min time from store
  const slotMinTime = useCalendarStore((state) => state.slotMinTime);
  const [minHour] = slotMinTime.split(":").map(Number);

  // Calculate minutes from day start (considering slotMinTime)
  const dayStartTime = new Date(dayStart);
  dayStartTime.setHours(minHour, 0, 0, 0);

  const minutesFromDayStart = differenceInMinutes(eventStart, dayStartTime);
  const eventDuration = differenceInMinutes(eventEnd, eventStart);

  // Convert to pixels
  const pixelsPerMinute = slotHeight / slotDuration;
  const top = minutesFromDayStart * pixelsPerMinute;
  const height = Math.max(eventDuration * pixelsPerMinute, slotHeight / 2); // Min height

  // Get colors
  const colors = event.backgroundColor
    ? { bg: event.backgroundColor, border: event.borderColor || event.backgroundColor, text: event.textColor || "#ffffff" }
    : STATUS_COLORS[event.status];

  // Draggable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: event.id,
    data: {
      type: "event",
      event,
    },
  });

  const style: React.CSSProperties = {
    position: "absolute",
    top: `${top}px`,
    left: "4px",
    right: "4px",
    height: `${height}px`,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    color: colors.text,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 10,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    onEventClick?.(event);
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setSelectedEvent(event);
      onEventClick?.(event);
    }
  };

  // Determine if we have enough space for expanded view
  const isCompact = height < 60;

  // Build accessible label
  const ariaLabel = [
    event.title,
    `${format(eventStart, "EEEE, MMMM d")} from ${format(eventStart, "h:mm a")} to ${format(eventEnd, "h:mm a")}`,
    event.extendedProps?.clientName && `Client: ${event.extendedProps.clientName}`,
    event.extendedProps?.technicianName && `Technician: ${event.extendedProps.technicianName}`,
    event.extendedProps?.address && `Location: ${event.extendedProps.address}`,
    `Status: ${event.status}`,
  ].filter(Boolean).join(". ");

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={false}
      className={cn(
        "rounded-md border-l-4 px-2 py-1 cursor-pointer pointer-events-auto",
        "shadow-sm hover:shadow-md transition-shadow",
        "overflow-hidden text-ellipsis",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isDragging && "shadow-lg"
      )}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...attributes}
      {...listeners}
    >
      {isCompact ? (
        // Compact view
        <div className="text-xs font-medium truncate">{event.title}</div>
      ) : (
        // Expanded view
        <div className="flex flex-col h-full">
          <div className="text-xs font-medium truncate">{event.title}</div>

          <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5">
            <Clock className="h-3 w-3" />
            <span>
              {format(eventStart, "h:mm a")} - {format(eventEnd, "h:mm a")}
            </span>
          </div>

          {event.extendedProps?.clientName && height >= 80 && (
            <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 truncate">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.extendedProps.clientName}</span>
            </div>
          )}

          {event.extendedProps?.technicianName && height >= 100 && (
            <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 truncate">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.extendedProps.technicianName}</span>
            </div>
          )}

          {event.extendedProps?.address && height >= 120 && (
            <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.extendedProps.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Status indicator dot */}
      <div
        className="absolute top-1 right-1 h-2 w-2 rounded-full"
        style={{ backgroundColor: colors.border }}
        title={event.status}
      />
    </div>
  );
}

// Grid index file for easier imports
export { TimeGrid } from "./grid/TimeGrid";
export { TimeSlot } from "./grid/TimeSlot";
export { TimeAxis } from "./grid/TimeAxis";
