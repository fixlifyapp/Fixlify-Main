// WeekView - Custom week calendar view with 7 day columns
// Replaces FullCalendar's timeGridWeek view

import * as React from 'react';
import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import {
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addHours,
  addMinutes,
  differenceInMinutes,
  eachDayOfInterval,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '../shared/EventCard';
import { NowIndicator } from '../shared/NowIndicator';
import type { CalendarEvent, CalendarResource, TimeRange } from '../../calendar/CalendarProvider';

interface WeekViewProps {
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
  onDayClick?: (date: Date) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  className?: string;
}

export function WeekView({
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
  onDayClick,
  onNavigate,
  className,
}: WeekViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);

  // Calculate week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Filter events for current week
  const weekEvents = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  }, [events, currentDate]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    weekDays.forEach((day) => {
      const key = format(day, 'yyyy-MM-dd');
      grouped.set(
        key,
        weekEvents.filter((e) => isSameDay(new Date(e.start), day))
      );
    });

    return grouped;
  }, [weekEvents, weekDays]);

  // Calculate overlapping events for a day
  const getPositionedEvents = useCallback(
    (dayEvents: CalendarEvent[]) => {
      const sorted = [...dayEvents].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      const positioned: Array<{
        event: CalendarEvent;
        column: number;
        totalColumns: number;
      }> = [];

      sorted.forEach((event) => {
        const eventStart = new Date(event.start).getTime();
        const eventEnd = new Date(event.end).getTime();

        // Find overlapping events already positioned
        const overlapping = positioned.filter((p) => {
          const pStart = new Date(p.event.start).getTime();
          const pEnd = new Date(p.event.end).getTime();
          return pStart < eventEnd && pEnd > eventStart;
        });

        // Find available column
        const usedColumns = new Set(overlapping.map((p) => p.column));
        let column = 0;
        while (usedColumns.has(column)) column++;

        positioned.push({
          event,
          column,
          totalColumns: Math.max(overlapping.length + 1, column + 1),
        });
      });

      // Update total columns
      return positioned.map((p) => {
        const eventStart = new Date(p.event.start).getTime();
        const eventEnd = new Date(p.event.end).getTime();

        const overlapping = positioned.filter((other) => {
          const otherStart = new Date(other.event.start).getTime();
          const otherEnd = new Date(other.event.end).getTime();
          return otherStart < eventEnd && otherEnd > eventStart;
        });

        return {
          ...p,
          totalColumns: Math.max(...overlapping.map((o) => o.column)) + 1,
        };
      });
    },
    []
  );

  // Handle event drag
  const handleEventDragEnd = useCallback(
    (event: CalendarEvent, info: PanInfo, dayIndex: number) => {
      if (!onEventDrop) return;

      const pixelsPerMinute = slotHeight / slotDuration;
      const minutesDelta = Math.round(info.offset.y / pixelsPerMinute);
      const daysDelta = Math.round(info.offset.x / (containerRef.current?.clientWidth || 1) * 7);

      const snappedMinutes = Math.round(minutesDelta / slotDuration) * slotDuration;

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      const newStart = addMinutes(addDays(eventStart, daysDelta), snappedMinutes);
      const newEnd = addMinutes(addDays(eventEnd, daysDelta), snappedMinutes);

      onEventDrop(event, newStart, newEnd);
      setDraggingEvent(null);
    },
    [onEventDrop, slotHeight, slotDuration]
  );

  // Handle slot click
  const handleSlotClick = useCallback(
    (day: Date, slotIndex: number) => {
      const slotTime = addMinutes(
        addHours(startOfDay(day), startHour),
        slotIndex * slotDuration
      );
      onSlotClick?.(slotTime);
    },
    [startHour, slotDuration, onSlotClick]
  );

  // Swipe gesture for navigation
  const bind = useGesture(
    {
      onDrag: ({ swipe: [swipeX] }) => {
        if (swipeX === -1) onNavigate?.('next');
        if (swipeX === 1) onNavigate?.('prev');
      },
    },
    { drag: { axis: 'x', swipe: { distance: 50 } } }
  );

  // Grid dimensions
  const totalSlots = ((endHour - startHour) * 60) / slotDuration;
  const gridHeight = totalSlots * slotHeight;

  // Scroll to current time on mount
  useEffect(() => {
    if (containerRef.current) {
      const now = new Date();
      const dayStart = addHours(startOfDay(now), startHour);
      const minutesSinceStart = differenceInMinutes(now, dayStart);
      const scrollPosition = (minutesSinceStart / slotDuration) * slotHeight - 200;
      containerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [startHour, slotDuration, slotHeight]);

  return (
    <div className={cn("flex flex-col h-full bg-white", className)} {...bind()}>
      {/* Week Header */}
      <div className="flex border-b bg-slate-50">
        {/* Time column header */}
        <div className="w-16 shrink-0 border-r" />

        {/* Day columns */}
        {weekDays.map((day, index) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];
          const isCurrentDay = isToday(day);

          return (
            <div
              key={dayKey}
              className={cn(
                "flex-1 min-w-0 border-r last:border-r-0 py-2 px-1 text-center cursor-pointer",
                "hover:bg-slate-100/50 transition-colors",
                isCurrentDay && "bg-violet-50/50"
              )}
              onClick={() => onDayClick?.(day)}
            >
              <p className="text-xs text-muted-foreground uppercase">
                {format(day, 'EEE')}
              </p>
              <p
                className={cn(
                  "text-lg font-semibold mx-auto",
                  isCurrentDay &&
                    "bg-violet-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                )}
              >
                {format(day, 'd')}
              </p>
              {dayEvents.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dayEvents.length} job{dayEvents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex" style={{ height: gridHeight + 16, paddingTop: 8 }}>
          {/* Time labels */}
          <div className="w-16 shrink-0 relative border-r bg-white">
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

          {/* Day columns with events */}
          {weekDays.map((day, dayIndex) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(dayKey) || [];
            const positionedEvents = getPositionedEvents(dayEvents);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dayKey}
                className={cn(
                  "flex-1 min-w-0 relative border-r last:border-r-0",
                  isCurrentDay && "bg-violet-50/30"
                )}
              >
                {/* Time slots */}
                {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                  const slotTime = addMinutes(
                    addHours(startOfDay(day), startHour),
                    slotIndex * slotDuration
                  );
                  const isHourStart = slotTime.getMinutes() === 0;
                  const isHighlighted = aiHighlightedSlots.some(
                    (range) =>
                      slotTime >= range.start && slotTime < range.end
                  );
                  const isBusinessHours =
                    slotTime.getHours() >= businessHoursStart &&
                    slotTime.getHours() < businessHoursEnd;

                  return (
                    <div
                      key={slotIndex}
                      className={cn(
                        "absolute left-0 right-0 border-b cursor-pointer",
                        isHourStart ? "border-slate-200" : "border-slate-100 border-dashed",
                        isHighlighted && "bg-violet-100/50",
                        !isBusinessHours && !isCurrentDay && "bg-slate-50/50",
                        "hover:bg-slate-100/50 transition-colors"
                      )}
                      style={{
                        top: slotIndex * slotHeight,
                        height: slotHeight,
                      }}
                      onClick={() => handleSlotClick(day, slotIndex)}
                    >
                      {isHighlighted && (
                        <div className="absolute top-1 right-1 opacity-60">
                          <Sparkles className="h-2.5 w-2.5 text-violet-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Events */}
                <AnimatePresence>
                  {positionedEvents.map(({ event, column, totalColumns }) => {
                    const dayStart = addHours(startOfDay(day), startHour);
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

                    const width = `calc((100% - 4px) / ${totalColumns})`;
                    const left = `calc(${column} * (100% - 4px) / ${totalColumns} + 2px)`;

                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        style={{
                          top,
                          height,
                          left: 0,
                          width,
                          zIndex: draggingEvent?.id === event.id ? 50 : 1,
                        }}
                        variant="gradient"
                        compact={height < 60}
                        showTime={height >= 40}
                        showClient={height >= 80}
                        draggable
                        onClick={() => onEventClick?.(event)}
                        onDragStart={() => setDraggingEvent(event)}
                        onDragEnd={(info) => handleEventDragEnd(event, info, dayIndex)}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* Now indicator (only for today) */}
                {isCurrentDay && (
                  <NowIndicator
                    currentDate={day}
                    startHour={startHour}
                    slotHeight={slotHeight}
                    slotDuration={slotDuration}
                    showDot
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
