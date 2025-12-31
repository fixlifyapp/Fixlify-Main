import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/types/documents';

export interface EstimateActionsState {
  selectedEstimate: Estimate | null;
  isDeleting: boolean;
  isConverting: boolean;
}

export interface EstimateActionsActions {
  setSelectedEstimate: (estimate: Estimate | null) => void;
  confirmDeleteEstimate: () => Promise<boolean>;
}

export interface EstimateActionsHook {
  state: EstimateActionsState;
  actions: EstimateActionsActions;
}

/**
 * Hook for estimate actions (delete, state management).
 *
 * NOTE: Send functionality is handled by UniversalSendDialog
 * which uses the useDocumentSending hook for unified document sending.
 */
export const useEstimateActions = (
  jobId: string,
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  refreshEstimates: () => void,
  onEstimateConverted?: () => void
): EstimateActionsHook => {
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

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
      isConverting
    },
    actions: {
      setSelectedEstimate,
      confirmDeleteEstimate
    }
  };
};
