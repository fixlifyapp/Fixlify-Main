
import { useState, useMemo } from "react";
import { useTeamMetrics, TechnicianMetric } from "@/hooks/useTeamMetrics";
import { TopTechnicians } from "./metrics/TopTechnicians";
import { DateRangeSelector } from "./metrics/DateRangeSelector";
import { formatCurrency } from "@/lib/utils";
import { addDays, startOfMonth, subDays } from "date-fns";

interface ExpandedDashboardMetricsProps {
  onClose: () => void;
}

export const ExpandedDashboardMetrics = ({
  onClose,
}: ExpandedDashboardMetricsProps) => {
  const [timeFilter, setTimeFilter] = useState<"today" | "yesterday" | "last7days" | "thisMonth" | "custom">("thisMonth");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calculate date range based on the selected filter
  const dateRange = useMemo(() => {
    const today = new Date();
    
    switch (timeFilter) {
      case "today":
        return { start: today.toISOString(), end: today.toISOString() };
      case "yesterday":
        const yesterday = subDays(today, 1);
        return { start: yesterday.toISOString(), end: yesterday.toISOString() };
      case "last7days":
        return { start: subDays(today, 7).toISOString(), end: today.toISOString() };
      case "thisMonth":
        return { start: startOfMonth(today).toISOString(), end: today.toISOString() };
      case "custom":
        return { 
          start: customDateRange.from.toISOString(), 
          end: customDateRange.to.toISOString() 
        };
      default:
        return { start: startOfMonth(today).toISOString(), end: today.toISOString() };
    }
  }, [timeFilter, customDateRange]);

  const { technicians, isLoading: isMetricsLoading } = useTeamMetrics(dateRange);
  
  const getFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "last7days": return "Last 7 Days";
      case "thisMonth": return "This Month";
      case "custom": return "Custom Range";
      default: return "This Month";
    }
  };
  
  const handleTimeFilterChange = (filter: "today" | "yesterday" | "last7days" | "thisMonth" | "custom") => {
    setTimeFilter(filter);
  };
  
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setCustomDateRange({ from: range.from, to: range.to });
    }
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const formatValue = (value: number): string => {
    return formatCurrency(value);
  };

  return (
    <div className="expand-animation z-50 bg-white fixed inset-0 overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-screen-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Performance Metrics</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <DateRangeSelector
          timeFilter={timeFilter}
          customDateRange={customDateRange}
          isLoading={isLoading || isMetricsLoading}
          getFilterLabel={getFilterLabel}
          onTimeFilterChange={handleTimeFilterChange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
        />

        <TopTechnicians
          technicians={technicians}
          isLoading={isLoading || isMetricsLoading}
          formatValue={formatValue}
        />
      </div>
    </div>
  );
};
