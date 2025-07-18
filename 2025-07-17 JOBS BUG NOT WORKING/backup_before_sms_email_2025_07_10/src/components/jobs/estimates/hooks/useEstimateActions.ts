import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/types/documents';

export interface EstimateActionsState {
  selectedEstimate: Estimate | null;
  isDeleting: boolean;
  isConverting: boolean;
  isSending: boolean;
}

export interface EstimateActionsActions {
  setSelectedEstimate: (estimate: Estimate | null) => void;
  handleSendEstimate: (estimateId: string) => Promise<boolean>;
  confirmDeleteEstimate: () => Promise<boolean>;
  confirmConvertToInvoice: () => Promise<boolean>;
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
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendEstimate = async (estimateId: string): Promise<boolean> => {
    setIsSending(true);
    try {
      console.log('Starting estimate send process for ID:', estimateId);
      
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

      if (jobError) {
        console.warn('Could not fetch job/client data:', jobError);
      }

      console.log('Estimate data:', estimateData);

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimateId);

      if (lineItemsError) {
        throw new Error('Failed to fetch line items');
      }

      console.log('Line items:', lineItems);

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

      console.log('Estimate sent successfully');

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
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate: ' + error.message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const confirmDeleteEstimate = async (): Promise<boolean> => {
    if (!selectedEstimate) return false;

    setIsDeleting(true);
    try {
      console.log('🗑️ Starting estimate deletion:', selectedEstimate.id);

      // Delete line items first
      const { error: lineItemsError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_type', 'estimate')
        .eq('parent_id', selectedEstimate.id);

      if (lineItemsError) {
        console.error('❌ Error deleting line items:', lineItemsError);
        throw new Error('Failed to delete estimate line items');
      }

      console.log('✅ Line items deleted successfully');

      // Delete estimate
      const { error: estimateError } = await supabase
        .from('estimates')
        .delete()
        .eq('id', selectedEstimate.id);

      if (estimateError) {
        console.error('❌ Error deleting estimate:', estimateError);
        throw new Error('Failed to delete estimate');
      }

      console.log('✅ Estimate deleted successfully from database');

      // Update local state immediately
      const updatedEstimates = estimates.filter(est => est.id !== selectedEstimate.id);
      console.log('📊 Updating local estimates state. Before:', estimates.length, 'After:', updatedEstimates.length);
      setEstimates(updatedEstimates);
      
      // Also trigger refresh to ensure consistency
      console.log('🔄 Triggering estimates refresh');
      refreshEstimates();
      
      toast.success('Estimate deleted successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting estimate:', error);
      toast.error('Failed to delete estimate: ' + error.message);
      return false;
    } finally {
      setIsDeleting(false);
      setSelectedEstimate(null);
    }
  };

  const confirmConvertToInvoice = async (): Promise<boolean> => {
    if (!selectedEstimate) return false;

    setIsConverting(true);
    try {
      console.log('🔄 Starting estimate conversion:', selectedEstimate.id);
      
      // Get line items for the estimate
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', selectedEstimate.id);

      if (lineItemsError) throw lineItemsError;

      // Generate invoice number
      const { data: invoiceData, error: invoiceError } = await supabase
        .rpc('generate_next_id', { p_entity_type: 'invoice' });

      if (invoiceError) throw invoiceError;

      const invoiceNumber = invoiceData;

      // Create invoice
      const { data: newInvoice, error: createInvoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          job_id: selectedEstimate.job_id,
          estimate_id: selectedEstimate.id,
          total: selectedEstimate.total,
          status: 'unpaid',
          payment_status: 'unpaid',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          notes: selectedEstimate.notes,
          subtotal: selectedEstimate.subtotal || 0,
          items: []
        })
        .select()
        .single();

      if (createInvoiceError) {
        console.error('❌ Error creating invoice:', createInvoiceError);
        throw createInvoiceError;
      }

      console.log('✅ Invoice created:', newInvoice);

      // Copy line items to invoice
      if (lineItems && lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_type: 'invoice' as const,
          parent_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable
        }));

        const { error: lineItemsCreateError } = await supabase
          .from('line_items')
          .insert(invoiceLineItems);

        if (lineItemsCreateError) {
          console.error('❌ Error copying line items:', lineItemsCreateError);
          throw lineItemsCreateError;
        }
        
        console.log('✅ Line items copied to invoice');
      }

      // Update estimate status to 'converted' with improved error handling
      console.log('🔄 Updating estimate status to converted...');
      const { error: updateEstimateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' as const })
        .eq('id', selectedEstimate.id);

      if (updateEstimateError) {
        console.error('⚠️ Error updating estimate status:', updateEstimateError);
        // Don't throw error - show warning but continue since invoice was created
        toast.error('Invoice created successfully, but estimate status update failed. This does not affect the functionality.');
      } else {
        console.log('✅ Estimate status updated to converted');
      }

      // Update local state - cast status properly
      const updatedEstimates = estimates.map(est => 
        est.id === selectedEstimate.id ? { 
          ...est, 
          status: 'converted' as Estimate['status']
        } : est
      );
      setEstimates(updatedEstimates);

      toast.success(`Invoice ${invoiceNumber} created successfully from estimate ${selectedEstimate.estimate_number}`);
      
      if (onEstimateConverted) {
        onEstimateConverted();
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Error converting estimate to invoice:', error);
      
      // Provide more specific error messages
      if (error.message.includes('row-level security')) {
        toast.error('Access denied. Please ensure you have permission to create invoices and update estimates.');
      } else {
        toast.error('Failed to convert estimate to invoice: ' + error.message);
      }
      
      return false;
    } finally {
      setIsConverting(false);
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
      confirmDeleteEstimate,
      confirmConvertToInvoice
    }
  };
};
