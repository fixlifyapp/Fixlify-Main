
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobInfo } from "../context/types";
import { useJobs } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useTechnicians";
import { toast } from "sonner";

interface TechnicianCardProps {
  job: JobInfo;
  jobId?: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const TechnicianCard = ({ job, jobId, editable = false, onUpdate }: TechnicianCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(job.technician_id || "unassigned");
  const { updateJob } = useJobs();
  const { technicians } = useTechnicians();

  const handleSave = async () => {
    if (!jobId) return;
    
    const result = await updateJob(jobId, {
      technician_id: editValue === "unassigned" ? null : editValue
    });
    if (result) {
      setIsEditing(false);
      toast.success("Technician assignment updated successfully");
      // Trigger real-time refresh
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
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={User}>
            Technician Assignment
          </ModernCardTitle>
          {editable && !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : editable && isEditing ? (
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
          ) : null}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Assigned Technician</p>
          {isEditing ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div>
              {job.technician_id ? (
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-600">
                  {getTechnicianName(job.technician_id)}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
                  Unassigned
                </Badge>
              )}
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
