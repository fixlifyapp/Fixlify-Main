import * as React from "react";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "../CalendarProvider";
import { TimeGrid } from "../grid/TimeGrid";

interface DayViewProps {
  className?: string;
}

export function DayView({ className }: DayViewProps) {
  const currentDate = useCalendarStore((state) => state.currentDate);

  // Single day array
  const days = React.useMemo(() => [currentDate], [currentDate]);

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <TimeGrid days={days} showDayHeaders={true} showTimeAxis={true} />
    </div>
  );
}
