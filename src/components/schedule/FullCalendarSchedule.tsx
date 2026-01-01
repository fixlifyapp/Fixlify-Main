import { useRef, useState, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DatesSetArg, DateSelectArg } from '@fullcalendar/core';
import { useNavigate } from 'react-router-dom';
import { useFullCalendarEvents } from '@/hooks/useFullCalendarEvents';
import { EventBottomSheet } from './mobile/EventBottomSheet';
import { QuickAddFAB } from './mobile/QuickAddFAB';
import { Loader2, AlertCircle, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import '@/styles/fullcalendar.css';

interface FullCalendarScheduleProps {
  view?: 'day' | 'week' | 'month';
  currentDate?: Date;
  onViewChange?: (view: 'day' | 'week' | 'month') => void;
  onDateChange?: (date: Date) => void;
  onCreateJob?: (startDate: Date, endDate?: Date) => void;
}

const VIEW_MAP = {
  day: 'timeGridDay',
  week: 'timeGridWeek',
  month: 'dayGridMonth'
} as const;

const REVERSE_VIEW_MAP: Record<string, 'day' | 'week' | 'month'> = {
  timeGridDay: 'day',
  timeGridWeek: 'week',
  dayGridMonth: 'month'
};

export function FullCalendarSchedule({
  view = 'week',
  currentDate = new Date(),
  onViewChange,
  onDateChange,
  onCreateJob
}: FullCalendarScheduleProps) {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const {
    events,
    loading,
    error,
    fetchJobs,
    handleEventDrop,
    handleEventResize,
    getJobById
  } = useFullCalendarEvents();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update calendar view when prop changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const fcView = VIEW_MAP[view];
      if (calendarApi.view.type !== fcView) {
        calendarApi.changeView(fcView);
      }
    }
  }, [view]);

  // Update calendar date when prop changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && currentDate) {
      calendarApi.gotoDate(currentDate);
    }
  }, [currentDate]);

  // Handle event click
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const jobId = clickInfo.event.id;

    if (isMobile) {
      // On mobile, show bottom sheet
      const job = getJobById(jobId);
      setSelectedEvent({
        ...clickInfo.event.extendedProps,
        id: jobId,
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end
      });
      setShowBottomSheet(true);
    } else {
      // On desktop, navigate to job details
      navigate(`/jobs/${jobId}`);
    }
  }, [isMobile, navigate, getJobById]);

  // Handle date selection for creating new job
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (onCreateJob) {
      onCreateJob(selectInfo.start, selectInfo.end);
    }
  }, [onCreateJob]);

  // Handle dates change (navigation)
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    const newView = REVERSE_VIEW_MAP[arg.view.type];
    if (newView && onViewChange) {
      onViewChange(newView);
    }
    if (onDateChange) {
      onDateChange(arg.start);
    }
  }, [onViewChange, onDateChange]);

  // Handle FAB click
  const handleFabClick = useCallback(() => {
    if (onCreateJob) {
      onCreateJob(new Date());
    }
  }, [onCreateJob]);

  // Close bottom sheet
  const handleCloseBottomSheet = useCallback(() => {
    setShowBottomSheet(false);
    setSelectedEvent(null);
  }, []);

  // Navigate to job from bottom sheet
  const handleViewJob = useCallback((jobId: string) => {
    setShowBottomSheet(false);
    navigate(`/jobs/${jobId}`);
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="fixlyfy-card p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixlyfy-card p-8 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <div className="text-red-500 font-medium mb-2">Error loading schedule</div>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        <Button onClick={fetchJobs} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="fixlyfy-card overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
          <CalendarPlus className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No scheduled jobs</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Your schedule is empty. Create a new job to get started.
          </p>
          {onCreateJob && (
            <Button onClick={() => onCreateJob(new Date())}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule First Job
            </Button>
          )}
        </div>

        {/* Still show FAB on mobile */}
        {isMobile && onCreateJob && (
          <QuickAddFAB onClick={handleFabClick} />
        )}
      </div>
    );
  }

  return (
    <div className="fixlyfy-card overflow-hidden">
      <div className={cn(
        "fullcalendar-wrapper",
        isMobile && "fullcalendar-mobile"
      )}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? 'timeGridDay' : VIEW_MAP[view]}
          initialDate={currentDate}

          // Event data
          events={events}

          // Interactivity
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={isMobile ? 2 : true}

          // Touch support
          longPressDelay={isMobile ? 300 : 1000}
          eventLongPressDelay={isMobile ? 300 : 1000}
          selectLongPressDelay={isMobile ? 300 : 1000}

          // Header toolbar - disabled, using ScheduleFilters instead
          headerToolbar={false}

          // Time settings
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          scrollTime="08:00:00"

          // Display settings
          nowIndicator={true}
          weekNumbers={false}
          navLinks={true}

          // Event display
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}

          // Callbacks
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          select={handleDateSelect}
          datesSet={handleDatesSet}

          // Sizing
          height={isMobile ? 'calc(100vh - 200px)' : 'auto'}
          contentHeight={isMobile ? undefined : 700}

          // Locale
          locale="en"
          firstDay={1} // Monday

          // Button text
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day'
          }}

          // All day slot
          allDaySlot={false}

          // Event overlap
          slotEventOverlap={false}
          eventOverlap={false}
        />
      </div>

      {/* Mobile FAB */}
      {isMobile && onCreateJob && (
        <QuickAddFAB onClick={handleFabClick} />
      )}

      {/* Mobile Bottom Sheet */}
      <EventBottomSheet
        event={selectedEvent}
        open={showBottomSheet}
        onClose={handleCloseBottomSheet}
        onViewJob={handleViewJob}
      />
    </div>
  );
}
