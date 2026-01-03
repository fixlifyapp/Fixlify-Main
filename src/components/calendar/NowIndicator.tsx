import * as React from "react";
import { useCalendarStore } from "./CalendarProvider";

interface NowIndicatorProps {
  slotHeight: number;
  slotDuration: number;
}

export function NowIndicator({ slotHeight, slotDuration }: NowIndicatorProps) {
  const [now, setNow] = React.useState(new Date());
  const slotMinTime = useCalendarStore((state) => state.slotMinTime);
  const slotMaxTime = useCalendarStore((state) => state.slotMaxTime);

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Parse min/max time
  const [minHour, minMinute] = slotMinTime.split(":").map(Number);
  const [maxHour, maxMinute] = slotMaxTime.split(":").map(Number);

  // Calculate position
  const nowHour = now.getHours();
  const nowMinute = now.getMinutes();

  // Check if current time is within visible range
  const minTotalMinutes = minHour * 60 + minMinute;
  const maxTotalMinutes = maxHour * 60 + maxMinute;
  const nowTotalMinutes = nowHour * 60 + nowMinute;

  if (nowTotalMinutes < minTotalMinutes || nowTotalMinutes > maxTotalMinutes) {
    return null;
  }

  // Calculate top position
  const minutesFromStart = nowTotalMinutes - minTotalMinutes;
  const pixelsPerMinute = slotHeight / slotDuration;
  const top = minutesFromStart * pixelsPerMinute;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      {/* Circle indicator */}
      <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
      {/* Line */}
      <div className="absolute left-0 right-0 h-0.5 bg-red-500" />
    </div>
  );
}
