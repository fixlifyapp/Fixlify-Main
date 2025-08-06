import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { 
  Grid, 
  List, 
  Plus, 
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { useJobsStable } from "@/hooks/useJobsStable";
import { toast } from "sonner";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    technician: "all",
    dateRange: { start: null as Date | null, end: null as Date | null },
    tags: [] as string[]
  });
  
  // Use stable useJobs hook without real-time updates
  const { 
    jobs,
    isLoading,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs,
    canCreate,
    canEdit,
    canDelete
  } = useJobsStable();

  // Debug logging
  useEffect(() => {
    console.log('JobsPage - jobs:', jobs);
    console.log('JobsPage - isLoading:', isLoading);
  }, [jobs, isLoading]);
  
  // Clear selected jobs when jobs change
  useEffect(() => {
    setSelectedJobs(prev => prev.filter(id => jobs.some(job => job.id === id)));
  }, [jobs]);

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          job.client?.name || '',
          job.id || '',
          job.title || '',
          job.description || ''
        ];
        
        if (!searchableFields.some(field => field.toLowerCase().includes(searchTerm))) {
          return false;
        }
      }
      
      if (filters.status !== "all" && job.status !== filters.status) {
        return false;
      }
      
      if (filters.type !== "all" && job.job_type?.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }
      
      if (filters.dateRange.start && job.date && new Date(job.date) < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && job.date && new Date(job.date) > filters.dateRange.end) {
        return false;
      }
      
      if (filters.tags.length > 0) {
        if (!job.tags || !filters.tags.some(tag => job.tags?.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }, [jobs, filters]);
  
  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: filteredJobs.length,
      active: filteredJobs.filter(j => 
        j.status === 'in_progress' || 
        j.status === 'in progress' || 
        j.status === 'scheduled'
      ).length,
      completed: filteredJobs.filter(j => j.status === 'completed').length,
      totalRevenue: filteredJobs.reduce((sum, job) => sum + (job.revenue || 0), 0)
    };
  }, [filteredJobs]);
  
  const handleJobCreated = useCallback(async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        await refreshJobs();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  }, [addJob, refreshJobs]);

  const handleSelectJob = useCallback((jobId: string, isSelected: boolean) => {
    setSelectedJobs(prev => 
      isSelected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  }, []);

  const handleSelectAllJobs = useCallback((select: boolean) => {
    setSelectedJobs(select ? filteredJobs.map(job => job.id) : []);
  }, [filteredJobs]);

  const handleBulkUpdateStatus = useCallback(async (jobIds: string[], newStatus: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })));
      toast.success(`Updated ${jobIds.length} jobs to ${newStatus}`);
      setSelectedJobs([]);
      await refreshJobs();
    } catch (error) {
      console.error('Error updating jobs:', error);
      toast.error('Failed to update some jobs');
    }
  }, [updateJob, refreshJobs]);

  const handleBulkDelete = useCallback(async (jobIds: string[]) => {
    try {
      await Promise.all(jobIds.map(id => deleteJob(id)));
      toast.success(`Deleted ${jobIds.length} jobs`);
      setSelectedJobs([]);
      await refreshJobs();
    } catch (error) {
      console.error('Error deleting jobs:', error);
      toast.error('Failed to delete some jobs');
    }
  }, [deleteJob, refreshJobs]);

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Job Management"
          subtitle="Track and manage all your service jobs"
          icon={Briefcase}
          badges={[
            { text: "Active Jobs", icon: Clock, variant: "fixlyfy" },
            { text: "Performance", icon: CheckCircle, variant: "success" },
            { text: "Revenue", icon: DollarSign, variant: "info" }
          ]}
          actionButton={{
            text: "Create Job",
            icon: Plus,
            onClick: () => setIsCreateJobModalOpen(true)
          }}
        />
      </AnimatedContainer>
        
      {/* Job Stats Summary */}
      <AnimatedContainer animation="fade-in" delay={150}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Jobs */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-fixlyfy/5 to-fixlyfy/10 rounded-2xl p-5 border border-fixlyfy/20 hover:border-fixlyfy/40 hover:shadow-lg hover:shadow-fixlyfy/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-fixlyfy/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-5 w-5 text-fixlyfy" />
                </div>
                <span className="text-xs font-semibold text-fixlyfy/80 bg-fixlyfy/10 px-2.5 py-1 rounded-full">Total</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">{statistics.total}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </div>
          
          {/* Active Jobs */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-2xl p-5 border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600/80 bg-green-500/10 px-2.5 py-1 rounded-full">Active</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">{statistics.active}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </div>
          
          {/* Completed Jobs */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600/80 bg-blue-500/10 px-2.5 py-1 rounded-full">Done</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">{statistics.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
          
          {/* Total Revenue */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-fixlyfy/5 to-fixlyfy/10 rounded-2xl p-5 border border-fixlyfy/20 hover:border-fixlyfy/40 hover:shadow-lg hover:shadow-fixlyfy/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-fixlyfy/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 text-fixlyfy" />
                </div>
                <span className="text-xs font-semibold text-fixlyfy/80 bg-fixlyfy/10 px-2.5 py-1 rounded-full">Revenue</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${statistics.totalRevenue > 0 ? (statistics.totalRevenue / 1000).toFixed(1) + 'k' : '0.00'}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Filters and Actions */}
      <AnimatedContainer animation="fade-in" delay={200}>
        <div className="space-y-4">
          <ModernCard variant="glass" className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <JobsFilters 
                onFiltersChange={setFilters} 
                filters={filters}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshJobs}
                  className="flex gap-2 rounded-xl"
                  disabled={isLoading}
                >
                  <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                  Refresh
                </Button>
                <Button
                  variant={!isGridView ? "secondary" : "ghost"}
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
          
          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedJobs.length}
              onSelectAll={() => handleSelectAllJobs(true)}
              onDeselectAll={() => handleSelectAllJobs(false)}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
              selectedJobIds={selectedJobs}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
          
          {/* Jobs List */}
          <ModernCard variant="glass" className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.status !== "all" || filters.type !== "all" 
                    ? "No jobs match your current filters."
                    : "Get started by creating your first job."}
                </p>
                {(!filters.search && filters.status === "all" && filters.type === "all") && (
                  <Button onClick={() => setIsCreateJobModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Job
                  </Button>
                )}
              </div>
            ) : (
              <JobsList
                jobs={filteredJobs}
                selectedJobs={selectedJobs}
                onSelectJob={handleSelectJob}
                isGridView={isGridView}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            )}
          </ModernCard>
        </div>
      </AnimatedContainer>
      
      {/* Create Job Modal */}
      <ScheduleJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </PageLayout>
  );
};

export default JobsPage;