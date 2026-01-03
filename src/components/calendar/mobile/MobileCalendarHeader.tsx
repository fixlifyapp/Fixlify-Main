import * as React from "react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useCalendarStore } from "../CalendarProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

interface MobileCalendarHeaderProps {
  className?: string;
}

export function MobileCalendarHeader({ className }: MobileCalendarHeaderProps) {
  const currentDate = useCalendarStore((state) => state.currentDate);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPrevious = useCalendarStore((state) => state.goToPrevious);
  const goToNext = useCalendarStore((state) => state.goToNext);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Get relative date label
  const getDateLabel = () => {
    if (isToday(currentDate)) return "Today";
    if (isTomorrow(currentDate)) return "Tomorrow";
    if (isYesterday(currentDate)) return "Yesterday";
    return format(currentDate, "EEEE");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setCalendarOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border-b bg-background safe-area-inset-top",
        className
      )}
    >
      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="h-9 w-9"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="h-9 w-9"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Date display with calendar picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-0 h-auto py-1"
          >
            <span className="text-sm font-medium">{getDateLabel()}</span>
            <span className="text-xs text-muted-foreground">
              {format(currentDate, "MMM d, yyyy")}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarPicker
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Today button */}
      <Button
        variant={isToday(currentDate) ? "secondary" : "outline"}
        size="sm"
        onClick={goToToday}
        className="h-9"
        disabled={isToday(currentDate)}
      >
        <Calendar className="h-4 w-4 mr-1.5" />
        Today
      </Button>
    </div>
  );
}
