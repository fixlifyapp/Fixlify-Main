
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Edit, Calendar } from "lucide-react";
import { JobInfo } from "../context/types";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { ScheduleEditDialog } from "../dialogs/ScheduleEditDialog";

interface ScheduleInfoCardProps {
  job: JobInfo;
  jobId?: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const ScheduleInfoCard = ({ job, jobId, editable = false, onUpdate }: ScheduleInfoCardProps) => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { updateJob } = useJobs();

  const handleScheduleSave = async (startDate: string, endDate: string) => {
    if (!jobId) return;
    
    const result = await updateJob(jobId, {
      schedule_start: startDate,
      schedule_end: endDate
    });
    if (result) {
      toast.success("Schedule updated successfully");
      // Trigger real-time refresh
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </ModernCardTitle>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScheduleDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Start Date & Time</p>
              <p className="font-medium">{formatDateTime(job.schedule_start || "")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">End Date & Time</p>
              <p className="font-medium">{formatDateTime(job.schedule_end || "")}</p>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      <ScheduleEditDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        initialStartDate={job.schedule_start}
        initialEndDate={job.schedule_end}
        onSave={handleScheduleSave}
      />
    </>
  );
};
