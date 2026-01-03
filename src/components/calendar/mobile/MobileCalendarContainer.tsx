import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CalendarProvider,
  CalendarEvent,
  CalendarResource,
  useCalendarStore,
  CalendarView,
  useCalendarContext,
} from "../CalendarProvider";
import { MobileCalendarHeader } from "./MobileCalendarHeader";
import { SwipeableDay } from "./SwipeableDay";
import { MobileEventSheet } from "./MobileEventSheet";
import { MobileTechnicianList } from "./MobileTechnicianList";
import { CalendarDndProvider } from "../dnd/DndProvider";
import { WeekView } from "../views/WeekView";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  Calendar,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";

type MobileView = "day" | "week" | "team";

interface MobileCalendarProps {
  events?: CalendarEvent[];
  resources?: CalendarResource[];
  initialDate?: Date;
  isLoading?: boolean;
  className?: string;
  showFAB?: boolean;
  showAIButton?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  onDateSelect?: (start: Date, end: Date, resourceId?: string) => void;
  onRefresh?: () => Promise<void>;
  onAISchedule?: () => void;
}

// Inner component that uses the store
function MobileCalendarInner({
  events,
  resources,
  initialDate,
  isLoading,
  className,
  showFAB = true,
  showAIButton = true,
  onRefresh,
  onAISchedule,
}: Omit<MobileCalendarProps, "onEventClick" | "onEventDrop" | "onSlotClick" | "onDateSelect">) {
  const view = useCalendarStore((state) => state.view);
  const setView = useCalendarStore((state) => state.setView);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const setEvents = useCalendarStore((state) => state.setEvents);
  const setResources = useCalendarStore((state) => state.setResources);
  const storeResources = useCalendarStore((state) => state.resources);
  const storeEvents = useCalendarStore((state) => state.events);
  const setIsLoading = useCalendarStore((state) => state.setIsLoading);
  const storeIsLoading = useCalendarStore((state) => state.isLoading);
  const { onEventClick, onSlotClick } = useCalendarContext();

  // Mobile-specific view state
  const [mobileView, setMobileView] = React.useState<MobileView>("day");
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  // Set mobile-appropriate default view
  React.useEffect(() => {
    setView("day"); // Default to day view on mobile
  }, [setView]);

  // Sync date with store
  const initialDateTimestamp = initialDate?.getTime();
  React.useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDateTimestamp, setCurrentDate]);

  React.useEffect(() => {
    setIsLoading(isLoading ?? false);
  }, [isLoading, setIsLoading]);

  // Handle event click
  const handleEventClick = React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      onEventClick?.(event);
    },
    [onEventClick]
  );

  // Handle slot click for job creation
  const handleCreateJob = React.useCallback(
    (technicianId?: string) => {
      onSlotClick?.(currentDate, technicianId);
    },
    [currentDate, onSlotClick]
  );

  // Pull-to-refresh functionality
  const handlePullStart = React.useCallback((startY: number) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    const handlePullMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(100, currentY - startY));
      setPullDistance(distance);
    };

    const handlePullEnd = async () => {
      if (pullDistance > 60 && onRefresh) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      document.removeEventListener("touchmove", handlePullMove);
      document.removeEventListener("touchend", handlePullEnd);
    };

    document.addEventListener("touchmove", handlePullMove, { passive: true });
    document.addEventListener("touchend", handlePullEnd, { passive: true });
  }, [pullDistance, onRefresh]);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    handlePullStart(e.touches[0].clientY);
  }, [handlePullStart]);

  // Render current view
  const renderView = () => {
    switch (mobileView) {
      case "day":
        return <SwipeableDay />;
      case "week":
        return <WeekView />;
      case "team":
        return (
          <MobileTechnicianList
            resources={storeResources}
            events={storeEvents}
            date={currentDate}
            onEventClick={handleEventClick}
            onTechnicianClick={handleCreateJob}
          />
        );
      default:
        return <SwipeableDay />;
    }
  };

  return (
    <div
      className={cn(
        "mobile-calendar flex flex-col h-full bg-background relative",
        className
      )}
    >
      {/* Mobile header with date and navigation */}
      <MobileCalendarHeader />

      {/* View Selector Tabs */}
      <div className="flex items-center justify-center gap-1 px-4 py-2 border-b bg-muted/30">
        {[
          { view: "day" as MobileView, icon: Calendar, label: "Day" },
          { view: "week" as MobileView, icon: Calendar, label: "Week" },
          { view: "team" as MobileView, icon: Users, label: "Team" },
        ].map(({ view: v, icon: Icon, label }) => (
          <Button
            key={v}
            variant={mobileView === v ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMobileView(v)}
            className={cn(
              "flex-1 max-w-[100px] gap-1.5",
              mobileView === v && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>

      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center transition-all duration-200"
          style={{ height: pullDistance }}
        >
          <RefreshCw
            className={cn(
              "h-5 w-5 text-primary transition-transform",
              isRefreshing && "animate-spin",
              pullDistance > 60 && "scale-125"
            )}
          />
        </div>
      )}

      {/* Calendar body with swipe support */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onTouchStart={handleTouchStart}
      >
        {storeIsLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {renderView()}
      </div>

      {/* Floating Action Button */}
      {showFAB && (
        <div className="absolute bottom-6 right-6 z-30">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg shadow-primary/25"
            onClick={() => handleCreateJob()}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* AI Quick Action Button */}
      {showAIButton && onAISchedule && (
        <div className="absolute bottom-6 left-6 z-30">
          <Button
            variant="secondary"
            size="lg"
            className="h-12 rounded-full shadow-lg gap-2 px-4"
            onClick={onAISchedule}
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm">AI</span>
          </Button>
        </div>
      )}

      {/* Event Detail Sheet */}
      <MobileEventSheet
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

// Main exported component
export function MobileCalendar({
  events,
  resources,
  initialDate,
  isLoading,
  className,
  showFAB = true,
  showAIButton = true,
  onEventClick,
  onEventDrop,
  onSlotClick,
  onDateSelect,
  onRefresh,
  onAISchedule,
}: MobileCalendarProps) {
  return (
    <CalendarProvider
      onEventClick={onEventClick}
      onEventDrop={onEventDrop}
      onSlotClick={onSlotClick}
      onDateSelect={onDateSelect}
    >
      <CalendarDndProvider>
        <MobileCalendarInner
          events={events}
          resources={resources}
          initialDate={initialDate}
          isLoading={isLoading}
          className={className}
          showFAB={showFAB}
          showAIButton={showAIButton}
          onRefresh={onRefresh}
          onAISchedule={onAISchedule}
        />
      </CalendarDndProvider>
    </CalendarProvider>
  );
}
