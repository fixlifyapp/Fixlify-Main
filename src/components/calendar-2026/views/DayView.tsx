// DayView - Custom day calendar view with time grid
// Replaces FullCalendar's timeGridDay view

import * as React from 'react';
import { useMemo, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  format,
  isSameDay,
  startOfDay,
  addHours,
  addMinutes,
  differenceInMinutes,
} from 'date-fns';
import { useGesture } from '@use-gesture/react';
import { cn } from '@/lib/utils';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeGrid, useEventPosition } from '../shared/TimeGrid';
import { EventCard } from '../shared/EventCard';
import { NowIndicator } from '../shared/NowIndicator';
import { DEFAULT_VIEW_CONFIG } from '../shared/types';
import type { CalendarEvent, CalendarResource, TimeRange } from '../../calendar/CalendarProvider';

interface DayViewProps {
  events: CalendarEvent[];
  resources?: CalendarResource[];
  currentDate: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  slotHeight?: number;
  aiHighlightedSlots?: TimeRange[];
  businessHoursStart?: number;
  businessHoursEnd?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onSlotClick?: (date: Date) => void;
  onSlotLongPress?: (date: Date) => void;
  className?: string;
}

export function DayView({
  events,
  resources = [],
  currentDate,
  startHour = 6,
  endHour = 22,
  slotDuration = 30,
  slotHeight = 48,
  aiHighlightedSlots = [],
  businessHoursStart = 9,
  businessHoursEnd = 17,
  onEventClick,
  onEventDrop,
  onSlotClick,
  onSlotLongPress,
  className,
}: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);

  // Filter events for current date
  const dayEvents = useMemo(() => {
    return events.filter((event) =>
      isSameDay(new Date(event.start), currentDate)
    );
  }, [events, currentDate]);

  // Calculate overlapping events and assign columns
  const positionedEvents = useMemo(() => {
    // Sort events by start time
    const sorted = [...dayEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    // Find overlapping groups and assign columns
    const positioned: Array<{
      event: CalendarEvent;
      column: number;
      totalColumns: number;
    }> = [];

    const activeColumns: Array<{ event: CalendarEvent; endTime: number }> = [];

    sorted.forEach((event) => {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();

      // Remove events that have ended
      const stillActive = activeColumns.filter((col) => col.endTime > eventStart);

      // Find first available column
      let column = 0;
      const usedColumns = new Set(stillActive.map((_, i) => i));
      while (usedColumns.has(column)) {
        column++;
      }

      // Add to active columns
      const colEntry = { event, endTime: eventEnd };
      if (column < stillActive.length) {
        stillActive[column] = colEntry;
      } else {
        stillActive.push(colEntry);
      }

      // Calculate total columns for this event's time range
      const overlappingCount = stillActive.filter(
        (col) => col.endTime > eventStart
      ).length;

      positioned.push({
        event,
        column,
        totalColumns: Math.max(overlappingCount, column + 1),
      });

      // Update active columns
      activeColumns.length = 0;
      activeColumns.push(...stillActive);
    });

    // Second pass: update totalColumns for accurate widths
    return positioned.map((p) => {
      // Find all events that overlap with this one
      const eventStart = new Date(p.event.start).getTime();
      const eventEnd = new Date(p.event.end).getTime();

      const overlapping = positioned.filter((other) => {
        const otherStart = new Date(other.event.start).getTime();
        const otherEnd = new Date(other.event.end).getTime();
        return otherStart < eventEnd && otherEnd > eventStart;
      });

      const maxColumn = Math.max(...overlapping.map((o) => o.column)) + 1;

      return {
        ...p,
        totalColumns: maxColumn,
      };
    });
  }, [dayEvents]);

  // Handle slot click
  const handleSlotClick = useCallback(
    (time: Date) => {
      onSlotClick?.(time);
    },
    [onSlotClick]
  );

  // Handle event drag end
  const handleEventDragEnd = useCallback(
    (event: CalendarEvent, info: PanInfo) => {
      if (!onEventDrop || !containerRef.current) return;

      // Calculate new time based on drag offset
      const pixelsPerMinute = slotHeight / slotDuration;
      const minutesDelta = Math.round(info.offset.y / pixelsPerMinute);

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Snap to slot duration
      const snappedMinutes = Math.round(minutesDelta / slotDuration) * slotDuration;

      const newStart = addMinutes(eventStart, snappedMinutes);
      const newEnd = addMinutes(eventEnd, snappedMinutes);

      onEventDrop(event, newStart, newEnd);
      setDraggingEvent(null);
    },
    [onEventDrop, slotHeight, slotDuration]
  );

  // Calculate grid height
  const totalSlots = ((endHour - startHour) * 60) / slotDuration;
  const gridHeight = totalSlots * slotHeight;

  // Scroll to current time on mount
  React.useEffect(() => {
    if (containerRef.current && isSameDay(new Date(), currentDate)) {
      const now = new Date();
      const dayStart = addHours(startOfDay(currentDate), startHour);
      const minutesSinceStart = differenceInMinutes(now, dayStart);
      const scrollPosition = (minutesSinceStart / slotDuration) * slotHeight - 200;

      containerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [currentDate, startHour, slotDuration, slotHeight]);

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Day Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">
              {format(currentDate, 'EEE')}
            </p>
            <p
              className={cn(
                "text-2xl font-bold",
                isSameDay(currentDate, new Date()) &&
                  "bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
              )}
            >
              {format(currentDate, 'd')}
            </p>
          </div>
          <div>
            <p className="font-semibold">{format(currentDate, 'MMMM yyyy')}</p>
            <p className="text-sm text-muted-foreground">
              {dayEvents.length} job{dayEvents.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>

        {/* AI highlighted slots indicator */}
        {aiHighlightedSlots.length > 0 && (
          <div className="flex items-center gap-2 text-violet-600">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              {aiHighlightedSlots.length} AI suggested slots
            </span>
          </div>
        )}
      </div>

      {/* Scrollable time grid */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="relative" style={{ height: gridHeight + 16, paddingTop: 8 }}>
          {/* Time labels */}
          <div className="absolute left-0 top-0 w-16 h-full pointer-events-none z-10 bg-white">
            {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute right-2 text-[11px] text-muted-foreground font-medium leading-none"
                style={{
                  top: i * ((60 / slotDuration) * slotHeight) + 8,
                  transform: 'translateY(-50%)'
                }}
              >
                {format(addHours(startOfDay(currentDate), startHour + i), 'h a')}
              </div>
            ))}
          </div>

          {/* Grid and events */}
          <div className="absolute left-16 right-0 top-2 h-full">
            {/* Time slots */}
            {Array.from({ length: totalSlots }).map((_, i) => {
              const slotTime = addMinutes(
                addHours(startOfDay(currentDate), startHour),
                i * slotDuration
              );
              const isHourStart = slotTime.getMinutes() === 0;
              const isHighlighted = aiHighlightedSlots.some(
                (range) => slotTime >= range.start && slotTime < range.end
              );
              const isBusinessHours =
                slotTime.getHours() >= businessHoursStart &&
                slotTime.getHours() < businessHoursEnd;

              return (
                <div
                  key={i}
                  className={cn(
                    "absolute left-0 right-0 border-b transition-colors cursor-pointer",
                    isHourStart ? "border-slate-200" : "border-slate-100 border-dashed",
                    isHighlighted && "bg-violet-50/70",
                    !isBusinessHours && "bg-slate-50/50",
                    "hover:bg-slate-100/50"
                  )}
                  style={{
                    top: i * slotHeight,
                    height: slotHeight,
                  }}
                  onClick={() => handleSlotClick(slotTime)}
                >
                  {isHighlighted && (
                    <div className="absolute top-1 right-1 opacity-60">
                      <Sparkles className="h-3 w-3 text-violet-500 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Events */}
            <AnimatePresence>
              {positionedEvents.map(({ event, column, totalColumns }) => {
                const dayStart = addHours(startOfDay(currentDate), startHour);
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);

                const startMinutes = Math.max(
                  0,
                  differenceInMinutes(eventStart, dayStart)
                );
                const durationMinutes = differenceInMinutes(eventEnd, eventStart);

                const top = (startMinutes / slotDuration) * slotHeight;
                const height = Math.max(
                  (durationMinutes / slotDuration) * slotHeight,
                  slotHeight / 2
                );

                // Calculate width and left position for overlapping events
                const eventWidth = `calc((100% - 8px) / ${totalColumns})`;
                const eventLeft = `calc(${column} * (100% - 8px) / ${totalColumns} + 4px)`;

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    style={{
                      top,
                      height,
                      left: 0,
                      width: eventWidth,
                      zIndex: draggingEvent?.id === event.id ? 50 : 1,
                    }}
                    variant="gradient"
                    showTime
                    showClient
                    draggable
                    resizable
                    onClick={() => onEventClick?.(event)}
                    onDragStart={() => setDraggingEvent(event)}
                    onDragEnd={(info) => handleEventDragEnd(event, info)}
                    className={cn(
                      draggingEvent?.id === event.id && "ring-2 ring-violet-500"
                    )}
                  />
                );
              })}
            </AnimatePresence>

            {/* Now indicator */}
            <NowIndicator
              currentDate={currentDate}
              startHour={startHour}
              slotHeight={slotHeight}
              slotDuration={slotDuration}
              showDot
              showTime
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayView;
