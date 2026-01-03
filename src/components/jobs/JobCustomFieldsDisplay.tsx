import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Edit2, Save, X, Settings } from "lucide-react";
import { toast } from "sonner";
import { ProfessionalCard, ProfessionalSectionHeader, ProfessionalEmptyState } from "@/components/ui/professional-card";

interface JobCustomFieldsDisplayProps {
  jobId: string;
}

export const JobCustomFieldsDisplay = ({ jobId }: JobCustomFieldsDisplayProps) => {
  const { 
    customFieldValues, 
    availableFields, 
    isLoading, 
    saveCustomFieldValues,
    refreshFields 
  } = useJobCustomFields(jobId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-500">Loading custom fields...</span>
      </div>
    );
  }

  if (availableFields.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic">No custom fields configured for jobs.</p>
    );
  }

  const handleEdit = () => {
    // Initialize edit values with current values
    const currentValues: Record<string, string> = {};
    availableFields.forEach(field => {
      const existingValue = customFieldValues.find(cfv => cfv.custom_field_id === field.id);
      currentValues[field.id] = existingValue?.value || field.default_value || '';
    });
    setEditValues(currentValues);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveCustomFieldValues(jobId, editValues);
      if (success) {
        setIsEditing(false);
        refreshFields();
        toast.success("Custom fields updated successfully");
      }
    } catch (error) {
      console.error("Error saving custom fields:", error);
      toast.error("Failed to save custom fields");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-slate-500 hover:text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableFields.map((field) => {
          const existingValue = customFieldValues.find(cfv => cfv.custom_field_id === field.id);
          const displayValue = isEditing
            ? editValues[field.id] || ''
            : existingValue?.value || field.default_value || '';

          if (isEditing) {
            return (
              <CustomFieldRenderer
                key={field.id}
                field={field}
                value={displayValue}
                onChange={(value) => setEditValues(prev => ({ ...prev, [field.id]: value }))}
              />
            );
          }

          // Display mode
          return (
            <div key={field.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </p>
              <p className="text-base font-medium text-slate-800">
                {displayValue || <span className="text-slate-400 italic">Not set</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
