import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { 
  Grid, 
  List, 
  Plus, 
  Wrench, 
  Target, 
  TrendingUp,
  RefreshCw,
  Bug
} from "lucide-react";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { JobsKPICards } from "@/components/jobs/JobsKPICards";
import { useJobsOptimized } from "@/hooks/useJobsOptimized";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { debugJobCreation } from "@/utils/debug-job-creation";

const JobsPageOptimized = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    technician: "all",
    dateRange: { start: null as Date | null, end: null as Date | null },
    tags: [] as string[]
  });
  
  // Use optimized hook with filtering
  const {
    jobs,
    isLoading,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    refreshJobs,
    canCreate,
    canEdit,
    canDelete
  } = useJobsOptimized({
    page: currentPage,
    pageSize: 50,
    enableRealtime: false,  // Temporarily disabled to prevent resource exhaustion
    filters
  });

  // Keep original hook for mutations only
  const { addJob, updateJob, deleteJob } = useJobs();
  
  // Clear selected jobs when jobs change
  useEffect(() => {
    setSelectedJobs(prev => prev.filter(id => jobs.some(job => job.id === id)));
  }, [jobs]);

  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        // Toast notification removed - already shown in ScheduleJobModal
        // Refresh optimized jobs immediately
        refreshJobs();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  const handleSelectJob = (jobId: string, isSelected: boolean) => {
    setSelectedJobs(prev => 
      isSelected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  };

  const handleSelectAllJobs = (select: boolean) => {
    setSelectedJobs(select ? jobs.map(job => job.id) : []);
  };

  // Bulk action handlers
  const handleBulkUpdateStatus = async (jobIds: string[], newStatus: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })));
      toast.success(`Updated ${jobIds.length} jobs to ${newStatus}`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      toast.error('Failed to update job statuses');
    }
  };

  const handleBulkAssignTechnician = async (jobIds: string[], technicianId: string, technicianName: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })));
      toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      toast.error('Failed to assign technician');
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    try {
      await Promise.all(jobIds.map(id => deleteJob(id)));
      toast.success(`Deleted ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      toast.error('Failed to delete jobs');
    }
  };

  const handleBulkExport = (jobIds: string[]) => {
    const selectedJobData = jobs.filter(job => jobIds.includes(job.id));
    const csvData = selectedJobData.map(job => ({
      'Job ID': job.id,
      'Client': job.client?.name || '',
      'Status': job.status,
      'Type': job.job_type || '',
      'Date': job.date ? new Date(job.date).toLocaleDateString() : '',
      'Revenue': job.revenue || 0,
      'Address': job.address || ''
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${jobIds.length} jobs`);
    setSelectedJobs([]);
  };

  const handleBulkTagJobs = async (jobIds: string[], tags: string[]) => {
    try {
      await Promise.all(jobIds.map(id => {
        const job = jobs.find(j => j.id === id);
        const existingTags = job?.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        return updateJob(id, { tags: newTags });
      }));
      toast.success(`Tagged ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshJobs();
    } catch (error) {
      toast.error('Failed to tag jobs');
    }
  };

  const handleRefreshJobs = () => {
    refreshJobs();
    setSelectedJobs([]);
    toast.success('Jobs refreshed');
  };

  const handleDebugJobCreation = async () => {
    const results = await debugJobCreation();
    console.log('Debug results:', results);
    
    // Show toast with summary
    const failures = Object.entries(results).filter(([_, result]) => !result.success);
    if (failures.length === 0) {
      toast.success('All job creation checks passed! ✅');
    } else {
      toast.error(`${failures.length} checks failed. See console for details.`);
    }
  };

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Job Management"
          subtitle="Manage your jobs efficiently"
          icon={Wrench}
          badges={[
            { text: "Active Jobs", icon: Target, variant: "fixlyfy" },
            { text: "Performance", icon: TrendingUp, variant: "info" }
          ]}
          actionButton={{
            text: "Create Job",
            icon: Plus,
            onClick: () => setIsCreateJobModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={150}>
        <JobsKPICards className="mb-6" jobs={jobs} isLoading={isLoading} />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <div className="space-y-6">
          <ModernCard variant="glass" className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <JobsFilters 
                onFiltersChange={setFilters} 
                filters={filters}
              />
              <div className="flex items-center gap-2">
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDebugJobCreation}
                    className="flex gap-2 rounded-xl"
                    title="Debug job creation"
                  >
                    <Bug size={18} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshJobs}
                  className="flex gap-2 rounded-xl"
                  disabled={isLoading}
                >
                  <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> 
                  Refresh
                </Button>
                <Button
                  variant={isGridView ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setIsGridView(false)}
                  className="flex gap-2 rounded-xl"
                >
                  <List size={18} /> List
                </Button>
                <Button 
                  variant={isGridView ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsGridView(true)}
                  className="flex gap-2 rounded-xl"
                >
                  <Grid size={18} /> Grid
                </Button>
              </div>
            </div>
          </ModernCard>
          
          {/* Bulk Actions Bar - appears at top when jobs selected */}
          <BulkActionsBar
            selectedJobs={selectedJobs}
            onClearSelection={() => setSelectedJobs([])}
            onUpdateStatus={handleBulkUpdateStatus}
            onAssignTechnician={handleBulkAssignTechnician}
            onDeleteJobs={handleBulkDelete}
            onTagJobs={handleBulkTagJobs}
            onExport={handleBulkExport}
          />

          {isLoading ? (
            <LoadingSkeleton
              type={isGridView ? "job-card" : "job-list"}
              count={6}
            />
          ) : (
            <JobsList
              isGridView={isGridView}
              jobs={jobs}
              selectedJobs={selectedJobs}
              onSelectJob={handleSelectJob}
              onSelectAllJobs={handleSelectAllJobs}
              onRefresh={handleRefreshJobs}
            />
          )}
        </div>
      </AnimatedContainer>
      
      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        onJobCreated={handleJobCreated}

      />
    </PageLayout>
  );
};

export default JobsPageOptimized;
