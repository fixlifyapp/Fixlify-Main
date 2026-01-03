import React, { useState } from "react";
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
import {
  FileText,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Calendar,
  Tags as TagsIcon,
  Settings2,
  Loader2
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Import custom hooks and components
import { useScheduleJobForm } from "./modal/useScheduleJobForm";
import { useScheduleJobSubmit } from "./modal/useScheduleJobSubmit";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { JobInformationSection } from "./modal/JobInformationSection";
import { ScheduleSection } from "./modal/ScheduleSection";
import { TagsTasksSection } from "./modal/TagsTasksSection";
import { CustomFieldsSection } from "./modal/CustomFieldsSection";
import { JobTemplateManager } from "../jobs/templates/JobTemplateManager";
import { SectionCard } from "./modal/SectionCard";


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
  const [showTemplates, setShowTemplates] = useState(false);

  // Get company settings for defaults
  const { companySettings, isLoading: settingsLoading } = useCompanySettings();

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
    companySettings: formSettings,
    handleChange,
    handleSelectChange,
    handleTagToggle,
    handleAddTask,
    handleRemoveTask,
    handleCustomFieldChange,
    applyTemplate,
    resetForm,
    validateForm,
  } = useScheduleJobForm({ preselectedClientId, companySettings });

  const handleUseTemplate = (template: any) => {
    applyTemplate(template);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied`);
  };

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
    console.log("🎯 ScheduleJobModal onSubmit START");

    if (!validateForm()) {
      console.log("❌ ScheduleJobModal validation failed");
      toast.error("Please fill in all required fields");
      return;
    }
    console.log("✅ ScheduleJobModal validation passed, calling handleSubmit...");

    try {
      await handleSubmit(e);
      console.log("✅ ScheduleJobModal handleSubmit completed");
    } catch (error) {
      console.error("❌ ScheduleJobModal handleSubmit error:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill in job details and schedule for a technician.
          </DialogDescription>
        </DialogHeader>

        {formErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* Template Selection */}
          <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between mb-4"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Use a Job Template
                </span>
                {showTemplates ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mb-4">
              <JobTemplateManager onUseTemplate={handleUseTemplate} />
            </CollapsibleContent>
          </Collapsible>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Job Details */}
            <SectionCard icon={ClipboardList} title="Job Details">
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
            </SectionCard>

            {/* Right Column - Schedule */}
            <SectionCard icon={Calendar} title="Schedule">
              <ScheduleSection
                formData={formData}
                setFormData={setFormData}
                handleSelectChange={handleSelectChange}
                companySettings={companySettings}
              />
            </SectionCard>

            {/* Full Width - Tags and Tasks */}
            <SectionCard
              icon={TagsIcon}
              title="Tags & Tasks"
              className="lg:col-span-2"
            >
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
            </SectionCard>

            {/* Full Width - Custom Fields (only if fields exist) */}
            {customFields.length > 0 && (
              <SectionCard
                icon={Settings2}
                title="Custom Fields"
                className="lg:col-span-2"
              >
                <CustomFieldsSection
                  formData={formData}
                  customFields={customFields}
                  customFieldsLoading={customFieldsLoading}
                  handleCustomFieldChange={handleCustomFieldChange}
                />
              </SectionCard>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || clientsLoading || jobTypesLoading}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
