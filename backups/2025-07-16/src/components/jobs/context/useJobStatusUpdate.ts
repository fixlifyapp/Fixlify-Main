
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

export const useJobStatusUpdate = (jobId: string, refreshJob: () => void) => {
  const { logStatusChange } = useJobHistoryIntegration(jobId);

  const updateJobStatus = async (newStatus: string, oldStatus?: string) => {
    if (!jobId) return;
    
    try {
      console.log('Updating job status:', { jobId, newStatus });
      
      // Get current status if not provided
      let currentStatus = oldStatus;
      if (!currentStatus) {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('status')
          .eq('id', jobId)
          .single();
        currentStatus = jobData?.status || 'unknown';
      }
      
      // Update job status in database
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
        
      if (error) {
        console.error("Error updating job status:", error);
        toast.error("Failed to update job status");
        return;
      }
      
      // Log the status change to job history
      await logStatusChange(currentStatus, newStatus);
      
      toast.success(`Job status updated to ${newStatus}`);
      
      // Refresh job data
      refreshJob();
      
    } catch (error) {
      console.error("Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
    }
  };

  return { updateJobStatus };
};
