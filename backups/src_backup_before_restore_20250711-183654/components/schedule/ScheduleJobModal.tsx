import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import custom hooks and components
import { useScheduleJobForm } from "./modal/useScheduleJobForm";
import { useScheduleJobSubmit } from "./modal/useScheduleJobSubmit";
import { JobInformationSection } from "./modal/JobInformationSection";
import { ScheduleSection } from "./modal/ScheduleSection";
import { TagsTasksSection } from "./modal/TagsTasksSection";
import { CustomFieldsSection } from "./modal/CustomFieldsSection";

interface ScheduleJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => Promise<any>;
  onSuccess?: (job: any) => void;
  preselectedClientId?: string;
}

export const ScheduleJobModal = ({ 
  open, 
  onOpenChange, 
  onJobCreated, 
  onSuccess, 
  preselectedClientId 
}: ScheduleJobModalProps) => {
  const {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    newTask,
    setNewTask,
    clients,
    clientsLoading,
    jobTypes,
    jobTypesLoading,
    leadSources,
    leadSourcesLoading,
    tags,
    tagsLoading,
    customFields,
    customFieldsLoading,
    clientProperties,
    propertiesLoading,
    handleChange,
    handleSelectChange,
    handleTagToggle,
    handleAddTask,
    handleRemoveTask,
    handleCustomFieldChange,
    resetForm,
    validateForm,
  } = useScheduleJobForm({ preselectedClientId });

  const { isSubmitting, handleSubmit } = useScheduleJobSubmit({
    formData,
    clients,
    customFields,
    onJobCreated,
    onSuccess,
    onOpenChange,
    resetForm,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    await handleSubmit(e);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a comprehensive job with all details and schedule it for a technician.
          </DialogDescription>
        </DialogHeader>
        
        {formErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <ul className="text-sm text-red-600 space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <JobInformationSection
              formData={formData}
              clients={clients}
              clientsLoading={clientsLoading}
              clientProperties={clientProperties}
              propertiesLoading={propertiesLoading}
              jobTypes={jobTypes}
              jobTypesLoading={jobTypesLoading}
              leadSources={leadSources}
              leadSourcesLoading={leadSourcesLoading}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
            />

            {/* Schedule Information */}
            <ScheduleSection
              formData={formData}
              setFormData={setFormData}
              handleSelectChange={handleSelectChange}
            />

            {/* Tags and Tasks */}
            <TagsTasksSection
              formData={formData}
              tags={tags}
              tagsLoading={tagsLoading}
              newTask={newTask}
              setNewTask={setNewTask}
              handleTagToggle={handleTagToggle}
              handleAddTask={handleAddTask}
              handleRemoveTask={handleRemoveTask}
            />

            {/* Custom Fields */}
            <CustomFieldsSection
              formData={formData}
              customFields={customFields}
              customFieldsLoading={customFieldsLoading}
              handleCustomFieldChange={handleCustomFieldChange}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
