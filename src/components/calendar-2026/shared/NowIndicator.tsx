// Now Indicator - Current time line for calendar views

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { isSameDay, differenceInMinutes, startOfDay, addHours } from 'date-fns';
import { cn } from '@/lib/utils';

interface NowIndicatorProps {
  currentDate: Date;
  startHour?: number;
  slotHeight: number;
  slotDuration: number;
  className?: string;
  showDot?: boolean;
  showTime?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function NowIndicator({
  currentDate,
  startHour = 6,
  slotHeight,
  slotDuration,
  className,
  showDot = true,
  showTime = false,
  orientation = 'horizontal',
}: NowIndicatorProps) {
  const [now, setNow] = useState(new Date());

  // Update every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Only show if viewing today
  if (!isSameDay(now, currentDate)) {
    return null;
  }

  const dayStart = addHours(startOfDay(currentDate), startHour);
  const minutesSinceStart = differenceInMinutes(now, dayStart);

  // Don't show if outside visible hours
  if (minutesSinceStart < 0) {
    return null;
  }

  const position = (minutesSinceStart / slotDuration) * slotHeight;

  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          "absolute w-0.5 bg-red-500 z-20 pointer-events-none",
          className
        )}
        style={{
          left: position,
          top: 0,
          bottom: 0,
        }}
      >
        {showDot && (
          <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 flex items-center z-20 pointer-events-none",
        className
      )}
      style={{ top: position }}
    >
      {showDot && (
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0 shadow-sm" />
      )}
      <div className="flex-1 h-0.5 bg-red-500" />
      {showTime && (
        <span className="text-[10px] font-medium text-red-600 bg-white px-1 rounded -mr-1">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
