import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Briefcase, AlertCircle } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 border-b">
          {/* Background blur elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-fixlyfy/20 to-fixlyfy-light/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-fixlyfy-light/20 to-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-xl shadow-md">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-fixlyfy">Create New Job</h2>
                <p className="text-sm text-muted-foreground">
                  Schedule a job with all details for a technician
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          {formErrors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 text-sm">Please fix the following:</p>
                <ul className="text-sm text-red-600 mt-1 space-y-0.5">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form id="create-job-form" onSubmit={onSubmit}>
            <div className="space-y-6">
              {/* Job Information Section */}
              <JobInformationSection
                formData={formData}
                setFormData={setFormData}
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

              {/* Schedule Section */}
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
          </form>
        </div>

        {/* Footer with gradient button */}
        <DialogFooter className="border-t bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-job-form"
            disabled={isSubmitting}
            className="px-6 bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy/90 hover:to-fixlyfy-light/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isSubmitting ? "Creating..." : "Create Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
