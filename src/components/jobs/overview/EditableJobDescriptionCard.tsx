
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, FileText, Loader2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

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
        // Real-time will handle the refresh automatically
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
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Description
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
        {isEditing ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter job description..."
            className="min-h-[100px] resize-none"
            autoFocus
            disabled={isSaving}
          />
        ) : (
          <div className={isSaving ? "opacity-70" : ""}>
            {displayValue ? (
              <p className="text-gray-700 leading-relaxed">{displayValue}</p>
            ) : (
              <p className="text-muted-foreground text-sm">No description provided. Click edit to add one.</p>
            )}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
