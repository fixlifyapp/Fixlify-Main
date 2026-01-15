// Timeline View - Horizontal Scrolling Like Linear/Notion
// Revolutionary horizontal timeline with pinch-to-zoom

import * as React from 'react';
import { useRef, useState, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  format,
  startOfDay,
  endOfDay,
  addHours,
  addDays,
  differenceInMinutes,
  isSameDay,
  eachHourOfInterval,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Route,
  Clock,
  User,
  MapPin,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import type { CalendarEvent, CalendarResource, TimeRange } from '../../calendar/CalendarProvider';
import type { TimelineConfig } from '../types';

interface TimelineViewProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  currentDate: Date;
  config: TimelineConfig;
  aiHighlightedSlots?: TimeRange[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, resourceId: string) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onConfigChange?: (config: Partial<TimelineConfig>) => void;
}

// Time slot widths at different zoom levels
const ZOOM_LEVELS = {
  1: { slotWidth: 120, slotMinutes: 15, label: '15min' },
  2: { slotWidth: 80, slotMinutes: 30, label: '30min' },
  3: { slotWidth: 60, slotMinutes: 60, label: '1hr' },
  4: { slotWidth: 40, slotMinutes: 120, label: '2hr' },
};

const RESOURCE_HEIGHT = 80;
const HEADER_HEIGHT = 60;
const TIME_HEADER_HEIGHT = 40;

