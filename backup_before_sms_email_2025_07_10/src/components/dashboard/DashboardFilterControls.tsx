import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { TimePeriod } from "@/types/dashboard";

interface DashboardFilterControlsProps {
  currentPeriod: TimePeriod;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onFilterChange: (period: TimePeriod, range?: { from: Date | undefined; to: Date | undefined }) => void;
}

export const DashboardFilterControls = ({
  currentPeriod,
  dateRange,
  onFilterChange,
}: DashboardFilterControlsProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: dateRange.from,
    to: dateRange.to,
  });

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  const handlePeriodSelect = (period: TimePeriod) => {
    if (period !== "custom") {
      onFilterChange(period);
    } else {
      setIsCalendarOpen(true);
      onFilterChange("custom", tempDateRange);
    }
  };

  const handleCalendarSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setTempDateRange(range);
  };

  const handleCalendarApply = () => {
    onFilterChange("custom", tempDateRange);
    setIsCalendarOpen(false);
  };

  const clearDateRange = () => {
    setTempDateRange({ from: undefined, to: undefined });
    onFilterChange("month", { from: undefined, to: undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex bg-fixlyfy-bg-interface rounded-lg p-1">
        <Button
          variant={currentPeriod === "week" ? "default" : "ghost"}
          className={`text-sm ${currentPeriod === "week" ? "" : "text-fixlyfy-text-secondary"}`}
          onClick={() => handlePeriodSelect("week")}
        >
          This week
        </Button>
        <Button
          variant={currentPeriod === "month" ? "default" : "ghost"}
          className={`text-sm ${currentPeriod === "month" ? "" : "text-fixlyfy-text-secondary"}`}
          onClick={() => handlePeriodSelect("month")}
        >
          This month
        </Button>
        <Button
          variant={currentPeriod === "quarter" ? "default" : "ghost"}
          className={`text-sm ${currentPeriod === "quarter" ? "" : "text-fixlyfy-text-secondary"}`}
          onClick={() => handlePeriodSelect("quarter")}
        >
          Last 90 days
        </Button>
      </div>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={currentPeriod === "custom" ? "default" : "outline"}
            className="gap-2"
            onClick={() => handlePeriodSelect("custom")}
          >
            <CalendarIcon size={16} />
            {currentPeriod === "custom" && dateRange.from && dateRange.to
              ? formatDateRange()
              : "Custom range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            selected={{ from: tempDateRange.from, to: tempDateRange.to }}
            onSelect={handleCalendarSelect}
            initialFocus
          />
          <div className="flex items-center justify-between p-3 border-t border-fixlyfy-border">
            <Button variant="outline" size="sm" onClick={() => setIsCalendarOpen(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {(tempDateRange.from || tempDateRange.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="text-fixlyfy-text-secondary"
                >
                  <X size={14} className="mr-1" /> Clear
                </Button>
              )}
              <Button variant="default" size="sm" onClick={handleCalendarApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
