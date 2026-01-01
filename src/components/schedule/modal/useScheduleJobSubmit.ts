import { useState, useRef } from "react";
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
  const isCreatingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // IMMEDIATE sync log - should appear no matter what
    console.log("=== HANDLESUBMIT v2 START ===", new Date().toISOString());

    e.preventDefault();
    console.log("🔥🔥🔥 useScheduleJobSubmit.handleSubmit ENTERED 🔥🔥🔥");

    // Prevent double submission
    if (isCreatingRef.current || isSubmitting) {
      console.log("⚠️ Job creation already in progress, ignoring duplicate submission");
      return;
    }

    isCreatingRef.current = true;
    console.log("🔥 isCreatingRef set to true");

    console.log("🚀 Form submission started with data:", formData);
    console.log("📋 Available clients:", clients.length);
    console.log("🔧 Custom fields:", Object.keys(formData.customFields).length);

    console.log("🔥 About to setIsSubmitting(true)");
    setIsSubmitting(true);
    console.log("🔥 setIsSubmitting(true) called");

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
        status: 'New',
        revenue: 0,
        tags: formData.tags,
        tasks: formData.tasks
      };

      console.log("📤 Submitting job data:", jobData);
      console.log("📊 Job data size:", JSON.stringify(jobData).length, "characters");

      if (onJobCreated) {
        console.log("🔥 About to call onJobCreated...");
        const createdJob = await onJobCreated(jobData);
        console.log("🔥 onJobCreated returned:", createdJob);
        
        if (createdJob) {
          console.log("Job created successfully:", createdJob);
          
          // Import supabase client once
          const { supabase } = await import("@/integrations/supabase/client");
          
          // Create job overview entry with lead source and property information
          try {
            const selectedClient = clients.find(c => c.id === formData.client_id);
            
            const overviewData = {
              job_id: createdJob.id,
              property_type: formData.property_type || selectedClient?.type || 'Residential',
              property_age: formData.property_age || undefined,
              property_size: formData.property_size || undefined,
              previous_service_date: formData.previous_service_date || undefined,
              lead_source: formData.lead_source || 'Direct',
              emergency_contact: {},
              billing_contact: {},
              warranty_info: {},
            };
            
            await supabase
              .from('job_overview')
              .upsert(overviewData, { onConflict: 'job_id' });
              
            console.log("Job overview created successfully");
          } catch (error) {
            console.warn("Failed to create job overview:", error);
          }
          
          // Save custom field values if any
          if (Object.keys(formData.customFields).length > 0) {
            try {
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
      console.error("❌ Error creating job:", error);
      console.error("❌ Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create job: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      isCreatingRef.current = false;
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};
 