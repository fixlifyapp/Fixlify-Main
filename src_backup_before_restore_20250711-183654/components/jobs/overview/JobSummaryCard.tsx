
import React from "react";
import { EditableJobSummaryCard } from "./EditableJobSummaryCard";
import { JobInfo } from "../context/types";

interface JobSummaryCardProps {
  job: JobInfo;
  jobId?: string;
  editable?: boolean;
}

export const JobSummaryCard = ({ job, jobId, editable = false }: JobSummaryCardProps) => {
  if (editable && jobId) {
    return <EditableJobSummaryCard job={job} jobId={jobId} />;
  }

  // Fallback to simple display if not editable
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Job Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Job Type</p>
          <p className="font-medium">{job.service || job.job_type || "General Service"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Lead Source</p>
          <p className="font-medium">{job.lead_source || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};
