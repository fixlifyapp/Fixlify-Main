// TeamView - Resource/Team view showing technicians with their schedules
// Replaces FullCalendar's resourceTimeGridDay view (premium feature)

import * as React from 'react';
import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  format,
  isSameDay,
  startOfDay,
  addHours,
  addMinutes,
  differenceInMinutes,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Sparkles, Clock, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EventCard } from '../shared/EventCard';
import { NowIndicator } from '../shared/NowIndicator';
import { STATUS_GRADIENT_COLORS } from '../shared/types';
import type { CalendarEvent, CalendarResource, TimeRange } from '../../calendar/CalendarProvider';

interface TeamViewProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  currentDate: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  slotHeight?: number;
  resourceRowHeight?: number;
  aiHighlightedSlots?: TimeRange[];
  businessHoursStart?: number;
  businessHoursEnd?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onSlotClick?: (date: Date, resourceId: string) => void;
  className?: string;
}

export function TeamView({
  events,
  resources,
  currentDate,
  startHour = 6,
  endHour = 22,
  slotDuration = 30,
  slotHeight = 48,
  resourceRowHeight = 80,
  aiHighlightedSlots = [],
  businessHoursStart = 9,
  businessHoursEnd = 17,
  onEventClick,
  onEventDrop,
  onSlotClick,
  className,
}: TeamViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);
  const [dragTargetResource, setDragTargetResource] = useState<string | null>(null);

  // Filter events for current date
  const dayEvents = useMemo(() => {
    return events.filter((event) =>
      isSameDay(new Date(event.start), currentDate)
    );
  }, [events, currentDate]);

  // Group events by resource
  const eventsByResource = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    resources.forEach((resource) => {
      const resourceEvents = dayEvents.filter(
        (e) => e.resourceId === resource.id
      );
      grouped.set(resource.id, resourceEvents);
    });

    return grouped;
  }, [dayEvents, resources]);

  // Calculate resource workload
  const getResourceWorkload = useCallback((resourceId: string) => {
    const resourceEvents = eventsByResource.get(resourceId) || [];
    const totalMinutes = resourceEvents.reduce((acc, event) => {
      const duration = differenceInMinutes(
        new Date(event.end),
        new Date(event.start)
      );
      return acc + duration;
    }, 0);

    const workHours = (endHour - startHour);
    const totalAvailableMinutes = workHours * 60;
    const percentage = Math.min((totalMinutes / totalAvailableMinutes) * 100, 100);

    return {
      totalMinutes,
      percentage,
      jobCount: resourceEvents.length,
      completedCount: resourceEvents.filter((e) => e.status === 'completed').length,
    };
  }, [eventsByResource, startHour, endHour]);

  // Handle event drag
  const handleEventDragEnd = useCallback(
    (event: CalendarEvent, info: PanInfo) => {
      if (!onEventDrop) return;

      const pixelsPerMinute = slotHeight / slotDuration;
      const minutesDelta = Math.round(info.offset.y / pixelsPerMinute);
      const snappedMinutes = Math.round(minutesDelta / slotDuration) * slotDuration;

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      const newStart = addMinutes(eventStart, snappedMinutes);
      const newEnd = addMinutes(eventEnd, snappedMinutes);

      // Determine target resource from horizontal drag
      const newResourceId = dragTargetResource || event.resourceId;

      onEventDrop(event, newStart, newEnd, newResourceId);
      setDraggingEvent(null);
      setDragTargetResource(null);
    },
    [onEventDrop, slotHeight, slotDuration, dragTargetResource]
  );

  // Handle slot click
  const handleSlotClick = useCallback(
    (time: Date, resourceId: string) => {
      onSlotClick?.(time, resourceId);
    },
    [onSlotClick]
  );

  // Grid dimensions
  const totalSlots = ((endHour - startHour) * 60) / slotDuration;
  const gridHeight = totalSlots * slotHeight;

  // Scroll to current time
  useEffect(() => {
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
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
        <div>
          <h2 className="font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
          <p className="text-sm text-muted-foreground">
            {resources.length} technicians • {dayEvents.length} jobs scheduled
          </p>
        </div>

        {aiHighlightedSlots.length > 0 && (
          <div className="flex items-center gap-2 text-violet-600">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI suggestions available</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Resource sidebar */}
        <div className="w-56 shrink-0 border-r bg-slate-50 overflow-y-auto">
          {/* Time header spacer */}
          <div className="h-10 border-b bg-slate-100" />

          {/* Resource cards */}
          {resources.map((resource) => {
            const workload = getResourceWorkload(resource.id);
            const isOverloaded = workload.percentage > 80;

            return (
              <div
                key={resource.id}
                className={cn(
                  "flex items-center gap-3 border-b p-3",
                  "hover:bg-slate-100/50 transition-colors",
                  dragTargetResource === resource.id && "bg-violet-50"
                )}
                style={{ height: resourceRowHeight }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragTargetResource(resource.id);
                }}
                onDragLeave={() => setDragTargetResource(null)}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: resource.color || '#8b5cf6' }}
                    className="text-white font-medium"
                  >
                    {resource.title
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{resource.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Progress
                              value={workload.percentage}
                              className={cn(
                                "h-1.5",
                                isOverloaded && "[&>div]:bg-amber-500"
                              )}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{Math.round(workload.totalMinutes / 60)}h scheduled</p>
                          <p>{workload.completedCount}/{workload.jobCount} completed</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs shrink-0",
                        isOverloaded && "border-amber-500 text-amber-600"
                      )}
                    >
                      {workload.jobCount}
                    </Badge>
                  </div>
                </div>

                {isOverloaded && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable grid */}
        <div ref={containerRef} className="flex-1 overflow-auto">
          <div style={{ height: gridHeight + 40 }}>
            {/* Time header */}
            <div className="sticky top-0 z-10 flex h-10 bg-slate-50 border-b">
              {Array.from({ length: endHour - startHour }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 border-r text-center pt-2"
                  style={{ width: (60 / slotDuration) * slotHeight }}
                >
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(addHours(startOfDay(currentDate), startHour + i), 'h a')}
                  </span>
                </div>
              ))}
            </div>

            {/* Resource rows */}
            {resources.map((resource) => {
              const resourceEvents = eventsByResource.get(resource.id) || [];

              return (
                <div
                  key={resource.id}
                  className={cn(
                    "relative border-b",
                    dragTargetResource === resource.id && "bg-violet-50/30"
                  )}
                  style={{ height: resourceRowHeight }}
                >
                  {/* Time slots */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                      const slotTime = addMinutes(
                        addHours(startOfDay(currentDate), startHour),
                        slotIndex * slotDuration
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
                          key={slotIndex}
                          className={cn(
                            "shrink-0 border-r cursor-pointer",
                            isHourStart ? "border-slate-200" : "border-slate-100 border-dashed",
                            isHighlighted && "bg-violet-50/70",
                            !isBusinessHours && "bg-slate-50/50",
                            "hover:bg-slate-100/50 transition-colors"
                          )}
                          style={{ width: slotHeight }}
                          onClick={() => handleSlotClick(slotTime, resource.id)}
                        >
                          {isHighlighted && (
                            <div className="absolute top-1 left-1 opacity-60">
                              <Sparkles className="h-2.5 w-2.5 text-violet-500 animate-pulse" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Events */}
                  <AnimatePresence>
                    {resourceEvents.map((event) => {
                      const dayStart = addHours(startOfDay(currentDate), startHour);
                      const eventStart = new Date(event.start);
                      const eventEnd = new Date(event.end);

                      const startMinutes = Math.max(
                        0,
                        differenceInMinutes(eventStart, dayStart)
                      );
                      const durationMinutes = differenceInMinutes(eventEnd, eventStart);

                      const left = (startMinutes / slotDuration) * slotHeight;
                      const width = Math.max(
                        (durationMinutes / slotDuration) * slotHeight,
                        slotHeight
                      );

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ scale: 1.02, zIndex: 10 }}
                          whileTap={{ scale: 0.98 }}
                          drag
                          dragMomentum={false}
                          dragElastic={0.1}
                          onDragStart={() => setDraggingEvent(event)}
                          onDragEnd={(_, info) => handleEventDragEnd(event, info)}
                          onClick={() => onEventClick?.(event)}
                          className={cn(
                            "absolute top-2 bottom-2 rounded-lg cursor-pointer",
                            "bg-gradient-to-r shadow-md hover:shadow-lg transition-shadow",
                            STATUS_GRADIENT_COLORS[event.status] || STATUS_GRADIENT_COLORS.scheduled,
                            draggingEvent?.id === event.id && "ring-2 ring-violet-500 z-50"
                          )}
                          style={{
                            left,
                            width,
                          }}
                        >
                          <div className="h-full px-3 py-1.5 overflow-hidden">
                            <p className="text-white font-medium text-sm truncate">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-white/80 text-xs">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(eventStart, 'h:mm')} - {format(eventEnd, 'h:mm a')}
                              </span>
                            </div>
                            {event.extendedProps?.clientName && (
                              <p className="text-white/70 text-xs truncate mt-0.5">
                                {event.extendedProps.clientName}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Now indicator - vertical line across all rows */}
            {isSameDay(new Date(), currentDate) && (
              <NowIndicatorVertical
                currentDate={currentDate}
                startHour={startHour}
                slotHeight={slotHeight}
                slotDuration={slotDuration}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vertical now indicator for team view
function NowIndicatorVertical({
  currentDate,
  startHour,
  slotHeight,
  slotDuration,
}: {
  currentDate: Date;
  startHour: number;
  slotHeight: number;
  slotDuration: number;
}) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isSameDay(now, currentDate)) return null;

  const dayStart = addHours(startOfDay(currentDate), startHour);
  const minutesSinceStart = differenceInMinutes(now, dayStart);

  if (minutesSinceStart < 0) return null;

  const left = (minutesSinceStart / slotDuration) * slotHeight;

  return (
    <div
      className="absolute w-0.5 bg-red-500 z-20 pointer-events-none"
      style={{
        left,
        top: 40, // Below header
        bottom: 0,
      }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
    </div>
  );
}

export default TeamView;
