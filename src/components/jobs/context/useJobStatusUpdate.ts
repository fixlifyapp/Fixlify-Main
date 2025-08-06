import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Track ongoing automations to prevent duplicates
const ongoingAutomations = new Set<string>();

export function useJobStatusUpdate(jobId?: string, refreshJob?: () => void) {

  const logStatusChange = async (oldStatus: string, newStatus: string) => {
    // Job history logging is handled by database triggers
    console.log(`📝 Status changed: ${oldStatus} → ${newStatus}`);
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
      
      // Normalize status to lowercase for consistency
      const normalizedNewStatus = newStatus.toLowerCase();
      
      // Update job status in database with normalized status
      const { data: updateData, error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: normalizedNewStatus,
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
      
      // Automation triggers are handled by the database trigger
      // The database trigger creates pending logs automatically
      // Start the automation processor to handle them
      console.log('📮 Database trigger will handle automation workflows');
      
      // Ensure automation processor is running
      import('@/services/automation-processor').then(({ automationProcessor }) => {
        automationProcessor.start();
      });
      
      // Refresh job data after a small delay to allow database triggers to complete
      setTimeout(() => {
        console.log('🔄 Refreshing job data...');
        if (refreshJob) {
          refreshJob();
        }
      }, 500);
      
    } catch (error) {
      console.error("❌ Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
      throw error;
    }
  };

  return { updateJobStatus };
}
