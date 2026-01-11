import { FileText, Calendar, Tags, Paperclip, Settings2 } from "lucide-react";
import { CustomFieldsCard } from "./overview/CustomFieldsCard";
import { AttachmentsCard } from "./overview/AttachmentsCard";
import { useJobDetails } from "./context/JobDetailsContext";
import {
  SectionCard,
  JobDetailsSection,
  ScheduleEditSection,
  TagsTasksEditSection,
} from "./overview/sections";

interface JobOverviewProps {
  jobId: string;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  // Use shared context - real-time subscriptions handle updates automatically (no refetch needed)
  const { job, isLoading } = useJobDetails();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton matching the new layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border bg-card">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-20 bg-muted/50 animate-pulse rounded" />
                <div className="h-10 bg-muted/50 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="p-4">
            <div className="h-24 bg-muted/50 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-lg border bg-muted/20 p-6 text-center">
        <p className="text-muted-foreground font-medium">Job not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Row 1: Job Details (left) | Schedule (right) - matching Create Job modal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job Details Section */}
        <SectionCard icon={FileText} title="Job Details">
          <JobDetailsSection
            job={{
              id: job.id,
              description: job.description || undefined,
              job_type: job.job_type || undefined,
              lead_source: job.lead_source || undefined,
            }}
          />
        </SectionCard>

        {/* Schedule Section */}
        <SectionCard icon={Calendar} title="Schedule">
          <ScheduleEditSection
            job={{
              id: job.id,
              schedule_start: job.schedule_start,
              schedule_end: job.schedule_end,
              technician_id: job.technician_id,
              technician: job.technician,
            }}
          />
        </SectionCard>
      </div>

      {/* Row 2: Tags & Tasks - full width */}
      <SectionCard icon={Tags} title="Tags & Tasks">
        <TagsTasksEditSection
          jobId={jobId}
          tags={job.tags || []}
        />
      </SectionCard>

      {/* Row 3: Attachments | Custom Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard icon={Paperclip} title="Attachments">
          <AttachmentsCard jobId={jobId} embedded />
        </SectionCard>

        <SectionCard icon={Settings2} title="Custom Fields">
          <CustomFieldsCard jobId={jobId} embedded />
        </SectionCard>
      </div>
    </div>
  );
};
