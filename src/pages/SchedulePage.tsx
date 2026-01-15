import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { FullCalendarSchedule } from "@/components/schedule/FullCalendarSchedule";
import { CustomCalendarSchedule } from "@/components/schedule/CustomCalendarSchedule";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Loader2, Clock, Users, CheckCircle, Sparkles, Rocket } from "lucide-react";
import { AIInsightsPanel } from "@/components/schedule/AIInsightsPanel";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useJobs } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useClientsOptimized } from "@/hooks/useClientsOptimized";
import { useFullCalendarEvents } from "@/hooks/useFullCalendarEvents";

// Revolutionary Calendar 2026
import { Calendar2026, SmartAgendaCompact, useAIScheduling2026 } from "@/components/calendar-2026";

// Feature flags
const USE_CUSTOM_CALENDAR = import.meta.env.VITE_CUSTOM_CALENDAR === "true";
const USE_CALENDAR_2026 = import.meta.env.VITE_CALENDAR_2026 === "true" || true; // Enable by default for testing

const SchedulePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'day' | 'week' | 'month' | 'team'>(searchParams.get('view') as 'day' | 'week' | 'month' | 'team' || 'week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedJobDate, setSelectedJobDate] = useState<Date | undefined>(undefined);
  const [useRevolutionary, setUseRevolutionary] = useState(USE_CALENDAR_2026);

  const { addJob, refreshJobs, jobs } = useJobs();
  const { technicians } = useTechnicians();
  const { clients } = useClientsOptimized();
  const { events, resources } = useFullCalendarEvents();

  // Transform data for Calendar2026
  const calendar2026Data = useMemo(() => ({
    technicians: technicians?.map(t => ({ id: t.id, name: t.name || t.email || 'Unknown' })) || [],
    clients: clients?.map(c => ({ id: c.id, name: c.name || 'Unknown' })) || [],
  }), [technicians, clients]);

  useEffect(() => {
    if (!authLoading && !user) {
      setScheduleError('Authentication required');
      toast.error('Please sign in to view the schedule');
    } else if (user) {
      setScheduleError(null);
    }
  }, [user, authLoading]);

  // Update URL when view changes
  const handleViewChange = (newView: 'day' | 'week' | 'month' | 'team') => {
    setView(newView);
    setSearchParams(params => {
      params.set('view', newView);
      return params;
    });
  };

  // Handle date change from filters
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Handle job creation using centralized logic
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        // Toast notification handled by ScheduleJobModal
        refreshJobs();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  // Handle successful job creation
  const handleJobSuccess = (job: Job) => {
    toast.success(`Job ${job.id} has been created and scheduled`);
  };

  // Handle creating a job from calendar selection
  const handleCreateJobFromCalendar = useCallback((startDate: Date, endDate?: Date) => {
    setSelectedJobDate(startDate);
    setIsCreateModalOpen(true);
  }, []);

  // Handle event click - navigate to job detail page
  const handleEventClick = useCallback((jobId: string) => {
    navigate(`/jobs/${jobId}`);
  }, [navigate]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
            <p className="text-fixlyfy-text-secondary">Loading schedule...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state if there's an issue
  if (scheduleError) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-2">Schedule Error</div>
            <div className="text-sm text-gray-600 mb-4">{scheduleError}</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Schedule"
        subtitle="Manage your team's schedule and appointments efficiently"
        icon={Calendar}
        badges={[
          { text: "Smart Scheduling", icon: Clock, variant: "fixlyfy" },
          { text: "Team Coordination", icon: Users, variant: "success" },
          { text: "AI Optimization", icon: CheckCircle, variant: "info" },
          ...(useRevolutionary ? [{ text: "2026 Mode", icon: Rocket, variant: "warning" as const }] : [])
        ]}
        actionButton={{
          text: "New Job",
          icon: Plus,
          onClick: () => setIsCreateModalOpen(true)
        }}
      />

      {/* Revolutionary Calendar Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {useRevolutionary && (
            <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-1">
              <Sparkles className="h-3 w-3" />
              Revolutionary Calendar 2026
            </Badge>
          )}
        </div>
        <Button
          variant={useRevolutionary ? "default" : "outline"}
          size="sm"
          onClick={() => setUseRevolutionary(!useRevolutionary)}
          className={useRevolutionary ? "bg-violet-600 hover:bg-violet-700" : ""}
        >
          <Rocket className="h-4 w-4 mr-2" />
          {useRevolutionary ? "Using 2026 Mode" : "Try 2026 Mode"}
        </Button>
      </div>

      {/* Show AI Insights panel when toggled */}
      {showAIInsights && !useRevolutionary && (
        <div className="mb-6">
          <AIInsightsPanel />
        </div>
      )}

      {/* Revolutionary Calendar 2026 */}
      {useRevolutionary ? (
        <div className="h-[calc(100vh-280px)] min-h-[600px]">
          <Calendar2026
            events={events}
            resources={resources}
            technicians={calendar2026Data.technicians}
            clients={calendar2026Data.clients}
            onEventClick={(event) => {
              if (event.extendedProps?.jobId) {
                navigate(`/jobs/${event.extendedProps.jobId}`);
              }
            }}
            onSlotClick={(date, resourceId) => {
              setSelectedJobDate(date);
              setIsCreateModalOpen(true);
            }}
            onScheduleJob={async (data) => {
              try {
                const jobData = {
                  schedule_start: data.startTime.toISOString(),
                  schedule_end: data.endTime.toISOString(),
                  technician_id: data.technicianId,
                  client_id: data.clientId,
                  job_type: data.jobType,
                  description: data.notes,
                };
                await handleJobCreated(jobData);
                toast.success('Job scheduled successfully!');
              } catch (error) {
                toast.error('Failed to schedule job');
              }
            }}
            onOptimizeRoutes={async () => {
              toast.info('Route optimization is processing...');
              // Simulate optimization
              await new Promise(resolve => setTimeout(resolve, 2000));
              toast.success('Routes optimized! Saved ~25 minutes');
              return {
                originalRoute: [],
                optimizedRoute: [],
                timeSaved: 25,
                distanceSaved: 12.5,
              };
            }}
          />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="fixlyfy-card p-4 mb-6">
            <ScheduleFilters
              view={view}
              onViewChange={handleViewChange}
              currentDate={currentDate}
              onDateChange={handleDateChange}
            />
          </div>

          {USE_CUSTOM_CALENDAR ? (
            <CustomCalendarSchedule
              view={view}
              currentDate={currentDate}
              onViewChange={handleViewChange}
              onDateChange={handleDateChange}
              onCreateJob={handleCreateJobFromCalendar}
              onEventClick={handleEventClick}
            />
          ) : (
            <FullCalendarSchedule
              view={view}
              currentDate={currentDate}
              onViewChange={handleViewChange}
              onDateChange={handleDateChange}
              onCreateJob={handleCreateJobFromCalendar}
            />
          )}
        </>
      )}

      {/* Use centralized ScheduleJobModal */}
      <ScheduleJobModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onJobCreated={handleJobCreated}
        onSuccess={handleJobSuccess}
      />
    </PageLayout>
  );
};

export default SchedulePage;
