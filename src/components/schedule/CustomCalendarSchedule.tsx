import { useCallback } from "react";
import { CustomCalendar, CalendarEvent, CalendarView } from "@/components/calendar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface CustomCalendarScheduleProps {
  view: "day" | "week" | "month" | "team";
  currentDate: Date;
  onViewChange: (view: "day" | "week" | "month" | "team") => void;
  onDateChange: (date: Date) => void;
  onCreateJob?: (startDate: Date, endDate?: Date) => void;
  onEventClick?: (jobId: string) => void;
}

export function CustomCalendarSchedule({
  view,
  currentDate,
  onViewChange,
  onDateChange,
  onCreateJob,
  onEventClick,
}: CustomCalendarScheduleProps) {
  const {
    events,
    resources,
    loading,
    handleEventDrop,
    handleEventResize,
    getJobById,
  } = useCalendarEvents();

  // Handle event click
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      const jobId = event.extendedProps?.jobId || event.id;
      onEventClick?.(jobId);
    },
    [onEventClick]
  );

  // Handle slot click for creating new job
  const handleSlotClick = useCallback(
    (date: Date, resourceId?: string) => {
      onCreateJob?.(date);
    },
    [onCreateJob]
  );

  // Handle date selection (drag to create)
  const handleDateSelect = useCallback(
    (start: Date, end: Date, resourceId?: string) => {
      onCreateJob?.(start, end);
    },
    [onCreateJob]
  );

  return (
    <div className="fixlyfy-card">
      <CustomCalendar
        events={events}
        resources={resources}
        initialView={view as CalendarView}
        initialDate={currentDate}
        isLoading={loading}
        showHeader={false}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onSlotClick={handleSlotClick}
        onDateSelect={handleDateSelect}
        className="min-h-[600px]"
      />
    </div>
  );
}
