import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface InvoiceActionsProps {
  invoiceId: string;
  onSuccess?: () => void;
}

export const invoiceActions = {
  async sendInvoice({ invoiceId, onSuccess }: InvoiceActionsProps): Promise<boolean> {
    try {
      // Get invoice details with job and client info
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          jobs(
            *,
            clients(*)
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoiceData) {
        throw new Error('Failed to fetch invoice details');
      }

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'invoice')
        .eq('parent_id', invoiceId);

      // Call send-invoice edge function
      const { data: sendData, error: sendError } = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId: invoiceId,
          recipientEmail: invoiceData.jobs?.clients?.email,
          customMessage: `Invoice ${invoiceData.invoice_number} - Total: $${invoiceData.total.toFixed(2)}. Payment is due by ${invoiceData.due_date}.`
        }
      });

      if (sendError || !sendData?.success) {
        throw new Error(sendData?.error || 'Failed to send invoice');
      }

      toast.success('Invoice sent successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      toast.error('Failed to send invoice: ' + error.message);
      return false;
    }
  },

  async sendInvoiceSMS({ invoiceId, phoneNumber, onSuccess }: InvoiceActionsProps & { phoneNumber: string }): Promise<boolean> {
    try {
      // Get invoice details
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoiceData) {
        throw new Error('Failed to fetch invoice details');
      }

      // Call send-invoice-sms edge function
      const { data: sendData, error: sendError } = await supabase.functions.invoke('send-invoice-sms', {
        body: {
          invoiceId: invoiceId,
          recipientPhone: phoneNumber,
          invoiceNumber: invoiceData.invoice_number,
          amount: invoiceData.total
        }
      });

      if (sendError || !sendData?.success) {
        throw new Error(sendData?.error || 'Failed to send SMS');
      }

      toast.success('Invoice SMS sent successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      toast.error('Failed to send SMS: ' + error.message);
      return false;
    }
  }
};

// Export individual functions for backward compatibility
export const handleSendInvoice = invoiceActions.sendInvoice;
export const handleSendInvoiceSMS = invoiceActions.sendInvoiceSMS;
