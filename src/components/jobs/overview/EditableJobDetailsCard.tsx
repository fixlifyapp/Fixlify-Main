import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, Calendar, Loader2, Clock } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { UnifiedJobTypeSelector } from "@/components/shared/UnifiedJobTypeSelector";
import { useUnifiedJobData } from "@/hooks/useUnifiedJobData";
import { toast } from "sonner";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";
import { format } from "date-fns";

interface EditableJobDetailsCardProps {
  scheduleStart?: string;
  scheduleEnd?: string;
  jobType?: string;
  jobId: string;
  onUpdate?: () => void;
}

export const EditableJobDetailsCard = ({
  scheduleStart,
  scheduleEnd,
  jobType,
  jobId,
  onUpdate
}: EditableJobDetailsCardProps) => {
  const { jobTypes, isLoading: jobTypesLoading } = useUnifiedJobData();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    schedule_start: scheduleStart ? scheduleStart.slice(0, 16) : "",
    schedule_end: scheduleEnd ? scheduleEnd.slice(0, 16) : "",
    job_type: jobType || "",
  });
  const [optimisticValues, setOptimisticValues] = useState({
    schedule_start: scheduleStart || "",
    schedule_end: scheduleEnd || "",
    job_type: jobType || "",
  });
  const { updateJob } = useJobs();

  const handleSave = async () => {
    setIsSaving(true);

    // Optimistic update
    setOptimisticValues({
      schedule_start: editValues.schedule_start,
      schedule_end: editValues.schedule_end,
      job_type: editValues.job_type,
    });
    setIsEditing(false);

    try {
      const result = await updateJob(jobId, {
        schedule_start: editValues.schedule_start || null,
        schedule_end: editValues.schedule_end || null,
        job_type: editValues.job_type || null,
      });
      if (result) {
        toast.success("Job details updated successfully");
        onUpdate?.();
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticValues({
        schedule_start: scheduleStart || "",
        schedule_end: scheduleEnd || "",
        job_type: jobType || "",
      });
      setEditValues({
        schedule_start: scheduleStart ? scheduleStart.slice(0, 16) : "",
        schedule_end: scheduleEnd ? scheduleEnd.slice(0, 16) : "",
        job_type: jobType || "",
      });
      setIsEditing(true);
      toast.error("Failed to update job details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValues({
      schedule_start: scheduleStart ? scheduleStart.slice(0, 16) : "",
      schedule_end: scheduleEnd ? scheduleEnd.slice(0, 16) : "",
      job_type: jobType || "",
    });
    setIsEditing(false);
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateStr;
    }
  };

  return (
    <ProfessionalCard>
      <ProfessionalSectionHeader
        icon={Calendar}
        title="Schedule Details"
        subtitle={isSaving ? "Saving..." : undefined}
        action={
          !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              disabled={isSaving}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      />

      <div className={`space-y-4 ${isSaving ? "opacity-70" : ""}`}>
        {isEditing ? (
          <div className="space-y-4">
            <UnifiedJobTypeSelector
              value={editValues.job_type}
              onValueChange={(value) => setEditValues(prev => ({ ...prev, job_type: value }))}
              jobTypes={jobTypes}
              isLoading={jobTypesLoading}
              label="Job Type"
              className="w-full"
              showManageLink={false}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule_start" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Scheduled Start
                </Label>
                <Input
                  id="schedule_start"
                  type="datetime-local"
                  value={editValues.schedule_start}
                  onChange={(e) => setEditValues(prev => ({ ...prev, schedule_start: e.target.value }))}
                  disabled={isSaving}
                  className="border-slate-200 focus:border-slate-400 focus:ring-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule_end" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Scheduled End
                </Label>
                <Input
                  id="schedule_end"
                  type="datetime-local"
                  value={editValues.schedule_end}
                  onChange={(e) => setEditValues(prev => ({ ...prev, schedule_end: e.target.value }))}
                  disabled={isSaving}
                  className="border-slate-200 focus:border-slate-400 focus:ring-slate-300"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {optimisticValues.job_type && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Job Type</p>
                <p className="text-sm font-medium text-slate-700">
                  {optimisticValues.job_type}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {optimisticValues.schedule_start && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Start</p>
                  </div>
                  <p className="text-sm font-medium text-blue-800">
                    {formatDateTime(optimisticValues.schedule_start)}
                  </p>
                </div>
              )}

              {optimisticValues.schedule_end && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">End</p>
                  </div>
                  <p className="text-sm font-medium text-emerald-800">
                    {formatDateTime(optimisticValues.schedule_end)}
                  </p>
                </div>
              )}

              {!optimisticValues.schedule_start && !optimisticValues.schedule_end && (
                <div className="col-span-2">
                  <p className="text-sm text-slate-400 italic">No schedule set</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProfessionalCard>
  );
};
