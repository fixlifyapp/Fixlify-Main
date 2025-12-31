import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import {
  Grid,
  List,
  Plus,
  Wrench,
  Target,
  TrendingUp,
  RefreshCw,
  WifiOff,
  Wifi,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { useJobsOptimized } from "@/hooks/useJobsOptimized";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { useGlobalRealtime } from "@/contexts/GlobalRealtimeProvider";
import { exportToPDF, exportToExcel, getJobExportColumns } from "@/utils/exportUtils";

const JobsPage = () => {
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
  
  // Use optimized hook for display
  const { 
    jobs: optimizedJobs, 
    isLoading: isOptimizedLoading,
    hasError: hasOptimizedError,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    refreshJobs: refreshOptimized,
    clearError: clearOptimizedError,
    canCreate,
    canEdit,
    canDelete,
    realtimeConnected
  } = useJobsOptimized({
    page: currentPage,
    pageSize: 50,
    enableRealtime: true
  });

  // Keep original hook for mutations only
  const { addJob, updateJob, deleteJob } = useJobs();
  
  // Clear selected jobs when jobs change
  useEffect(() => {
    setSelectedJobs(prev => prev.filter(id => optimizedJobs.some(job => job.id === id)));
  }, [optimizedJobs]);

  // Filter jobs based on current filters
  const filteredJobs = optimizedJobs.filter(job => {
    // Search filter - comprehensive search across multiple fields
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        job.client?.name || '',
        job.client?.email || '',
        job.client?.phone || '',
        job.id || '',
        job.title || '',
        job.description || '',
        job.invoice_number || '',
        job.estimate_number || ''
      ];

      if (!searchableFields.some(field => field.toLowerCase().includes(searchTerm))) {
        return false;
      }
    }
    
    // Status filter - compare exact match since statuses are now standardized
    if (filters.status !== "all" && job.status !== filters.status) {
      return false;
    }
    
    // Type filter
    if (filters.type !== "all" && job.job_type?.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.start && job.date && new Date(job.date) < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && job.date && new Date(job.date) > filters.dateRange.end) {
      return false;
    }
    
    // Tags filter - check if job has any of the selected tags
    if (filters.tags.length > 0) {
      if (!job.tags || !filters.tags.some(tag => job.tags?.includes(tag))) {
        return false;
      }
    }
    
    return true;
  });
  
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        // Toast notification removed - already shown in ScheduleJobModal
        // Refresh optimized jobs immediately
        refreshOptimized();
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
    setSelectedJobs(select ? filteredJobs.map(job => job.id) : []);
  };

  // Bulk action handlers with optimized refresh
  const handleBulkUpdateStatus = async (jobIds: string[], newStatus: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })));
      toast.success(`Updated ${jobIds.length} jobs to ${newStatus}`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to update job statuses');
    }
  };

  const handleBulkAssignTechnician = async (jobIds: string[], technicianId: string, technicianName: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })));
      toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to assign technician');
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    try {
      await Promise.all(jobIds.map(id => deleteJob(id)));
      toast.success(`Deleted ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to delete jobs');
    }
  };

  const handleBulkExport = (jobIds: string[], format: 'excel' | 'pdf' = 'excel') => {
    const selectedJobData = filteredJobs.filter(job => jobIds.includes(job.id));
    const exportData = selectedJobData.map(job => ({
      job_number: job.id?.substring(0, 8) || '',
      client_name: job.client?.name || '',
      title: job.title || '',
      status: job.status || '',
      scheduled_date: job.date || '',
      total_amount: job.revenue || 0,
      assigned_to: ''
    }));

    if (format === 'pdf') {
      exportToPDF(exportData, getJobExportColumns(), {
        title: 'Jobs Report',
        filename: 'fixlify-jobs-export'
      });
    } else {
      exportToExcel(exportData, getJobExportColumns(), {
        title: 'Jobs Report',
        filename: 'fixlify-jobs-export'
      });
    }

    toast.success(`Exported ${jobIds.length} jobs as ${format.toUpperCase()}`);
    setSelectedJobs([]);
  };

  const handleExportAll = (format: 'excel' | 'pdf') => {
    const exportData = filteredJobs.map(job => ({
      job_number: job.id?.substring(0, 8) || '',
      client_name: job.client?.name || '',
      title: job.title || '',
      status: job.status || '',
      scheduled_date: job.date || '',
      total_amount: job.revenue || 0,
      assigned_to: ''
    }));

    if (format === 'pdf') {
      exportToPDF(exportData, getJobExportColumns(), {
        title: 'All Jobs Report',
        filename: 'fixlify-all-jobs'
      });
    } else {
      exportToExcel(exportData, getJobExportColumns(), {
        title: 'All Jobs Report',
        filename: 'fixlify-all-jobs'
      });
    }

    toast.success(`Exported ${filteredJobs.length} jobs as ${format.toUpperCase()}`);
  };

  const handleBulkTagJobs = async (jobIds: string[], tags: string[]) => {
    try {
      await Promise.all(jobIds.map(id => {
        const job = filteredJobs.find(j => j.id === id);
        const existingTags = job?.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        return updateJob(id, { tags: newTags });
      }));
      toast.success(`Tagged ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      toast.error('Failed to tag jobs');
    }
  };

  const handleRefreshJobs = () => {
    if (hasOptimizedError) {
      clearOptimizedError();
    } else {
      refreshOptimized();
    }
    setSelectedJobs([]);
    toast.success('Jobs refreshed');
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
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <div className="space-y-6">
          <ModernCard variant="glass" className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <JobsFilters 
                onFiltersChange={setFilters} 
                filters={filters}
              />
              <div className="flex items-center gap-2 flex-wrap">
                {/* Real-time connection status */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm">
                  {realtimeConnected ? (
                    <>
                      <Wifi size={16} className="text-green-500" />
                      <span className="text-green-600">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={16} className="text-red-500" />
                      <span className="text-red-600">Offline</span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAll('pdf')}
                  className="flex gap-2 rounded-xl"
                  disabled={filteredJobs.length === 0}
                >
                  <Download size={18} />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAll('excel')}
                  className="flex gap-2 rounded-xl"
                  disabled={filteredJobs.length === 0}
                >
                  <FileSpreadsheet size={18} />
                  Excel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshJobs}
                  className="flex gap-2 rounded-xl"
                  disabled={isOptimizedLoading}
                >
                  <RefreshCw size={18} className={isOptimizedLoading ? "animate-spin" : ""} />
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
          
          <JobsList
            isGridView={isGridView}
            jobs={filteredJobs}
            selectedJobs={selectedJobs}
            onSelectJob={handleSelectJob}
            onSelectAllJobs={handleSelectAllJobs}
            onRefresh={handleRefreshJobs}
            searchTerm={filters.search}
          />
        </div>
      </AnimatedContainer>
      
      <BulkActionsBar
        selectedJobs={selectedJobs}
        onClearSelection={() => setSelectedJobs([])}
        onUpdateStatus={handleBulkUpdateStatus}
        onAssignTechnician={handleBulkAssignTechnician}
        onDeleteJobs={handleBulkDelete}
        onTagJobs={handleBulkTagJobs}
        onExport={handleBulkExport}
      />
      
      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        onJobCreated={handleJobCreated}
      />
    </PageLayout>
  );
};

export default JobsPage;
