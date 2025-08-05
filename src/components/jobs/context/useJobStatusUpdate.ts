import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

export const useJobStatusUpdate = (jobId: string, refreshJob: () => void) => {
  const { logStatusChange } = useJobHistoryIntegration(jobId);

  const triggerAutomationWorkflows = async (jobId: string, oldStatus: string, newStatus: string) => {
    try {
      console.log('🤖 Triggering automation workflows for status change:', { jobId, oldStatus, newStatus });
      
      // Get all pending automation logs for this job's status change
      const { data: pendingLogs, error: fetchError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .eq('trigger_type', 'job_status_changed')
        .filter('trigger_data->job->id', 'eq', jobId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        console.error('Error fetching pending automation logs:', fetchError);
        return;
      }

      if (!pendingLogs || pendingLogs.length === 0) {
        console.log('No pending automation logs found for this job');
        return;
      }

      console.log(`Found ${pendingLogs.length} pending automation logs to process`);

      // Process each pending automation log
      for (const log of pendingLogs) {
        try {
          console.log('Processing automation log:', log.id, 'for workflow:', log.workflow_id);
          
          // Call the automation executor edge function
          const { data, error } = await supabase.functions.invoke('automation-executor', {
            body: {
              workflowId: log.workflow_id,
              context: log.trigger_data
            }
          });

          if (error) {
            console.error('Error executing automation:', error);
            // Update log to failed
            await supabase
              .from('automation_execution_logs')
              .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: error.message
              })
              .eq('id', log.id);
          } else {
            console.log('Automation executed successfully:', data);
            // Update log to completed
            await supabase
              .from('automation_execution_logs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                actions_executed: data?.results || []
              })
              .eq('id', log.id);
          }
        } catch (err) {
          console.error('Error processing automation log:', err);
        }
      }
    } catch (error) {
      console.error('Error in triggerAutomationWorkflows:', error);
      // Don't throw - this shouldn't break the status update
    }
  };

  const updateJobStatus = async (newStatus: string, oldStatus?: string) => {
    console.log('🚀 useJobStatusUpdate: updateJobStatus called', { jobId, newStatus, oldStatus });
    
    if (!jobId) {
      console.error('❌ useJobStatusUpdate: No jobId provided for status update');
      toast.error('Cannot update status: Job ID is missing');
      return;
    }
    
    try {
      console.log('🔄 useJobStatusUpdate: Starting status update process:', { jobId, newStatus, oldStatus });
      
      // Get current status if not provided
      let currentStatus = oldStatus;
      if (!currentStatus) {
        const { data: jobData, error: fetchError } = await supabase
          .from('jobs')
          .select('status')
          .eq('id', jobId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching current status:', fetchError);
          toast.error('Failed to fetch current job status');
          throw fetchError;
        }
        
        currentStatus = jobData?.status || 'unknown';
      }
      
      // Normalize status for comparison
      const normalizedCurrent = currentStatus.toLowerCase().replace(/[\s_-]/g, '');
      const normalizedNew = newStatus.toLowerCase().replace(/[\s_-]/g, '');
      
      if (normalizedCurrent === normalizedNew) {
        console.log('📊 Status unchanged, skipping update');
        return;
      }
      
      console.log('📊 Current status:', currentStatus, '→ New status:', newStatus);
      
      // Update job status in database
      const { data: updateData, error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', jobId)
        .select('*')
        .single();
        
      if (updateError) {
        console.error("❌ Error updating job status:", updateError);
        toast.error(`Failed to update job status: ${updateError.message}`);
        throw updateError;
      }
      
      console.log('✅ Job status updated successfully:', updateData);
      
      // Log the status change to job history
      try {
        await logStatusChange(currentStatus, newStatus);
        console.log('📝 Status change logged to history');
      } catch (historyError) {
        console.error('⚠️ Error logging status change to history:', historyError);
        // Don't throw here - the status update was successful
      }
      
      toast.success(`Job status updated to ${newStatus}`);
      
      // Trigger automation workflows after a small delay to ensure database triggers have created the logs
      setTimeout(async () => {
        await triggerAutomationWorkflows(jobId, currentStatus, newStatus);
      }, 1000);
      
      // Refresh job data after a small delay to allow database triggers to complete
      setTimeout(() => {
        console.log('🔄 Refreshing job data...');
        refreshJob();
      }, 500);
      
    } catch (error) {
      console.error("❌ Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
      throw error;
    }
  };

  return { updateJobStatus };
};
