import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, FileText, Loader2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

interface EditableJobDescriptionCardProps {
  description: string;
  jobId: string;
  onUpdate?: () => void;
}

export const EditableJobDescriptionCard = ({ description, jobId, onUpdate }: EditableJobDescriptionCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState(description || "");
  const { updateJob } = useJobs();

  const handleSave = async () => {
    setIsSaving(true);

    // Optimistic update
    setOptimisticValue(editValue);
    setIsEditing(false);

    try {
      const result = await updateJob(jobId, { description: editValue });
      if (result) {
        toast.success("Job description updated successfully");
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticValue(description);
      setEditValue(description);
      setIsEditing(true);
      toast.error("Failed to update job description");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(description || "");
    setIsEditing(false);
  };

  // Use optimistic value for display, fall back to props
  const displayValue = optimisticValue || description;

  return (
    <ProfessionalCard>
      <ProfessionalSectionHeader
        icon={FileText}
        title="Job Description"
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
                className="text-slate-500 hover:text-slate-600 hover:bg-slate-100"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      />

      {isEditing ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Enter job description..."
          className="min-h-[120px] resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-300 rounded-xl text-sm"
          autoFocus
          disabled={isSaving}
        />
      ) : (
        <div className={isSaving ? "opacity-70" : ""}>
          {displayValue ? (
            <p className="text-slate-700 leading-relaxed text-sm">{displayValue}</p>
          ) : (
            <p className="text-slate-400 text-sm italic">No description provided. Click edit to add one.</p>
          )}
        </div>
      )}
    </ProfessionalCard>
  );
};
