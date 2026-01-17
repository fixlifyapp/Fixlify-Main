// MonthView - Custom month calendar grid view
// Replaces FullCalendar's dayGridMonth view

import * as React from 'react';
import { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EventChip, EventDot } from '../shared/EventCard';
import { STATUS_COLORS } from '../shared/types';
import type { CalendarEvent, CalendarResource } from '../../calendar/CalendarProvider';

interface MonthViewProps {
  events: CalendarEvent[];
  resources?: CalendarResource[];
  currentDate: Date;
  maxEventsPerDay?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  className?: string;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthView({
  events,
  resources = [],
  currentDate,
  maxEventsPerDay = 3,
  onEventClick,
  onDayClick,
  onNavigate,
  className,
}: MonthViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Calculate calendar days (6 weeks grid)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const eventDate = new Date(event.start);
      const key = format(eventDate, 'yyyy-MM-dd');
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, event]);
    });

    // Sort events by time within each day
    grouped.forEach((dayEvents, key) => {
      grouped.set(
        key,
        dayEvents.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
      );
    });

    return grouped;
  }, [events]);

  // Calculate weeks
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  // Handle day click
  const handleDayClick = useCallback(
    (day: Date) => {
      setSelectedDay(day);
      onDayClick?.(day);
    },
    [onDayClick]
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

  // Get status summary for a day
  const getDaySummary = useCallback((dayEvents: CalendarEvent[]) => {
    const summary = {
      total: dayEvents.length,
      completed: 0,
      inProgress: 0,
      scheduled: 0,
    };

    dayEvents.forEach((event) => {
      if (event.status === 'completed') summary.completed++;
      else if (event.status === 'in-progress') summary.inProgress++;
      else summary.scheduled++;
    });

    return summary;
  }, []);

  return (
    <div className={cn("flex flex-col h-full bg-white", className)} {...bind()}>
      {/* Month Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onNavigate?.('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onNavigate?.('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <div className="text-sm text-muted-foreground">
          {events.length} total jobs
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-slate-50">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-xs font-medium text-muted-foreground uppercase"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-rows-6 h-full min-h-[600px]">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid grid-cols-7 border-b last:border-b-0"
            >
              {week.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay.get(dayKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const visibleEvents = dayEvents.slice(0, maxEventsPerDay);
                const hiddenCount = dayEvents.length - maxEventsPerDay;
                const summary = getDaySummary(dayEvents);

                return (
                  <div
                    key={dayKey}
                    className={cn(
                      "relative min-h-[100px] p-1 border-r last:border-r-0 cursor-pointer",
                      "hover:bg-slate-50/50 transition-colors",
                      !isCurrentMonth && "bg-slate-50/30",
                      isCurrentDay && "bg-violet-50/50",
                      isSelected && "ring-2 ring-violet-500 ring-inset"
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                          !isCurrentMonth && "text-muted-foreground",
                          isCurrentDay &&
                            "bg-violet-600 text-white"
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Day summary dots */}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5">
                          {summary.inProgress > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                          {summary.completed > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          {summary.scheduled > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-0.5">
                      <AnimatePresence>
                        {visibleEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            <EventChip
                              event={event}
                              onClick={() => onEventClick?.(event)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* More events indicator */}
                      {hiddenCount > 0 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                "w-full text-xs text-left px-2 py-0.5 rounded",
                                "text-muted-foreground hover:bg-slate-100 transition-colors"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              +{hiddenCount} more
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64 p-2"
                            align="start"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-sm font-medium mb-2">
                              {format(day, 'EEEE, MMMM d')}
                            </p>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {dayEvents.map((event) => (
                                <EventChip
                                  key={event.id}
                                  event={event}
                                  onClick={() => onEventClick?.(event)}
                                />
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MonthView;
