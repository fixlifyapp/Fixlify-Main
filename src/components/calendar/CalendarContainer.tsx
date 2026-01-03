import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CalendarProvider,
  CalendarEvent,
  CalendarResource,
  useCalendarStore,
  CalendarView,
  BusinessHours,
} from "./CalendarProvider";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDndProvider } from "./dnd/DndProvider";
import { DayView } from "./views/DayView";
import { WeekView } from "./views/WeekView";
import { MonthView } from "./views/MonthView";
import { TeamView } from "./views/TeamView";
import { GanttView } from "./views/GanttView";
import { AISchedulingPanel, AISchedulingToggle, AIRecommendation } from "./ai";
import { Loader2 } from "lucide-react";
import "./styles/calendar.css";

interface CustomCalendarProps {
  events?: CalendarEvent[];
  resources?: CalendarResource[];
  initialView?: CalendarView;
  initialDate?: Date;
  isLoading?: boolean;
  className?: string;
  showHeader?: boolean;
  showAIAssistant?: boolean;
  businessHours?: BusinessHours | null;
  timezone?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onEventResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  onDateSelect?: (start: Date, end: Date, resourceId?: string) => void;
  onAIRecommendationApply?: (recommendation: AIRecommendation) => void;
}

// Inner component that uses the store
function CalendarInner({
  events,
  resources,
  initialView,
  initialDate,
  isLoading,
  showHeader = true,
  showAIAssistant = true,
  businessHours,
  timezone,
  className,
  onAIRecommendationApply,
}: Omit<CustomCalendarProps, "onEventClick" | "onEventDrop" | "onEventResize" | "onSlotClick" | "onDateSelect">) {
  const [isAIPanelOpen, setIsAIPanelOpen] = React.useState(false);
  const view = useCalendarStore((state) => state.view);
  const setView = useCalendarStore((state) => state.setView);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const setEvents = useCalendarStore((state) => state.setEvents);
  const setResources = useCalendarStore((state) => state.setResources);
  const setIsLoading = useCalendarStore((state) => state.setIsLoading);
  const setBusinessHours = useCalendarStore((state) => state.setBusinessHours);
  const setTimezone = useCalendarStore((state) => state.setTimezone);
  const storeIsLoading = useCalendarStore((state) => state.isLoading);

  // Sync events with store
  React.useEffect(() => {
    if (events) {
      setEvents(events);
    }
  }, [events, setEvents]);

  // Sync resources with store
  React.useEffect(() => {
    if (resources) {
      setResources(resources);
    }
  }, [resources, setResources]);

  // Sync view with store - only when initialView actually changes
  const initialViewRef = React.useRef(initialView);
  React.useEffect(() => {
    if (initialView && initialView !== initialViewRef.current) {
      initialViewRef.current = initialView;
      setView(initialView);
    }
  }, [initialView, setView]);

  // Initial view set on mount
  React.useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync date with store - use timestamp comparison to avoid infinite loops
  const initialDateTimestamp = initialDate?.getTime();
  React.useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDateTimestamp, setCurrentDate]);

  React.useEffect(() => {
    setIsLoading(isLoading ?? false);
  }, [isLoading, setIsLoading]);

  // Sync business hours with store
  React.useEffect(() => {
    setBusinessHours(businessHours ?? null);
  }, [businessHours, setBusinessHours]);

  // Sync timezone with store
  React.useEffect(() => {
    if (timezone) {
      setTimezone(timezone);
    }
  }, [timezone, setTimezone]);

  // Render current view
  const renderView = () => {
    switch (view) {
      case "day":
        return <DayView />;
      case "week":
        return <WeekView />;
      case "month":
        return <MonthView />;
      case "team":
        return <TeamView />;
      case "gantt":
        return <GanttView />;
      default:
        return <WeekView />;
    }
  };

  return (
    <div className={cn("custom-calendar flex flex-col h-full bg-background rounded-lg border border-border", className)}>
      {/* Header with navigation and view selector - optional */}
      {showHeader && (
        <div className="flex items-center justify-between px-4">
          <CalendarHeader className="flex-1" showViewSelector />
          {showAIAssistant && (
            <AISchedulingToggle
              isOpen={isAIPanelOpen}
              onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
              className="ml-2"
            />
          )}
        </div>
      )}

      {/* Calendar body */}
      <div className="flex-1 overflow-auto relative">
        {storeIsLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {renderView()}
      </div>

      {/* AI Scheduling Panel */}
      {showAIAssistant && (
        <AISchedulingPanel
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          onApplyRecommendation={onAIRecommendationApply}
        />
      )}
    </div>
  );
}

// Main exported component
export function CustomCalendar({
  events,
  resources,
  initialView = "week",
  initialDate,
  isLoading,
  className,
  showHeader = true,
  showAIAssistant = true,
  businessHours,
  timezone,
  onEventClick,
  onEventDrop,
  onEventResize,
  onSlotClick,
  onDateSelect,
  onAIRecommendationApply,
}: CustomCalendarProps) {
  return (
    <CalendarProvider
      onEventClick={onEventClick}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      onSlotClick={onSlotClick}
      onDateSelect={onDateSelect}
    >
      <CalendarDndProvider>
        <CalendarInner
          events={events}
          resources={resources}
          initialView={initialView}
          initialDate={initialDate}
          isLoading={isLoading}
          showHeader={showHeader}
          showAIAssistant={showAIAssistant}
          businessHours={businessHours}
          timezone={timezone}
          className={className}
          onAIRecommendationApply={onAIRecommendationApply}
        />
      </CalendarDndProvider>
    </CalendarProvider>
  );
}

// Re-export types and utilities
export type { CalendarEvent, CalendarResource, CalendarView };
export { STATUS_COLORS, useCalendarStore } from "./CalendarProvider";
