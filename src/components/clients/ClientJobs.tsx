import { useState, useCallback, useMemo, useEffect } from "react";
import { useJobsOptimized } from "@/hooks/useJobsOptimized";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ScheduleJobModal } from "../schedule/ScheduleJobModal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DeleteJobsDialog } from "../jobs/dialogs/DeleteJobsDialog";
import { BulkActionsBar } from "../jobs/BulkActionsBar";
import { JobsListOptimized } from "../jobs/JobsListOptimized";
import { useJobs } from "@/hooks/useJobs";
import { debugJobsLoading } from "@/utils/jobsDebug";
import { useOrganizationContext } from "@/hooks/use-organization-context";

interface ClientJobsProps {
  clientId?: string;
}

export const ClientJobs = ({ clientId }: ClientJobsProps) => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  console.log('🎯 ClientJobs component - clientId:', clientId);
  
  // Ensure organization context is set
  const { organizationId } = useOrganizationContext();
  
  // Use optimized hook with request deduplication
  const {
    jobs: optimizedJobs,
    isLoading: isOptimizedLoading,
    refreshJobs: refreshOptimized,
    canCreate,
    canEdit,
    canDelete,
    hasError,
    clearError
  } = useJobsOptimized({
    clientId,
    page: 1,
    pageSize: 100,
    enableRealtime: true
  });

  // Keep original hook for mutations only
  const { addJob, updateJob, deleteJob } = useJobs();
  
  const navigate = useNavigate();

  // Auto-debug if no jobs loaded after initial load
  useEffect(() => {
    if (!isOptimizedLoading && optimizedJobs.length === 0 && clientId) {
      console.log('⚠️ No jobs found for client, running debug...');
      console.log('📍 Organization context:', { organizationId });
      debugJobsLoading(clientId);
    }
  }, [isOptimizedLoading, optimizedJobs.length, clientId, organizationId]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleJobCreated = useCallback(async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully!`);
        refreshOptimized();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  }, [addJob, refreshOptimized]);

  const handleJobSuccess = useCallback((job: any) => {
    toast.success("Job created successfully!");
    refreshOptimized();
  }, [refreshOptimized]);

  const handleSelectJob = useCallback((jobId: string, isSelected: boolean) => {
    setSelectedJobs(prev => 
      isSelected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  }, []);

  const handleSelectAllJobs = useCallback((isSelected: boolean) => {
    setSelectedJobs(isSelected ? optimizedJobs.map(job => job.id) : []);
  }, [optimizedJobs]);

  const handleClearSelection = useCallback(() => {
    setSelectedJobs([]);
  }, []);

  const handleBulkDelete = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteSuccess = useCallback(async () => {
    setSelectedJobs([]);
    toast.success(`Deleted ${selectedJobs.length} jobs successfully`);
    refreshOptimized();
    window.dispatchEvent(new CustomEvent('clientsRefresh'));
  }, [selectedJobs.length, refreshOptimized]);

  // Bulk action handlers with optimized refresh
  const handleUpdateJobsStatus = useCallback(async (jobIds: string[], newStatus: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { status: newStatus })));
      toast.success(`Updated ${jobIds.length} jobs to "${newStatus}"`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      console.error("Failed to update jobs status:", error);
      toast.error("Failed to update job status");
    }
  }, [updateJob, refreshOptimized]);

  const handleAssignTechnician = useCallback(async (jobIds: string[], technicianId: string, technicianName: string) => {
    try {
      await Promise.all(jobIds.map(id => updateJob(id, { technician_id: technicianId })));
      toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      console.error("Failed to assign technician:", error);
      toast.error("Failed to assign technician");
    }
  }, [updateJob, refreshOptimized]);

  const handleDeleteJobs = useCallback(async (jobIds: string[]) => {
    try {
      await Promise.all(jobIds.map(id => deleteJob(id)));
      toast.success(`Deleted ${jobIds.length} jobs`);
      setSelectedJobs([]);
      refreshOptimized();
      window.dispatchEvent(new CustomEvent('clientsRefresh'));
    } catch (error) {
      console.error("Failed to delete jobs:", error);
      toast.error("Failed to delete jobs");
    }
  }, [deleteJob, refreshOptimized]);

  const handleTagJobs = useCallback(async (jobIds: string[], tags: string[]) => {
    try {
      await Promise.all(jobIds.map(id => {
        const job = optimizedJobs.find(j => j.id === id);
        if (!job) return Promise.resolve(null);
        
        const existingTags = job.tags || [];
        const updatedTags = [...new Set([...existingTags, ...tags])];
        
        return updateJob(id, { tags: updatedTags });
      }));
      toast.success(`Tagged ${jobIds.length} jobs with ${tags.length} tags`);
      setSelectedJobs([]);
      refreshOptimized();
    } catch (error) {
      console.error("Failed to tag jobs:", error);
      toast.error("Failed to tag jobs");
    }
  }, [updateJob, optimizedJobs, refreshOptimized]);

  const handleMarkAsPaid = useCallback((jobIds: string[], paymentMethod: string) => {
    toast.success(`Marked ${jobIds.length} jobs as paid via ${paymentMethod}`);
    setSelectedJobs([]);
  }, []);

  const handleExportJobs = useCallback((jobIds: string[]) => {
    const selectedJobData = optimizedJobs.filter(job => jobIds.includes(job.id));
    const csvData = selectedJobData.map(job => ({
      'Job ID': job.id,
      'Title': job.title || '',
      'Status': job.status,
      'Type': job.job_type || job.service || '',
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
    a.download = `client-jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${jobIds.length} jobs`);
    setSelectedJobs([]);
  }, [optimizedJobs]);

  if (isOptimizedLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin mr-2" />
        <span>Loading jobs...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 mb-4">Failed to load jobs. Please try again.</p>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={clearError}
          >
            Retry
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => debugJobsLoading(clientId)}
          >
            Debug
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Jobs</h2>
        <div className="flex items-center gap-2">
          {selectedJobs.length > 0 && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
              >
                Clear ({selectedJobs.length})
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Selected
              </Button>
            </>
          )}
          <Button 
            onClick={() => setIsCreateJobModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus size={16} className="mr-2" />
            Create New Job
          </Button>
        </div>
      </div>

      {selectedJobs.length > 0 && (
        <BulkActionsBar 
          selectedJobs={selectedJobs} 
          onClearSelection={handleClearSelection} 
          onUpdateStatus={handleUpdateJobsStatus}
          onAssignTechnician={handleAssignTechnician}
          onDeleteJobs={handleDeleteJobs}
          onTagJobs={handleTagJobs}
          onMarkAsPaid={handleMarkAsPaid}
          onExport={handleExportJobs}
        />
      )}

      {optimizedJobs.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg border border-border">
          <p className="text-muted-foreground">No jobs found for this client.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsCreateJobModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Create First Job
          </Button>
        </div>
      ) : (
        <JobsListOptimized
          jobs={optimizedJobs}
          isGridView={true}
          selectedJobs={selectedJobs}
          onSelectJob={handleSelectJob}
          onSelectAllJobs={handleSelectAllJobs}
          onRefresh={refreshOptimized}
        />
      )}

      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={clientId}
        onJobCreated={handleJobCreated}
        onSuccess={handleJobSuccess}
      />

      <DeleteJobsDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedJobs={selectedJobs}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};
