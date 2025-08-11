import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AutomationService } from '@/services/automationService';
import { toast } from 'sonner';

interface UseJobUpdateOptions {
  onSuccess?: (job: any) => void;
  onError?: (error: Error) => void;
  skipAutomation?: boolean;
}

export const useJobUpdate = (options: UseJobUpdateOptions = {}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setIsUpdating(true);
    
    try {
      // Get current job data
      const { data: currentJob, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const oldStatus = currentJob?.status;
      
      // Update job status
      const { data: updatedJob, error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Process automations (unless skipped)
      if (!options.skipAutomation && oldStatus !== newStatus) {
        console.log('🤖 Processing automations for job status change...');
        AutomationService.processJobStatusChange(
          jobId,
          oldStatus,
          newStatus
        ).catch(error => {
          console.error('Automation processing error:', error);
          // Don't fail the update if automation fails
        });
      }
      
      toast.success(`Job status updated to ${newStatus}`);
      options.onSuccess?.(updatedJob);
      
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job status');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateJob = async (jobId: string, updates: any) => {
    setIsUpdating(true);
    
    try {
      // Get current job data if we're updating status
      let oldStatus: string | undefined;
      
      if (updates.status) {
        const { data: currentJob } = await supabase
          .from('jobs')
          .select('status')
          .eq('id', jobId)
          .single();
        
        oldStatus = currentJob?.status;
      }
      
      // Update job
      const { data: updatedJob, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Process automations if status changed
      if (!options.skipAutomation && updates.status && oldStatus && oldStatus !== updates.status) {
        console.log('🤖 Processing automations for job update...');
        AutomationService.processJobStatusChange(
          jobId,
          oldStatus,
          updates.status
        ).catch(error => {
          console.error('Automation processing error:', error);
        });
      }
      
      toast.success('Job updated successfully');
      options.onSuccess?.(updatedJob);
      
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateJobStatus,
    updateJob,
    isUpdating
  };
};