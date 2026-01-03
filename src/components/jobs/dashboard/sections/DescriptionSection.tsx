import { useState } from "react";
import { SectionCard, SectionHeader } from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DescriptionSectionProps {
  description: string;
  onSave?: (description: string) => Promise<void>;
  editable?: boolean;
}

export const DescriptionSection = ({
  description,
  onSave,
  editable = true
}: DescriptionSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(editedDescription);
      setIsEditing(false);
      toast.success("Description updated");
    } catch (error) {
      toast.error("Failed to update description");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDescription(description);
    setIsEditing(false);
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={FileText}
        title="Description"
        action={
          editable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 text-xs text-slate-500 hover:text-slate-700"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )
        }
      />

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Enter job description..."
            className="min-h-[100px] text-sm resize-none border-slate-200 focus:border-slate-300 focus:ring-slate-200"
            disabled={isSaving}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 text-xs bg-slate-900 hover:bg-slate-800"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          {description ? (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No description provided
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
};
