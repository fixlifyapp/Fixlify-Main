import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { FullCalendarSchedule } from "@/components/schedule/FullCalendarSchedule";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Loader2, Clock, Users, CheckCircle } from "lucide-react";
import { AIInsightsPanel } from "@/components/schedule/AIInsightsPanel";
import { useSearchParams } from "react-router-dom";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useJobs } from "@/hooks/useJobs";

const SchedulePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'day' | 'week' | 'month'>(searchParams.get('view') as 'day' | 'week' | 'month' || 'week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedJobDate, setSelectedJobDate] = useState<Date | undefined>(undefined);

  const { addJob, refreshJobs } = useJobs();

  console.log('SchedulePage: Component mounted', { user, authLoading, view });

  useEffect(() => {
    console.log('SchedulePage: User state changed', { user, authLoading });
    
    if (!authLoading && !user) {
      console.log('SchedulePage: No authenticated user found');
      setScheduleError('Authentication required');
      toast.error('Please sign in to view the schedule');
    } else if (user) {
      console.log('SchedulePage: User authenticated successfully');
      setScheduleError(null);
    }
  }, [user, authLoading]);

  // Update URL when view changes
  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    console.log('SchedulePage: View changed', { newView });
    setView(newView);
    setSearchParams(params => {
      params.set('view', newView);
      return params;
    });
  };

  // Handle date change from filters
  const handleDateChange = (newDate: Date) => {
    console.log('SchedulePage: Date changed', { newDate });
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

  // Show loading state while checking authentication
  if (authLoading) {
    console.log('SchedulePage: Rendering auth loading state');
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
    console.log('SchedulePage: Rendering error state', { scheduleError });
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

  console.log('SchedulePage: Rendering main schedule content');
  
  return (
    <PageLayout>
      <PageHeader
        title="Schedule"
        subtitle="Manage your team's schedule and appointments efficiently"
        icon={Calendar}
        badges={[
          { text: "Smart Scheduling", icon: Clock, variant: "fixlyfy" },
          { text: "Team Coordination", icon: Users, variant: "success" },
          { text: "AI Optimization", icon: CheckCircle, variant: "info" }
        ]}
        actionButton={{
          text: "New Job",
          icon: Plus,
          onClick: () => setIsCreateModalOpen(true)
        }}
      />
      
      {/* Show AI Insights panel when toggled */}
      {showAIInsights && (
        <div className="mb-6">
          <AIInsightsPanel />
        </div>
      )}
      
      {/* Filters */}
      <div className="fixlyfy-card p-4 mb-6">
        <ScheduleFilters
          view={view}
          onViewChange={handleViewChange}
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />
      </div>

      <FullCalendarSchedule
        view={view}
        currentDate={currentDate}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        onCreateJob={handleCreateJobFromCalendar}
      />
      
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
