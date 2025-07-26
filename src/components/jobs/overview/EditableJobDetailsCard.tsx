import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, FileText, Loader2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { UnifiedJobTypeSelector } from "@/components/shared/UnifiedJobTypeSelector";
import { useUnifiedJobData } from "@/hooks/useUnifiedJobData";
import { toast } from "sonner";

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
      });
      setEditValues({
        schedule_start: scheduleStart ? scheduleStart.slice(0, 16) : "",
        schedule_end: scheduleEnd ? scheduleEnd.slice(0, 16) : "",
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
    });
    setIsEditing(false);
  };

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={FileText}>
            Schedule Details
            {isSaving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          </ModernCardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
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
                className="text-green-600 hover:text-green-700"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-600"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
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
                  <Label htmlFor="schedule_start">Scheduled Start</Label>
                  <Input
                    id="schedule_start"
                    type="datetime-local"
                    value={editValues.schedule_start}
                    onChange={(e) => setEditValues(prev => ({ ...prev, schedule_start: e.target.value }))}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schedule_end">Scheduled End</Label>
                  <Input
                    id="schedule_end"
                    type="datetime-local"
                    value={editValues.schedule_end}
                    onChange={(e) => setEditValues(prev => ({ ...prev, schedule_end: e.target.value }))}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {optimisticValues.job_type && (
                <div>
                  <h4 className="font-medium mb-1">Job Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {optimisticValues.job_type}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {optimisticValues.schedule_start && (
                  <div>
                    <h4 className="font-medium mb-1">Scheduled Start</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(optimisticValues.schedule_start).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {optimisticValues.schedule_end && (
                  <div>
                    <h4 className="font-medium mb-1">Scheduled End</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(optimisticValues.schedule_end).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {!optimisticValues.schedule_start && !optimisticValues.schedule_end && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">No schedule set</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};