import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useJobHistoryIntegration } from '@/hooks/useJobHistoryIntegration';
import { generateNextId } from '@/utils/idGeneration';

export interface PaymentData {
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}

export const usePaymentActions = (jobId: string, onSuccess?: () => void) => {
  const { logPaymentReceived } = useJobHistoryIntegration(jobId);
  const [isProcessing, setIsProcessing] = useState(false);

  const addPayment = async (paymentData: PaymentData): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Validate required data
      if (!paymentData.invoiceId) {
        toast.error('Invoice ID is required');
        return false;
      }

      if (!paymentData.amount || paymentData.amount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return false;
      }

      if (!paymentData.method) {
        toast.error('Payment method is required');
        return false;
      }

      // First, verify the invoice exists and get current state
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('id, total, amount_paid, status')
        .eq('id', paymentData.invoiceId)
        .single();

      if (fetchError) {
        toast.error('Invoice not found or access denied');
        return false;
      }

      if (!currentInvoice) {
        toast.error('Invoice not found');
        return false;
      }

      // Calculate remaining balance with proper rounding
      const currentAmountPaid = Math.round((currentInvoice.amount_paid || 0) * 100) / 100;
      const invoiceTotal = Math.round(currentInvoice.total * 100) / 100;
      const remainingBalance = Math.round((invoiceTotal - currentAmountPaid) * 100) / 100;
      const paymentAmount = Math.round(paymentData.amount * 100) / 100;

      // Validate payment amount doesn't exceed remaining balance
      if (paymentAmount > remainingBalance + 0.01) { // Small tolerance for floating point
        toast.error(`Payment amount ($${paymentAmount.toFixed(2)}) exceeds remaining balance ($${remainingBalance.toFixed(2)})`);
        return false;
      }

      // Generate payment number using unified ID generator
      let paymentNumber: string;
      try {
        paymentNumber = await generateNextId('payment');
      } catch (numberError) {
        toast.error('Failed to generate payment number');
        return false;
      }

      // Insert payment record
      const { data: paymentResult, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentData.invoiceId,
          amount: paymentAmount,
          method: paymentData.method,
          reference: paymentData.reference || null,
          notes: paymentData.notes || null,
          payment_number: paymentNumber,
          status: 'completed',
          payment_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        })
        .select()
        .single();

      if (paymentError) {
        toast.error('Failed to record payment: ' + paymentError.message);
        return false;
      }

      // Calculate new amounts with proper rounding
      const newAmountPaid = Math.round((currentAmountPaid + paymentAmount) * 100) / 100;
      const newBalance = Math.round((invoiceTotal - newAmountPaid) * 100) / 100;
      
      // Determine new status - use only valid database status values
      let newStatus: string;
      if (newBalance <= 0.01) { // Account for floating point precision
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'unpaid'; // Use 'unpaid' instead of 'partial' since 'partial' is not allowed
      } else {
        newStatus = 'draft'; // Fallback to draft instead of unpaid
      }

      // Update invoice amount_paid and status - ensure we only use valid status values
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          paid_at: newBalance <= 0.01 ? new Date().toISOString() : null
        })
        .eq('id', paymentData.invoiceId);

      if (updateError) {
        // Try to rollback the payment
        await supabase
          .from('payments')
          .delete()
          .eq('id', paymentResult.id);
        toast.error('Failed to update invoice status');
        return false;
      }

      // Log the payment in job history
      try {
        await logPaymentReceived(
          paymentAmount,
          paymentData.method as any,
          paymentData.reference
        );
      } catch (historyError) {
        // Don't fail the entire payment if history logging fails
      }

      toast.success('Payment recorded successfully!');
      
      // Add delay to ensure database changes are fully committed before triggering refresh
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 300); // 300ms delay to ensure DB transaction is complete
      
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to record payment: ${errorMessage}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const refundPayment = async (paymentId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Create refund record (negative amount)
      const refundNumber = await generateNextId('payment');

      const { error: refundError } = await supabase
        .from('payments')
        .insert({
          invoice_id: payment.invoice_id,
          amount: -Math.abs(payment.amount),
          method: payment.method,
          reference: `Refund of ${payment.payment_number}`,
          notes: `Refund of payment ${payment.payment_number}`,
          payment_number: refundNumber,
          status: 'completed'
        });

      if (refundError) throw refundError;

      // Update invoice amount_paid and status
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (fetchError) throw fetchError;

      const newAmountPaid = (invoice.amount_paid || 0) - payment.amount;
      const newBalance = invoice.total - newAmountPaid;
      
      let newStatus = 'draft';
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'unpaid'; // Use 'unpaid' instead of 'partial' since 'partial' is not allowed
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: Math.max(0, newAmountPaid),
          status: newStatus,
          paid_at: newBalance <= 0 ? null : invoice.total === newAmountPaid ? new Date().toISOString() : null
        })
        .eq('id', payment.invoice_id);

      if (updateError) throw updateError;

      toast.success('Payment refunded successfully!');
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to refund payment. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePayment = async (paymentId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Get payment details first
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Delete the payment
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) throw deleteError;

      // Update invoice amount_paid and status
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (fetchError) throw fetchError;

      const newAmountPaid = (invoice.amount_paid || 0) - payment.amount;
      const newBalance = invoice.total - newAmountPaid;
      
      let newStatus = 'draft';
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'unpaid'; // Use 'unpaid' instead of 'partial' since 'partial' is not allowed
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: Math.max(0, newAmountPaid),
          status: newStatus,
          paid_at: newBalance <= 0 ? null : null
        })
        .eq('id', payment.invoice_id);

      if (updateError) throw updateError;

      toast.success('Payment deleted successfully!');
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to delete payment. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addPayment,
    refundPayment,
    deletePayment,
    isProcessing
  };
};
