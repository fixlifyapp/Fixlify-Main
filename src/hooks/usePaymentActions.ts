import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useJobHistoryIntegration } from '@/hooks/useJobHistoryIntegration';

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
      console.log('Starting payment recording process for job:', jobId);
      console.log('Payment data:', paymentData);
      
      // Validate required data
      if (!paymentData.invoiceId) {
        console.error('Invoice ID is required');
        toast.error('Invoice ID is required');
        return false;
      }
      
      if (!paymentData.amount || paymentData.amount <= 0) {
        console.error('Payment amount must be greater than 0');
        toast.error('Payment amount must be greater than 0');
        return false;
      }

      if (!paymentData.method) {
        console.error('Payment method is required');
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
        console.error('Error fetching invoice:', fetchError);
        toast.error('Invoice not found or access denied');
        return false;
      }

      if (!currentInvoice) {
        console.error('Invoice not found');
        toast.error('Invoice not found');
        return false;
      }

      console.log('Current invoice state:', currentInvoice);

      // Calculate remaining balance with proper rounding
      const currentAmountPaid = Math.round((currentInvoice.amount_paid || 0) * 100) / 100;
      const invoiceTotal = Math.round(currentInvoice.total * 100) / 100;
      const remainingBalance = Math.round((invoiceTotal - currentAmountPaid) * 100) / 100;
      const paymentAmount = Math.round(paymentData.amount * 100) / 100;

      console.log('Payment calculation:', {
        currentAmountPaid,
        invoiceTotal,
        remainingBalance,
        paymentAmount
      });

      // Validate payment amount doesn't exceed remaining balance
      if (paymentAmount > remainingBalance + 0.01) { // Small tolerance for floating point
        console.error('Payment amount exceeds remaining balance');
        toast.error(`Payment amount ($${paymentAmount.toFixed(2)}) exceeds remaining balance ($${remainingBalance.toFixed(2)})`);
        return false;
      }

      // Generate payment number
      const { data: paymentNumber, error: numberError } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'payment'
      });

      if (numberError) {
        console.error('Error generating payment number:', numberError);
        toast.error('Failed to generate payment number');
        return false;
      }

      console.log('Generated payment number:', paymentNumber);

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
        console.error('Error inserting payment:', paymentError);
        toast.error('Failed to record payment: ' + paymentError.message);
        return false;
      }

      console.log('Payment inserted successfully:', paymentResult);

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

      console.log('Updating invoice with new amounts:', {
        newAmountPaid,
        newBalance,
        newStatus
      });

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
        console.error('Error updating invoice:', updateError);
        // Try to rollback the payment
        await supabase
          .from('payments')
          .delete()
          .eq('id', paymentResult.id);
        toast.error('Failed to update invoice status');
        return false;
      }

      console.log('Invoice updated successfully');

      // Log the payment in job history
      try {
        await logPaymentReceived(
          paymentAmount, 
          paymentData.method as any, 
          paymentData.reference
        );
        console.log('Payment successfully logged to job history');
      } catch (historyError) {
        console.error('Failed to log payment to job history:', historyError);
        // Don't fail the entire payment if history logging fails
        console.warn('Payment recorded but history logging failed');
      }

      console.log('Payment successfully recorded');
      toast.success('Payment recorded successfully!');
      
      // Add delay to ensure database changes are fully committed before triggering refresh
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 300); // 300ms delay to ensure DB transaction is complete
      
      return true;
    } catch (error: any) {
      console.error('Error recording payment:', error);
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
      const { data: refundNumber } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'payment'
      });

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
      console.error('Error refunding payment:', error);
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
      console.error('Error deleting payment:', error);
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
