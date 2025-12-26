import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/types/documents';
import { useAuth } from '@/hooks/use-auth';

export interface EstimateActionsState {
  selectedEstimate: Estimate | null;
  isDeleting: boolean;
  isConverting: boolean;
  isSending: boolean;
}

export interface EstimateActionsActions {
  setSelectedEstimate: (estimate: Estimate | null) => void;
  handleSendEstimate: (estimateId: string) => Promise<boolean>;
  handleSendEstimateSMS: (estimateId: string, phoneNumber: string) => Promise<boolean>;
  confirmDeleteEstimate: () => Promise<boolean>;
}

export interface EstimateActionsHook {
  state: EstimateActionsState;
  actions: EstimateActionsActions;
}

export const useEstimateActions = (
  jobId: string,
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  refreshEstimates: () => void,
  onEstimateConverted?: () => void
): EstimateActionsHook => {
  const { user } = useAuth();
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendEstimate = async (estimateId: string): Promise<boolean> => {
    setIsSending(true);
    try {
      // Get estimate details
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError || !estimateData) {
        throw new Error('Failed to fetch estimate details');
      }

      // Get job and client info separately
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', estimateData.job_id)
        .single();

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimateId);

      if (lineItemsError) {
        throw new Error('Failed to fetch line items');
      }

      // Call send-estimate function with complete data
      const { data: sendData, error: sendError } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: estimateId,
          recipientEmail: jobData?.clients?.email,
          customMessage: `Please find your estimate ${estimateData.estimate_number}. Total: $${estimateData.total.toFixed(2)}.`
        }
      });

      if (sendError || !sendData?.success) {
        throw new Error(sendData?.error || 'Failed to send estimate');
      }

      // Update local state to reflect sent status - cast status properly
      const updatedEstimates = estimates.map(est => 
        est.id === estimateId ? { 
          ...est, 
          status: 'sent' as Estimate['status']
        } : est
      );
      setEstimates(updatedEstimates);
      
      toast.success('Estimate sent successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to send estimate: ' + error.message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEstimateSMS = async (estimateId: string, phoneNumber: string): Promise<boolean> => {
    setIsSending(true);
    try {
      
      // Get estimate details including portal token
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError || !estimateData) {
        throw new Error('Failed to fetch estimate details');
      }

      // Generate token if it doesn't exist
      let portalToken = estimateData.portal_access_token;
      if (!portalToken) {
        // Generate a secure token
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        portalToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // Update estimate with token
        await supabase
          .from('estimates')
          .update({ portal_access_token: portalToken })
          .eq('id', estimateId);
      }

      // Get job and client info
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', estimateData.job_id)
        .single();

      // Generate portal link with token
      const portalLink = `https://hub.fixlify.app/portal/estimate/${portalToken}`;

      // Create SMS message with shortened link (for SMS character limit)
      const message = `Hi ${jobData?.clients?.name || 'there'}, your estimate ${estimateData.estimate_number} is ready! Total: $${estimateData.total.toFixed(2)}. View: ${portalLink}`;

      // Send SMS via edge function
      const { data: smsData, error: smsError } = await supabase.functions.invoke('send-estimate-sms', {
        body: {
          estimateId: estimateId,
          recipientPhone: phoneNumber,
          message: message
        }
      });

      if (smsError || !smsData?.success) {
        const errorMessage = smsData?.error || smsError?.message || 'Failed to send SMS';
        throw new Error(errorMessage);
      }

      // Update estimate status to sent
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimateId);

      if (updateError) {
        // Status update failed but SMS was sent successfully
      }

      // Update local state
      const updatedEstimates = estimates.map(est => 
        est.id === estimateId ? { 
          ...est, 
          status: 'sent' as Estimate['status']
        } : est
      );
      setEstimates(updatedEstimates);
      
      toast.success('Estimate sent via SMS successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to send SMS: ' + error.message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const confirmDeleteEstimate = async (): Promise<boolean> => {
    if (!selectedEstimate) return false;

    setIsDeleting(true);
    try {
      // Delete line items first
      const { error: lineItemsError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_type', 'estimate')
        .eq('parent_id', selectedEstimate.id);

      if (lineItemsError) {
        throw new Error('Failed to delete estimate line items');
      }

      // Delete estimate
      const { error: estimateError } = await supabase
        .from('estimates')
        .delete()
        .eq('id', selectedEstimate.id);

      if (estimateError) {
        throw new Error('Failed to delete estimate');
      }

      // Update local state immediately
      const updatedEstimates = estimates.filter(est => est.id !== selectedEstimate.id);
      setEstimates(updatedEstimates);

      // Also trigger refresh to ensure consistency
      refreshEstimates();
      
      toast.success('Estimate deleted successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete estimate: ' + error.message);
      return false;
    } finally {
      setIsDeleting(false);
      setSelectedEstimate(null);
    }
  };

  return {
    state: {
      selectedEstimate,
      isDeleting,
      isConverting,
      isSending
    },
    actions: {
      setSelectedEstimate,
      handleSendEstimate,
      handleSendEstimateSMS,
      confirmDeleteEstimate
    }
  };
};
