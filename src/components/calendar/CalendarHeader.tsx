import * as React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Users, Calendar, LayoutGrid, GanttChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarView, useCalendarStore } from "./CalendarProvider";

interface CalendarHeaderProps {
  className?: string;
  showViewSelector?: boolean;
  showTodayButton?: boolean;
  title?: string;
}

const VIEW_OPTIONS: { value: CalendarView; label: string; icon: React.ReactNode }[] = [
  { value: "day", label: "Day", icon: <CalendarDays className="h-4 w-4" /> },
  { value: "week", label: "Week", icon: <Calendar className="h-4 w-4" /> },
  { value: "month", label: "Month", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
  { value: "gantt", label: "Gantt", icon: <GanttChart className="h-4 w-4" /> },
];

export function CalendarHeader({
  className,
  showViewSelector = true,
  showTodayButton = true,
  title,
}: CalendarHeaderProps) {
  const view = useCalendarStore((state) => state.view);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setView = useCalendarStore((state) => state.setView);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPrevious = useCalendarStore((state) => state.goToPrevious);
  const goToNext = useCalendarStore((state) => state.goToNext);

  // Format title based on view
  const getHeaderTitle = () => {
    if (title) return title;

    switch (view) {
      case "day":
      case "gantt":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
      case "team":
        return format(currentDate, "MMMM yyyy");
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  // Get navigation label based on view
  const getNavLabel = (direction: "prev" | "next") => {
    const action = direction === "prev" ? "Previous" : "Next";
    switch (view) {
      case "day":
      case "gantt":
        return `${action} day`;
      case "week":
      case "team":
        return `${action} week`;
      case "month":
        return `${action} month`;
      default:
        return `${action}`;
    }
  };

  return (
    <div
      className={cn("flex items-center justify-between py-4", className)}
      role="toolbar"
      aria-label="Calendar navigation"
    >
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        {showTodayButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            aria-label="Go to today"
          >
            Today
          </Button>
        )}

        <div className="flex items-center gap-1" role="group" aria-label="Date navigation">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevious}
            aria-label={getNavLabel("prev")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToNext}
            aria-label={getNavLabel("next")}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <h2
          className="text-lg font-semibold ml-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Right: View selector */}
      {showViewSelector && (
        <div
          className="flex items-center gap-1 bg-muted rounded-lg p-1"
          role="tablist"
          aria-label="Calendar view"
        >
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={view === option.value ? "default" : "ghost"}
              size="sm"
              className={cn(
                "gap-2",
                view === option.value && "shadow-sm"
              )}
              onClick={() => setView(option.value)}
              role="tab"
              aria-selected={view === option.value}
              aria-controls={`calendar-${option.value}-view`}
              tabIndex={view === option.value ? 0 : -1}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sr-only sm:hidden">{option.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
