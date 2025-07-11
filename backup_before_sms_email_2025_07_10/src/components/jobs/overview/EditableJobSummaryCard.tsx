
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, FileText } from "lucide-react";
import { JobInfo } from "../context/types";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { LeadSourceSelectionDialog } from "../dialogs/LeadSourceSelectionDialog";
import { JobTypeSelectionDialog } from "../dialogs/JobTypeSelectionDialog";

interface EditableJobSummaryCardProps {
  job: JobInfo;
  jobId: string;
}

export const EditableJobSummaryCard = ({ job, jobId }: EditableJobSummaryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLeadSourceDialogOpen, setIsLeadSourceDialogOpen] = useState(false);
  const [isJobTypeDialogOpen, setIsJobTypeDialogOpen] = useState(false);
  
  // Use the actual job_type from the database, not service
  const [editValues, setEditValues] = useState({
    service: job.job_type || job.service || "General Service",
    lead_source: job.lead_source || ""
  });
  
  const { updateJob } = useJobs();

  // Update editValues when job data changes
  React.useEffect(() => {
    setEditValues({
      service: job.job_type || job.service || "General Service",
      lead_source: job.lead_source || ""
    });
  }, [job.job_type, job.service, job.lead_source]);

  const handleSave = async () => {
    const result = await updateJob(jobId, {
      job_type: editValues.service,
      service: editValues.service, // Keep both for backwards compatibility
      lead_source: editValues.lead_source
    });
    if (result) {
      setIsEditing(false);
      toast.success("Job summary updated successfully");
    }
  };

  const handleCancel = () => {
    setEditValues({
      service: job.job_type || job.service || "General Service",
      lead_source: job.lead_source || ""
    });
    setIsEditing(false);
  };

  const handleLeadSourceSave = (source: string) => {
    setEditValues(prev => ({ ...prev, lead_source: source }));
  };

  const handleJobTypeSave = (type: string) => {
    setEditValues(prev => ({ ...prev, service: type }));
  };

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText}>
              Job Summary
            </ModernCardTitle>
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Job Type</p>
              {isEditing ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsJobTypeDialogOpen(true)}
                >
                  {editValues.service || "Select job type..."}
                </Button>
              ) : (
                <p className="font-medium">{job.job_type || job.service || "General Service"}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Lead Source</p>
              {isEditing ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsLeadSourceDialogOpen(true)}
                >
                  {editValues.lead_source || "Select lead source..."}
                </Button>
              ) : (
                <p className="font-medium">{job.lead_source || "Not specified"}</p>
              )}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      <LeadSourceSelectionDialog
        open={isLeadSourceDialogOpen}
        onOpenChange={setIsLeadSourceDialogOpen}
        initialSource={editValues.lead_source}
        onSave={handleLeadSourceSave}
      />

      <JobTypeSelectionDialog
        open={isJobTypeDialogOpen}
        onOpenChange={setIsJobTypeDialogOpen}
        initialType={editValues.service}
        onSave={handleJobTypeSave}
      />
    </>
  );
};
