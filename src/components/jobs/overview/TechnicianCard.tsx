import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, User, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobInfo } from "../context/types";
import { useJobs } from "@/hooks/useJobs";
import { UnifiedTechnicianSelector } from "@/components/shared/UnifiedTechnicianSelector";
import { useUnifiedJobData } from "@/hooks/useUnifiedJobData";
import { toast } from "sonner";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

interface TechnicianCardProps {
  job: JobInfo;
  jobId?: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const TechnicianCard = ({ job, jobId, editable = false, onUpdate }: TechnicianCardProps) => {
  const { technicians, isLoading: techniciansLoading } = useUnifiedJobData();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(job.technician_id || "unassigned");
  const { updateJob } = useJobs();

  const handleSave = async () => {
    if (!jobId) return;

    const result = await updateJob(jobId, {
      technician_id: editValue === "unassigned" ? null : editValue
    });
    if (result) {
      setIsEditing(false);
      toast.success("Technician assignment updated successfully");
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  const handleCancel = () => {
    setEditValue(job.technician_id || "unassigned");
    setIsEditing(false);
  };

  const getTechnicianName = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? tech.name : "Unknown Technician";
  };

  return (
    <ProfessionalCard>
      <ProfessionalSectionHeader
        icon={User}
        title="Technician"
        action={
          editable && !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : editable && isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        }
      />

      <div>
        {isEditing ? (
          <UnifiedTechnicianSelector
            value={editValue}
            onValueChange={setEditValue}
            technicians={technicians}
            isLoading={techniciansLoading}
            label=""
            className="w-full"
            showManageLink={false}
          />
        ) : (
          <div className="flex items-center gap-3">
            {job.technician_id ? (
              <>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {getTechnicianName(job.technician_id)}
                  </p>
                  <p className="text-xs text-slate-500">Assigned technician</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Unassigned</p>
                  <p className="text-xs text-slate-400">No technician assigned</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ProfessionalCard>
  );
};
