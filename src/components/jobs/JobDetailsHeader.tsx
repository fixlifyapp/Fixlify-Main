import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobDetails } from "./context/JobDetailsContext";
import { PageHeader } from "@/components/ui/page-header";
import { JobInfoSection } from "./header/JobInfoSection";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, Calendar, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const JobDetailsHeader = () => {
  const { job, isLoading, updateJobStatus, currentStatus } = useJobDetails();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus: string) => {
    try {
      console.log('JobDetailsHeader: Initiating status change', { 
        currentStatus: job?.status, 
        newStatus,
        jobId: job?.id 
      });
      
      await updateJobStatus(newStatus);
      toast.success('Job status updated successfully');
    } catch (error) {
      console.error('JobDetailsHeader: Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 rounded-2xl border border-fixlyfy/20">
        <div className="relative z-10 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] flex items-center px-4 sm:px-6 lg:px-8">
          <div className="w-full py-4 sm:py-6 lg:py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 rounded-2xl border border-fixlyfy/20">
        <div className="relative z-10 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] flex items-center px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground w-full">
            Job not found
          </div>
        </div>
      </div>
    );
  }

  // Format badges based on job data
  const badges = [];
  const displayStatus = currentStatus || job.status;
  if (displayStatus) {
    badges.push({ 
      text: displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1), 
      icon: Clock, 
      variant: displayStatus === 'Completed' ? 'success' : displayStatus === 'New' ? 'info' : 'warning' as any
    });
  }
  if (job.total) {
    badges.push({ text: `$${job.total.toFixed(2)}`, icon: DollarSign, variant: 'fixlyfy' as any });
  }
  if (job.schedule_start) {
    badges.push({ 
      text: new Date(job.schedule_start).toLocaleDateString(), 
      icon: Calendar, 
      variant: 'info' as any 
    });
  }

  return (
    <>
      <PageHeader
        title={`Job ${job.id}`}
        subtitle="Job Details"
        icon={Wrench}
        badges={badges}
      />
      
      {/* Additional job info section below header */}
      <div className="mt-6">
        <JobInfoSection
          job={job}
          status={currentStatus || job.status || 'scheduled'}
          onStatusChange={handleStatusChange}
          onEditClient={() => {
            if (job.clientId) {
              navigate(`/clients/${job.clientId}`);
            }
          }}
          clientName={job.client || 'Unknown Client'}
          jobType={job.description || 'Service Job'}
        />
      </div>
    </>
  );
};