// TimeGrid - Reusable time slot grid for Day/Week/Team views

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { format, addMinutes, startOfDay, addHours, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import type { TimeRange } from '../../calendar/CalendarProvider';

interface TimeGridProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number; // in minutes
  slotHeight?: number; // in pixels
  showHourLabels?: boolean;
  showHalfHourLines?: boolean;
  highlightedSlots?: TimeRange[];
  highlightBusinessHours?: boolean;
  businessHoursStart?: number;
  businessHoursEnd?: number;
  onSlotClick?: (time: Date) => void;
  onSlotLongPress?: (time: Date) => void;
  children?: React.ReactNode;
  className?: string;
}

export function TimeGrid({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 30,
  slotHeight = 48,
  showHourLabels = true,
  showHalfHourLines = true,
  highlightedSlots = [],
  highlightBusinessHours = true,
  businessHoursStart = 9,
  businessHoursEnd = 17,
  onSlotClick,
  onSlotLongPress,
  children,
  className,
}: TimeGridProps) {
  // Generate time slots
  const slots = useMemo(() => {
    const result: Date[] = [];
    const dayStart = startOfDay(date);
    let currentTime = addHours(dayStart, startHour);
    const dayEnd = addHours(dayStart, endHour);

    while (currentTime < dayEnd) {
      result.push(currentTime);
      currentTime = addMinutes(currentTime, slotDuration);
    }
    return result;
  }, [date, startHour, endHour, slotDuration]);

  // Check if a slot is highlighted (AI suggested)
  const isSlotHighlighted = useCallback(
    (slotTime: Date) => {
      return highlightedSlots.some(
        (range) => slotTime >= range.start && slotTime < range.end
      );
    },
    [highlightedSlots]
  );

  // Check if slot is within business hours
  const isBusinessHours = useCallback(
    (slotTime: Date) => {
      const hour = slotTime.getHours();
      return hour >= businessHoursStart && hour < businessHoursEnd;
    },
    [businessHoursStart, businessHoursEnd]
  );

  // Handle slot interactions
  const longPressRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback(
    (time: Date) => {
      if (onSlotLongPress) {
        longPressRef.current = setTimeout(() => {
          onSlotLongPress(time);
        }, 500);
      }
    },
    [onSlotLongPress]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  // Total height of the grid
  const totalHeight = slots.length * slotHeight;

  return (
    <div className={cn("relative", className)} style={{ height: totalHeight }}>
      {/* Time labels (left side) */}
      {showHourLabels && (
        <div className="absolute left-0 top-0 w-16 h-full pointer-events-none z-10">
          {slots.map((slot, index) => {
            const isHourStart = slot.getMinutes() === 0;
            if (!isHourStart) return null;

            return (
              <div
                key={index}
                className="absolute right-2 text-xs text-muted-foreground font-medium"
                style={{ top: index * slotHeight - 8 }}
              >
                {format(slot, 'h a')}
              </div>
            );
          })}
        </div>
      )}

      {/* Grid lines and slots */}
      <div className={cn("absolute inset-0", showHourLabels && "left-16")}>
        {slots.map((slot, index) => {
          const isHourStart = slot.getMinutes() === 0;
          const highlighted = isSlotHighlighted(slot);
          const inBusinessHours = isBusinessHours(slot);

          return (
            <div
              key={index}
              className={cn(
                "absolute left-0 right-0 border-b transition-colors",
                isHourStart ? "border-slate-200" : "border-slate-100 border-dashed",
                highlighted && "bg-violet-50/70",
                highlightBusinessHours && !inBusinessHours && "bg-slate-50/50",
                "hover:bg-slate-100/50 cursor-pointer"
              )}
              style={{
                top: index * slotHeight,
                height: slotHeight,
              }}
              onClick={() => onSlotClick?.(slot)}
              onTouchStart={() => handleTouchStart(slot)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {/* AI highlight indicator */}
              {highlighted && (
                <div className="absolute top-1 right-1 opacity-60">
                  <Sparkles className="h-3 w-3 text-violet-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}

        {/* Events container */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full pointer-events-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper hook for calculating event positions
export function useEventPosition(
  event: { start: Date; end: Date },
  config: { startHour: number; slotDuration: number; slotHeight: number; date: Date }
) {
  return useMemo(() => {
    const { startHour, slotDuration, slotHeight, date } = config;
    const dayStart = addHours(startOfDay(date), startHour);

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Minutes from grid start
    const startMinutes = Math.max(0, (eventStart.getTime() - dayStart.getTime()) / 60000);
    const endMinutes = (eventEnd.getTime() - dayStart.getTime()) / 60000;
    const durationMinutes = endMinutes - startMinutes;

    // Convert to pixels
    const top = (startMinutes / slotDuration) * slotHeight;
    const height = Math.max((durationMinutes / slotDuration) * slotHeight, slotHeight / 2);

    return { top, height };
  }, [event.start, event.end, config]);
}
