import { useNavigate } from "react-router-dom";
import { useJobDetails } from "./context/JobDetailsContext";
import { JobInfoSection } from "./header/JobInfoSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const JobDetailsHeader = () => {
  const { job, isLoading, updateJobStatus, currentStatus } = useJobDetails();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateJobStatus(newStatus);
    } catch (error) {
      console.error('JobDetailsHeader: Error updating job status:', error);
    }
  };

  const handleCopyJobId = () => {
    if (job?.id) {
      navigator.clipboard.writeText(job.id);
      toast.success('Job ID copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Job not found</p>
          <Button
            variant="outline"
            onClick={() => navigate('/jobs')}
            className="text-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/jobs')}
          className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>

        <div className="flex items-center gap-2">
          {/* Job ID Badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg cursor-pointer hover:bg-violet-100 transition-colors"
            onClick={handleCopyJobId}
            title="Click to copy Job ID"
          >
            <span className="text-sm font-mono font-semibold text-violet-700">{job.id}</span>
            <Copy className="h-3.5 w-3.5 text-violet-500" />
          </div>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                Print Job Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyJobId}>
                Copy Job ID
              </DropdownMenuItem>
              {job.client_id && (
                <DropdownMenuItem onClick={() => navigate(`/clients/${job.client_id}`)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Client
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Info Section */}
      <JobInfoSection
        job={{
          id: job.id,
          clientId: job.clientId || job.client_id || '',
          client: typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown Client',
          service: job.description || 'Service Job',
          address: job.address || '',
          phone: job.phone || '',
          email: job.email || '',
          total: job.total || job.revenue || 0
        }}
        status={currentStatus || job.status || 'scheduled'}
        onStatusChange={handleStatusChange}
        onEditClient={() => {
          if (job.clientId || job.client_id) {
            navigate(`/clients/${job.clientId || job.client_id}`);
          }
        }}
        clientName={typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown Client'}
        jobType={job.job_type || job.description || 'Service Job'}
        scheduleStart={job.schedule_start}
        scheduleEnd={job.schedule_end}
      />
    </div>
  );
};
