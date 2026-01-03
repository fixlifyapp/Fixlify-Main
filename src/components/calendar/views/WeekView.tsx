import * as React from "react";
import { startOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "../CalendarProvider";
import { TimeGrid } from "../grid/TimeGrid";

interface WeekViewProps {
  className?: string;
}

export function WeekView({ className }: WeekViewProps) {
  const currentDate = useCalendarStore((state) => state.currentDate);

  // Generate 7 days of the week
  const days = React.useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentDate]);

  return (
    <div className={cn("flex flex-col flex-1 min-h-0", className)}>
      <TimeGrid days={days} showDayHeaders={true} showTimeAxis={true} />
    </div>
  );
}
