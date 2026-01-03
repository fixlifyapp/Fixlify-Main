import * as React from "react";
import { cn } from "@/lib/utils";
import { useCalendarContext, useCalendarStore } from "../CalendarProvider";
import { useDroppable } from "@dnd-kit/core";
import { format, addMinutes } from "date-fns";
import { AlertTriangle } from "lucide-react";

interface TimeSlotProps {
  date: Date;
  time: Date;
  resourceId?: string;
  isHighlighted?: boolean;
  className?: string;
}

export function TimeSlot({
  date,
  time,
  resourceId,
  isHighlighted,
  className,
}: TimeSlotProps) {
  const { onSlotClick, onDateSelect } = useCalendarContext();
  const slotDuration = useCalendarStore((state) => state.slotDuration);
  const aiHighlightedSlots = useCalendarStore((state) => state.aiHighlightedSlots);
  const isSlotOutsideBusinessHours = useCalendarStore((state) => state.isSlotOutsideBusinessHours);
  const checkConflicts = useCalendarStore((state) => state.checkConflicts);
  const draggedEvent = useCalendarStore((state) => state.draggedEvent);
  const isDragging = useCalendarStore((state) => state.isDragging);

  // Create unique slot ID for drag-and-drop
  const slotId = `slot-${date.toISOString()}-${time.getHours()}-${time.getMinutes()}${resourceId ? `-${resourceId}` : ""}`;

  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: {
      type: "slot",
      date,
      time,
      resourceId,
    },
  });

  // Combine date and time for the actual slot datetime
  const slotDateTime = new Date(date);
  slotDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

  // Check if this slot is outside business hours
  const isOutsideBusinessHours = React.useMemo(() => {
    return isSlotOutsideBusinessHours(date, time);
  }, [date, time, isSlotOutsideBusinessHours]);

  // Check if this slot is AI-highlighted
  const isAIHighlighted = React.useMemo(() => {
    return aiHighlightedSlots.some((range) => {
      return slotDateTime >= range.start && slotDateTime < range.end;
    });
  }, [aiHighlightedSlots, slotDateTime]);

  // Check for conflicts when dragging over this slot
  const hasConflict = React.useMemo(() => {
    if (!isDragging || !draggedEvent || !isOver) return false;

    // Calculate what the event's time would be if dropped here
    const eventDuration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
    const targetEnd = new Date(slotDateTime.getTime() + eventDuration);

    const conflicts = checkConflicts(draggedEvent, slotDateTime, targetEnd, resourceId);
    return conflicts.length > 0;
  }, [isDragging, draggedEvent, isOver, slotDateTime, resourceId, checkConflicts]);

  const handleClick = () => {
    // Don't allow clicks on non-business hours slots
    if (isOutsideBusinessHours) return;
    onSlotClick?.(slotDateTime, resourceId);
  };

  const handleDoubleClick = () => {
    // Don't allow creating events outside business hours
    if (isOutsideBusinessHours) return;
    const endDateTime = new Date(slotDateTime.getTime() + slotDuration * 60 * 1000);
    onDateSelect?.(slotDateTime, endDateTime, resourceId);
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isOutsideBusinessHours) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleDoubleClick(); // Enter creates a new event
    } else if (e.key === " ") {
      e.preventDefault();
      handleClick(); // Space selects the slot
    }
  };

  // Calculate slot height (30 min = 48px)
  const slotHeight = (slotDuration / 30) * 48;

  // Check if this is a full hour slot (show stronger border)
  const isFullHour = time.getMinutes() === 0;

  // Build accessible label
  const ariaLabel = [
    format(slotDateTime, "EEEE, MMMM d"),
    format(slotDateTime, "h:mm a"),
    isAIHighlighted && "AI recommended slot",
    isOutsideBusinessHours && "Outside business hours",
    hasConflict && "Conflict detected",
  ].filter(Boolean).join(", ");

  return (
    <div
      ref={setNodeRef}
      role="gridcell"
      tabIndex={isOutsideBusinessHours ? -1 : 0}
      aria-label={ariaLabel}
      aria-selected={isHighlighted}
      aria-disabled={isOutsideBusinessHours}
      className={cn(
        "relative transition-colors",
        isFullHour ? "border-t border-border" : "border-t border-border/30",

        // Business hours enforcement
        isOutsideBusinessHours
          ? "bg-muted/40 cursor-not-allowed opacity-50"
          : "cursor-pointer hover:bg-accent/50",

        // Drag-and-drop states
        isOver && !hasConflict && !isOutsideBusinessHours && "bg-primary/20 ring-2 ring-inset ring-primary/50",
        isOver && hasConflict && "bg-red-500/20 ring-2 ring-inset ring-red-500",

        // AI highlighting
        isAIHighlighted && !isOutsideBusinessHours && "bg-green-500/10",

        // Selection state
        isHighlighted && "bg-accent",

        // Focus state
        !isOutsideBusinessHours && "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",

        className
      )}
      style={{
        height: `${slotHeight}px`,
        // Striped pattern for non-business hours
        ...(isOutsideBusinessHours && {
          backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)",
        }),
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      data-slot-id={slotId}
      data-date={slotDateTime.toISOString()}
      data-resource-id={resourceId}
      data-outside-hours={isOutsideBusinessHours}
    >
      {/* AI highlight indicator */}
      {isAIHighlighted && !isOutsideBusinessHours && (
        <div className="absolute inset-y-0 left-0 w-1 bg-green-500 rounded-r" />
      )}

      {/* Conflict warning indicator */}
      {isOver && hasConflict && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-red-500 text-white rounded-full p-1 shadow-lg animate-pulse">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Drop indicator for valid drops */}
      {isOver && !hasConflict && !isOutsideBusinessHours && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-1 top-1 h-1 bg-primary rounded-full" />
        </div>
      )}
    </div>
  );
}
