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
      // Here you would integrate with your email service
      // For now, we'll just update the status
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;
      
      // Add delay to ensure database changes are committed  
      setTimeout(() => {
        refreshInvoices();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
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
