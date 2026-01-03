import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Payment record for an invoice
 */
interface PaymentRecord {
  amount: number;
  [key: string]: any;
}

/**
 * Invoice with associated payments
 */
interface InvoiceWithPayments {
  id: string;
  job_id: string;
  total: number;
  due_date?: string;
  payments: PaymentRecord[];
  [key: string]: any;
}

export const useJobFinancials = (jobId: string) => {
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchFinancials = useCallback(async () => {
    // Prevent multiple simultaneous fetches using ref (no re-render)
    if (isFetchingRef.current) {
      return;
    }

    if (!jobId) {
      setIsLoading(false);
      return;
    }

    try {
      isFetchingRef.current = true;

      // Fetch invoices with their payments for this job
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          payments(amount)
        `)
        .eq('job_id', jobId);

      if (invoicesError) {
        setIsLoading(false);
        return;
      }

      const invoices = invoicesData as InvoiceWithPayments[] | null;

      // Calculate totals with proper payment linking
      const totalInvoiced = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;

      // Calculate total paid from actual payment records
      const totalPaidAmount = invoices?.reduce((sum, invoice) => {
        const invoicePayments: PaymentRecord[] = invoice.payments || [];
        const invoicePaid = invoicePayments.reduce((paySum: number, payment: PaymentRecord) => paySum + (payment.amount || 0), 0);
        return sum + invoicePaid;
      }, 0) || 0;

      const totalBalance = totalInvoiced - totalPaidAmount;

      // Count paid and unpaid invoices based on actual payment status
      const paidCount = invoices?.filter(invoice => {
        const invoicePayments: PaymentRecord[] = invoice.payments || [];
        const invoicePaid = invoicePayments.reduce((sum: number, payment: PaymentRecord) => sum + (payment.amount || 0), 0);
        return invoicePaid >= (invoice.total || 0);
      }).length || 0;

      const unpaidCount = invoices?.filter(invoice => {
        const invoicePayments: PaymentRecord[] = invoice.payments || [];
        const invoicePaid = invoicePayments.reduce((sum: number, payment: PaymentRecord) => sum + (payment.amount || 0), 0);
        return invoicePaid < (invoice.total || 0);
      }).length || 0;

      // Calculate overdue amount (invoices past due date with remaining balance)
      const now = new Date();
      const overdueTotal = invoices?.reduce((sum, invoice) => {
        const invoicePayments: PaymentRecord[] = invoice.payments || [];
        const invoicePaid = invoicePayments.reduce((paySum: number, payment: PaymentRecord) => paySum + (payment.amount || 0), 0);
        const remainingBalance = (invoice.total || 0) - invoicePaid;

        if (remainingBalance > 0 && invoice.due_date && new Date(invoice.due_date) < now) {
          return sum + remainingBalance;
        }
        return sum;
      }, 0) || 0;

      setInvoiceAmount(totalInvoiced);
      setTotalPaid(totalPaidAmount);
      setBalance(totalBalance);
      setOverdueAmount(overdueTotal);
      setPaidInvoices(paidCount);
      setUnpaidInvoices(unpaidCount);
    } catch (error) {
      // Silent fail - financials will show as 0
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [jobId]);

  useEffect(() => {
    fetchFinancials();

    // Set up optimized real-time updates with debouncing
    let timeoutId: NodeJS.Timeout;
    
    const debouncedRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchFinancials();
      }, 500);
    };

    const channel = supabase
      .channel(`job-financials-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `job_id=eq.${jobId}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => debouncedRefresh()
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [jobId, fetchFinancials]);

  return {
    invoiceAmount,
    balance,
    totalPaid,
    overdueAmount,
    paidInvoices,
    unpaidInvoices,
    isLoading,
    refreshFinancials: fetchFinancials
  };
};
