import * as React from "react";
import { cn } from "@/lib/utils";
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns";
import { useCalendarStore, useCalendarContext, CalendarEvent } from "../CalendarProvider";
import { TimeAxis } from "../grid/TimeAxis";
import { TimeSlot } from "../grid/TimeSlot";
import { CalendarEventBlock } from "../CalendarEvent";
import { NowIndicator } from "../NowIndicator";

interface SwipeableDayProps {
  className?: string;
}

export function SwipeableDay({ className }: SwipeableDayProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const events = useCalendarStore((state) => state.events);
  const slotMinTime = useCalendarStore((state) => state.slotMinTime);
  const slotMaxTime = useCalendarStore((state) => state.slotMaxTime);
  const slotDuration = useCalendarStore((state) => state.slotDuration);

  // Touch gesture state
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [swipeOffset, setSwipeOffset] = React.useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    const diff = currentTouch - touchStart;
    if (Math.abs(diff) > 10) {
      setIsSwiping(true);
      // Limit swipe offset for visual feedback
      setSwipeOffset(Math.max(-100, Math.min(100, diff)));
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next day
      setCurrentDate(addDays(currentDate, 1));
    } else if (isRightSwipe) {
      // Swipe right = previous day
      setCurrentDate(subDays(currentDate, 1));
    }

    // Reset swipe state
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  // Generate time slots
  const timeSlots = React.useMemo(() => {
    const slots: Date[] = [];
    const [minHour, minMinute] = slotMinTime.split(":").map(Number);
    const [maxHour, maxMinute] = slotMaxTime.split(":").map(Number);

    const baseDate = new Date();
    baseDate.setHours(minHour, minMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(maxHour, maxMinute, 0, 0);

    let current = new Date(baseDate);
    while (current < endTime) {
      slots.push(new Date(current));
      current = new Date(current.getTime() + slotDuration * 60 * 1000);
    }

    return slots;
  }, [slotMinTime, slotMaxTime, slotDuration]);

  // Get events for current day
  const dayStart = startOfDay(currentDate);
  const dayEvents = events.filter((event) => isSameDay(new Date(event.start), currentDate));

  // Calculate grid height
  const slotHeight = 48; // 48px per 30-min slot
  const totalGridHeight = timeSlots.length * slotHeight;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col h-full", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Date header with swipe indicator */}
      <div className="flex items-center justify-center py-2 border-b bg-muted/30">
        <div
          className={cn(
            "flex items-center gap-2 transition-transform",
            isSwiping && "opacity-50"
          )}
          style={{ transform: `translateX(${swipeOffset * 0.3}px)` }}
        >
          <span className="text-sm font-medium">
            {format(currentDate, "EEEE, MMMM d")}
          </span>
        </div>
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex">
          {/* Time axis */}
          <TimeAxis timeSlots={timeSlots} slotHeight={slotHeight} className="sticky left-0 z-10" />

          {/* Day column */}
          <div
            className="flex-1 relative"
            style={{
              transform: `translateX(${swipeOffset}px)`,
              transition: isSwiping ? "none" : "transform 0.2s ease-out",
            }}
          >
            {/* Time slots */}
            <div
              className="relative"
              style={{ height: `${totalGridHeight}px`, minHeight: `${totalGridHeight}px` }}
            >
              {timeSlots.map((time, index) => (
                <TimeSlot
                  key={`slot-${index}`}
                  date={currentDate}
                  time={time}
                />
              ))}

              {/* Now indicator */}
              <NowIndicator dayStart={dayStart} slotHeight={slotHeight} slotMinTime={slotMinTime} />

              {/* Events */}
              {dayEvents.map((event) => (
                <CalendarEventBlock
                  key={event.id}
                  event={event}
                  dayStart={dayStart}
                  slotHeight={slotHeight}
                  slotMinTime={slotMinTime}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe hint for mobile users */}
      <div className="text-center py-2 text-xs text-muted-foreground border-t bg-muted/20">
        Swipe left/right to change day
      </div>
    </div>
  );
}
