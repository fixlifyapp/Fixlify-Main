import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to trigger automations when job events occur
 */
export const useAutomationTrigger = () => {
  
  /**
   * Trigger automation for job status change
   */
  const triggerJobStatusChange = async (jobId: string, oldStatus: string, newStatus: string) => {
    try {
      console.log(`Triggering automation for job ${jobId} status change: ${oldStatus} -> ${newStatus}`);
      
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*, client:clients(*)')
        .eq('id', jobId)
        .single();
        
      if (jobError || !job) {
        console.error('Error fetching job:', jobError);
        return;
      }
      
      // Check for matching automation workflows
      const { data: workflows, error: workflowError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('trigger_type', 'job_status_changed')
        .eq('is_active', true)
        .eq('user_id', job.user_id);
        
      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
        return;
      }
      
      // Process each matching workflow
      for (const workflow of workflows || []) {
        // Check if the status change matches the trigger conditions
        const triggerConfig = workflow.trigger_config as any;
        if (triggerConfig?.conditions) {
          const statusCondition = triggerConfig.conditions.find((c: any) => c.field === 'status');
          if (statusCondition && statusCondition.value.toLowerCase() !== newStatus.toLowerCase()) {
            continue; // Skip this workflow
          }
        }
        
        console.log(`Executing workflow ${workflow.id} for job status change`);
        
        // Call the automation executor edge function directly
        const { data, error } = await supabase.functions.invoke('automation-executor', {
          body: {
            workflowId: workflow.id,
            context: {
              triggerType: 'job_status_changed',
              job_id: jobId,
              jobId: jobId,
              job: {
                ...job,
                oldStatus,
                status: newStatus
              },
              client: job.client,
              userId: job.user_id
            }
          }
        });
        
        if (error) {
          console.error('Error executing automation:', error);
        } else {
          console.log('Automation executed successfully:', data);
        }
      }
    } catch (error) {
      console.error('Error in triggerJobStatusChange:', error);
    }
  };
  
  /**
   * Trigger automation for job creation
   */
  const triggerJobCreated = async (jobId: string) => {
    try {
      console.log(`Triggering automation for new job ${jobId}`);
      
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*, client:clients(*)')
        .eq('id', jobId)
        .single();
        
      if (jobError || !job) {
        console.error('Error fetching job:', jobError);
        return;
      }
      
      // Check for matching automation workflows
      const { data: workflows, error: workflowError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('trigger_type', 'job_created')
        .eq('is_active', true)
        .eq('user_id', job.user_id);
        
      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
        return;
      }
      
      // Process each matching workflow
      for (const workflow of workflows || []) {
        console.log(`Executing workflow ${workflow.id} for job creation`);
        
        // Call the automation executor edge function directly
        const { data, error } = await supabase.functions.invoke('automation-executor', {
          body: {
            workflowId: workflow.id,
            context: {
              triggerType: 'job_created',
              job_id: jobId,
              jobId: jobId,
              job: job,
              client: job.client,
              userId: job.user_id
            }
          }
        });
        
        if (error) {
          console.error('Error executing automation:', error);
        } else {
          console.log('Automation executed successfully:', data);
        }
      }
    } catch (error) {
      console.error('Error in triggerJobCreated:', error);
    }
  };
  
  return {
    triggerJobStatusChange,
    triggerJobCreated
  };
};
