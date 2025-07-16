import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/documents';

export const useInvoiceActions = (invoiceId: string, refreshInvoices: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const markAsPaid = async (): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total')
        .eq('id', invoiceId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          amount_paid: invoice.total,
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      toast.success('Invoice marked as paid');
      
      // Add delay to ensure database changes are committed
      setTimeout(() => {
        refreshInvoices();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const sendInvoice = async (recipientEmail: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      console.log('Starting invoice send process for ID:', invoiceId);
      
      // Get invoice details
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoiceData) {
        throw new Error('Failed to fetch invoice details');
      }

      // Get job and client info separately
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', invoiceData.job_id)
        .single();

      if (jobError) {
        console.warn('Could not fetch job/client data:', jobError);
      }

      console.log('Invoice data:', invoiceData);

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'invoice')
        .eq('parent_id', invoiceId);

      if (lineItemsError) {
        throw new Error('Failed to fetch line items');
      }

      console.log('Line items:', lineItems);

      // Call send-invoice function with complete data
      const { data: sendData, error: sendError } = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId: invoiceId,
          recipientEmail: recipientEmail || jobData?.clients?.email,
          customMessage: `Please find your invoice ${invoiceData.invoice_number}. Total: $${invoiceData.total.toFixed(2)}. Due date: ${new Date(invoiceData.due_date).toLocaleDateString()}.`
        }
      });

      if (sendError || !sendData?.success) {
        throw new Error(sendData?.error || 'Failed to send invoice');
      }

      console.log('Invoice sent successfully');

      // Update invoice status
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;
      
      toast.success('Invoice sent successfully');
      
      // Add delay to ensure database changes are committed  
      setTimeout(() => {
        refreshInvoices();
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice: ' + error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteInvoice = async (): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast.success('Invoice deleted successfully');
      
      // Add delay to ensure database changes are committed
      setTimeout(() => {
        refreshInvoices();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    markAsPaid,
    sendInvoice,
    deleteInvoice,
    isProcessing
  };
};