export function TimelineView({
  events,
  resources,
  currentDate,
  config,
  aiHighlightedSlots = [],
  onEventClick,
  onSlotClick,
  onEventDrop,
  onConfigChange,
}: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const zoomConfig = ZOOM_LEVELS[config.zoomLevel as keyof typeof ZOOM_LEVELS] || ZOOM_LEVELS[2];

  // Generate time slots for the day
  const timeSlots = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    const hours = eachHourOfInterval({ start: addHours(dayStart, 6), end: addHours(dayStart, 22) });
    return hours;
  }, [currentDate]);

  // Calculate total timeline width
  const totalWidth = useMemo(() => {
    const totalMinutes = 16 * 60; // 6am to 10pm = 16 hours
    return (totalMinutes / zoomConfig.slotMinutes) * zoomConfig.slotWidth;
  }, [zoomConfig]);

  // Get events for a specific resource
  const getResourceEvents = useCallback(
    (resourceId: string) => {
      return events.filter(
        (e) => e.resourceId === resourceId && isSameDay(new Date(e.start), currentDate)
      );
    },
    [events, currentDate]
  );

  // Calculate event position and width
  const getEventStyle = useCallback(
    (event: CalendarEvent) => {
      const dayStart = addHours(startOfDay(currentDate), 6); // 6am
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      const startMinutes = Math.max(0, differenceInMinutes(eventStart, dayStart));
      const duration = differenceInMinutes(eventEnd, eventStart);

      const left = (startMinutes / zoomConfig.slotMinutes) * zoomConfig.slotWidth;
      const width = Math.max((duration / zoomConfig.slotMinutes) * zoomConfig.slotWidth, 60);

      return { left, width };
    },
    [currentDate, zoomConfig]
  );

  // Check if a slot is AI highlighted
  const isSlotHighlighted = useCallback(
    (time: Date, resourceId: string) => {
      return aiHighlightedSlots.some(
        (slot) =>
          time >= slot.start &&
          time < slot.end
      );
    },
    [aiHighlightedSlots]
  );

  // Zoom controls
  const handleZoomIn = () => {
    if (config.zoomLevel > 1) {
      onConfigChange?.({ zoomLevel: config.zoomLevel - 1 });
    }
  };

  const handleZoomOut = () => {
    if (config.zoomLevel < 4) {
      onConfigChange?.({ zoomLevel: config.zoomLevel + 1 });
    }
  };

  // Scroll to current time on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      if (isSameDay(now, currentDate)) {
        const dayStart = addHours(startOfDay(currentDate), 6);
        const minutesSinceStart = differenceInMinutes(now, dayStart);
        const scrollPosition =
          (minutesSinceStart / zoomConfig.slotMinutes) * zoomConfig.slotWidth - 200;
        scrollRef.current.scrollLeft = Math.max(0, scrollPosition);
      }
    }
  }, [currentDate, zoomConfig]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</span>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {zoomConfig.label} slots
          </Badge>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={handleZoomIn}
              disabled={config.zoomLevel <= 1}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={handleZoomOut}
              disabled={config.zoomLevel >= 4}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="flex flex-1 overflow-hidden">
        {/* Resource Labels (Fixed Left Column) */}
        <div className="w-48 shrink-0 border-r bg-slate-50">
          {/* Empty corner */}
          <div
            className="border-b bg-slate-100"
            style={{ height: TIME_HEADER_HEIGHT }}
          />

          {/* Resource Names */}
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center gap-3 border-b px-3"
              style={{ height: RESOURCE_HEIGHT }}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  style={{ backgroundColor: resource.color || '#8b5cf6' }}
                  className="text-white text-sm"
                >
                  {resource.title
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getResourceEvents(resource.id).length} jobs
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Area */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Time Header */}
            <div
              className="flex border-b bg-slate-50 sticky top-0 z-10"
              style={{ height: TIME_HEADER_HEIGHT }}
            >
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  className="shrink-0 border-r text-center"
                  style={{
                    width: (60 / zoomConfig.slotMinutes) * zoomConfig.slotWidth,
                  }}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {format(time, 'h a')}
                  </span>
                </div>
              ))}
            </div>

            {/* Resource Rows */}
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="relative border-b"
                style={{ height: RESOURCE_HEIGHT }}
              >
                {/* Time Grid Lines */}
                <div className="absolute inset-0 flex">
                  {timeSlots.map((time, index) => (
                    <div
                      key={index}
                      className={cn(
                        "shrink-0 border-r border-dashed",
                        isSlotHighlighted(time, resource.id) &&
                          "bg-violet-50/50"
                      )}
                      style={{
                        width: (60 / zoomConfig.slotMinutes) * zoomConfig.slotWidth,
                      }}
                      onClick={() => onSlotClick?.(time, resource.id)}
                    >
                      {/* AI Highlight Indicator */}
                      {isSlotHighlighted(time, resource.id) && (
                        <div className="absolute top-1 left-1">
                          <Sparkles className="h-3 w-3 text-violet-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Events */}
                {getResourceEvents(resource.id).map((event) => {
                  const style = getEventStyle(event);
                  return (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      style={style}
                      onClick={() => onEventClick?.(event)}
                      showTravelConnector={config.showTravelConnectors}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Now Indicator */}
      <NowIndicator
        currentDate={currentDate}
        scrollRef={scrollRef}
        zoomConfig={zoomConfig}
      />
    </div>
  );
}

// Individual Event Component with animations
function TimelineEvent({
  event,
  style,
  onClick,
  showTravelConnector,
}: {
  event: CalendarEvent;
  style: { left: number; width: number };
  onClick?: () => void;
  showTravelConnector?: boolean;
}) {
  const statusColors = {
    scheduled: 'from-blue-500 to-blue-600',
    'in-progress': 'from-amber-500 to-amber-600',
    completed: 'from-emerald-500 to-emerald-600',
    cancelled: 'from-slate-400 to-slate-500',
    'no-show': 'from-red-500 to-red-600',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
              "absolute top-2 bottom-2 rounded-lg cursor-pointer",
              "bg-gradient-to-r shadow-md hover:shadow-lg transition-shadow",
              statusColors[event.status]
            )}
            style={{
              left: style.left,
              width: style.width,
            }}
          >
            <div className="h-full px-3 py-2 overflow-hidden">
              <p className="text-white font-medium text-sm truncate">
                {event.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(event.start), 'h:mm a')} -{' '}
                  {format(new Date(event.end), 'h:mm a')}
                </span>
              </div>
              {event.extendedProps?.clientName && (
                <p className="text-white/70 text-xs truncate mt-1">
                  {event.extendedProps.clientName}
                </p>
              )}
            </div>

            {/* Travel connector line */}
            {showTravelConnector && (
              <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-slate-300 border-dashed" />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{event.title}</p>
            {event.extendedProps?.clientName && (
              <p className="text-sm flex items-center gap-1">
                <User className="h-3 w-3" />
                {event.extendedProps.clientName}
              </p>
            )}
            {event.extendedProps?.address && (
              <p className="text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.extendedProps.address}
              </p>
            )}
            <p className="text-sm flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(event.start), 'h:mm a')} -{' '}
              {format(new Date(event.end), 'h:mm a')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Current time indicator
function NowIndicator({
  currentDate,
  scrollRef,
  zoomConfig,
}: {
  currentDate: Date;
  scrollRef: React.RefObject<HTMLDivElement>;
  zoomConfig: { slotWidth: number; slotMinutes: number };
}) {
  const now = new Date();
  if (!isSameDay(now, currentDate)) return null;

  const dayStart = addHours(startOfDay(currentDate), 6);
  const minutesSinceStart = differenceInMinutes(now, dayStart);
  const left = (minutesSinceStart / zoomConfig.slotMinutes) * zoomConfig.slotWidth + 192; // + resource column width

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style={{ left }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
    </div>
  );
}
