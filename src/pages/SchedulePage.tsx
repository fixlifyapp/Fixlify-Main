import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Loader2, Clock, Users, CheckCircle, Sparkles, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useJobs } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useClientsOptimized } from "@/hooks/useClientsOptimized";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useUserProfile } from "@/hooks/use-user-profile";
import { DEFAULT_BUSINESS_HOURS } from "@/types/businessHours";

// Calendar 2026 - 100% custom calendar (no third-party dependencies)
import { Calendar2026 } from "@/components/calendar-2026";

const SchedulePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedJobDate, setSelectedJobDate] = useState<Date | undefined>(undefined);

  const { addJob, refreshJobs } = useJobs();
  const { technicians } = useTechnicians();
  const { clients } = useClientsOptimized();
  const { events, resources } = useCalendarEvents();

  // Extract business hours from profile settings
  const businessHours = useMemo(() => {
    // Parse time string like "08:00" to hour number
    const parseTime = (timeStr: string | undefined | null): number | null => {
      if (!timeStr) return null;
      const [hour] = timeStr.split(':').map(Number);
      return isNaN(hour) ? null : hour;
    };

    // Default fallback hours (only used if no profile hours exist)
    // Shows 6 AM - 10 PM range with business hours 7 AM - 10 PM
    const defaultHours = {
      startHour: 6,
      endHour: 22,
      businessHoursStart: 7,
      businessHoursEnd: 22
    };

    if (!profile?.business_hours) return defaultHours;

    try {
      const hours = profile.business_hours as Record<string, any>;
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      // Helper to get hours from a day config
      const getDayHours = (dayConfig: any): { start: number; end: number } | null => {
        if (!dayConfig) return null;
        // Check if day is enabled (if enabled property exists)
        if (dayConfig.enabled === false) return null;

        const startKey = dayConfig.open || dayConfig.start;
        const endKey = dayConfig.close || dayConfig.end;
        const start = parseTime(startKey);
        const end = parseTime(endKey);

        if (start !== null && end !== null) {
          return { start, end };
        }
        return null;
      };

      // Try to get hours: first from today, then Monday, then any enabled day
      const today = dayNames[new Date().getDay()];
      let businessStart: number | null = null;
      let businessEnd: number | null = null;

      // 1. Try today's hours
      const todayConfig = getDayHours(hours[today]);
      if (todayConfig) {
        businessStart = todayConfig.start;
        businessEnd = todayConfig.end;
      }

      // 2. If today is closed, try Monday
      if (businessStart === null && hours['monday']) {
        const mondayConfig = getDayHours(hours['monday']);
        if (mondayConfig) {
          businessStart = mondayConfig.start;
          businessEnd = mondayConfig.end;
        }
      }

      // 3. If Monday doesn't work, try any day with hours
      if (businessStart === null) {
        for (const dayName of dayNames) {
          const dayConfig = getDayHours(hours[dayName]);
          if (dayConfig) {
            businessStart = dayConfig.start;
            businessEnd = dayConfig.end;
            break;
          }
        }
      }

      // If we found business hours from profile, use them
      if (businessStart !== null && businessEnd !== null) {
        return {
          startHour: Math.max(businessStart - 1, 5),  // Show 1 hour before business start
          endHour: Math.min(businessEnd + 1, 23),     // Show 1 hour after business end
          businessHoursStart: businessStart,
          businessHoursEnd: businessEnd,
        };
      }
    } catch (e) {
      console.error('Error parsing business hours:', e);
    }

    return defaultHours;
  }, [profile?.business_hours]);

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

  // Handle job creation using centralized logic
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
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
          { text: "AI Mode", icon: Rocket, variant: "warning" as const }
        ]}
        actionButton={{
          text: "New Job",
          icon: Plus,
          onClick: () => setIsCreateModalOpen(true)
        }}
      />

      {/* AI-Powered Calendar Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered Calendar
        </Badge>
      </div>

      {/* Calendar 2026 - Main Calendar Component */}
      <div className="pb-8">
        <Calendar2026
          events={events}
          resources={resources}
          technicians={calendar2026Data.technicians}
          clients={calendar2026Data.clients}
          startHour={businessHours.startHour}
          endHour={businessHours.endHour}
          businessHoursStart={businessHours.businessHoursStart}
          businessHoursEnd={businessHours.businessHoursEnd}
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

      {/* Job Creation Modal */}
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
