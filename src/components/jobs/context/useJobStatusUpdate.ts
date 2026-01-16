import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AutomationService } from '@/services/automationService';
import { recordStatusChange } from '@/services/jobHistoryService';
import { useRBAC } from '@/components/auth/RBACProvider';

// Track ongoing automations to prevent duplicates
const ongoingAutomations = new Set<string>();

export function useJobStatusUpdate(jobId?: string, refreshJob?: () => void) {
  const { currentUser } = useRBAC();

  const updateJobStatus = async (newStatus: string, oldStatus?: string) => {
    if (!jobId) {
      toast.error('Cannot update status: Job ID is missing');
      return;
    }

    try {
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
        return;
      }

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
        console.error("Error updating job status:", updateError);
        toast.error(`Failed to update job status: ${updateError.message}`);
        throw updateError;
      }

      toast.success(`Job status updated to ${newStatus}`);

      // Log status change to job history
      try {
        const userName = currentUser?.name || currentUser?.email || 'System';
        const userId = currentUser?.id;
        await recordStatusChange(jobId, currentStatus, normalizedNewStatus, userName, userId);
      } catch (historyError) {
        console.warn('Failed to log status change to history:', historyError);
      }

      // Process automations through the frontend service
      AutomationService.processJobStatusChange(
        jobId,
        currentStatus,
        normalizedNewStatus
      ).catch(error => {
        console.error('Automation processing error:', error);
        // Don't show error to user - automations run in background
      });

      // Real-time subscription will handle the refresh - no need for manual timeout
      // This prevents duplicate refreshes and improves UX

    } catch (error) {
      console.error("Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
      throw error;
    }
  };

  return { updateJobStatus };
}
