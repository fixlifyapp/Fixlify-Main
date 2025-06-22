import { useState } from "react";
import { toast } from "sonner";
import { FormData } from "./useScheduleJobForm";

interface UseScheduleJobSubmitProps {
  formData: FormData;
  clients: any[];
  customFields: any[];
  onJobCreated?: (job: any) => Promise<any>;
  onSuccess?: (job: any) => void;
  onOpenChange: (open: boolean) => void;
  resetForm: () => void;
}

export const useScheduleJobSubmit = ({
  formData,
  clients,
  customFields,
  onJobCreated,
  onSuccess,
  onOpenChange,
  resetForm,
}: UseScheduleJobSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission started with data:", formData);
    
    setIsSubmitting(true);
    
    try {
      // Get selected client info
      const selectedClient = clients.find(c => c.id === formData.client_id);
      if (!selectedClient) {
        throw new Error("Selected client not found");
      }

      // Calculate schedule_end if not set but schedule_start exists
      let scheduleEnd = formData.schedule_end;
      if (formData.schedule_start && !scheduleEnd) {
        const startDate = new Date(formData.schedule_start);
        const endDate = new Date(startDate.getTime() + parseInt(formData.duration) * 60000);
        scheduleEnd = endDate.toISOString();
      }

      // Auto-generate title based on client and job type
      const autoTitle = `${selectedClient.name} - ${formData.job_type || 'General Service'}`;

      // Prepare comprehensive job data
      const jobData = {
        title: autoTitle,
        client_id: formData.client_id,
        property_id: formData.property_id || undefined,
        description: formData.description,
        job_type: formData.job_type || 'General Service',
        lead_source: formData.lead_source || 'Direct',
        date: formData.schedule_start || new Date().toISOString(),
        schedule_start: formData.schedule_start || undefined,
        schedule_end: scheduleEnd || undefined,
        technician_id: formData.technician_id || undefined,
        status: 'scheduled',
        revenue: 0,
        tags: formData.tags,
        tasks: formData.tasks
      };

      console.log("Submitting job data:", jobData);

      if (onJobCreated) {
        const createdJob = await onJobCreated(jobData);
        
        if (createdJob) {
          console.log("Job created successfully:", createdJob);
          
          // Save custom field values if any
          if (Object.keys(formData.customFields).length > 0) {
            try {
              const { supabase } = await import("@/integrations/supabase/client");
              
              const customFieldPromises = Object.entries(formData.customFields).map(
                ([fieldId, value]) => {
                  if (value.trim()) {
                    return supabase
                      .from('job_custom_field_values')
                      .upsert({
                        job_id: createdJob.id,
                        custom_field_id: fieldId,
                        value: value
                      });
                  }
                  return Promise.resolve();
                }
              );
              
              await Promise.all(customFieldPromises);
              console.log("Custom fields saved successfully");
            } catch (error) {
              console.warn("Failed to save custom fields:", error);
            }
          }

          toast.success(`Job ${createdJob.id} created successfully!`);
          
          if (onSuccess) {
            onSuccess(createdJob);
          }
        }
        
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error("Job creation function not available");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create job: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
}; 