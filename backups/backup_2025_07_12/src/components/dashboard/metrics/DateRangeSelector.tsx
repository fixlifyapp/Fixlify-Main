
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type TimeFilter = 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  timeFilter: TimeFilter;
  customDateRange: DateRange;
  isLoading: boolean;
  getFilterLabel: () => string;
  onTimeFilterChange: (value: TimeFilter) => void;
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  onRefresh: () => void;
}

export const DateRangeSelector = ({
  timeFilter,
  customDateRange,
  isLoading,
  getFilterLabel,
  onTimeFilterChange,
  onDateRangeChange,
  onRefresh
}: DateRangeSelectorProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const handleTimeFilterChange = (value: TimeFilter) => {
    onTimeFilterChange(value);
    if (value === 'custom') {
      setIsDatePickerOpen(true);
    } else {
      setIsDatePickerOpen(false);
    }
  };
  
  const formatDateRange = (from: Date, to: Date): string => {
    if (format(from, 'MMM yyyy') === format(to, 'MMM yyyy')) {
      return `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`;
    }
    return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
  };
  
  return (
    <div>
      <Select value={timeFilter} onValueChange={(value) => handleTimeFilterChange(value as TimeFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>{getFilterLabel()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      
      {timeFilter === 'custom' && (
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {customDateRange.from && customDateRange.to
                ? formatDateRange(customDateRange.from, customDateRange.to)
                : 'Select dates'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{
                from: customDateRange.from,
                to: customDateRange.to
              }}
              onSelect={onDateRangeChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")} 
            />
            <div className="p-3 border-t border-border flex justify-end">
              <Button size="sm" onClick={() => setIsDatePickerOpen(false)}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      <Button variant="ghost" onClick={onRefresh}>
        <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
