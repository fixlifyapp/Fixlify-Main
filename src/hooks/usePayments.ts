import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define types locally to avoid import issues
export type PaymentMethod = "cash" | "credit-card" | "e-transfer" | "cheque";
export type PaymentStatus = "paid" | "refunded" | "disputed";

export interface Payment {
  id: string;
  date: string;
  clientId?: string;
  clientName?: string;
  jobId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  technicianId?: string;
  technicianName?: string;
  invoice_id?: string;
  created_at?: string;
}

export const usePayments = (jobId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchPayments = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('⚠️ Fetch already in progress for payments, skipping...');
      return;
    }

    if (!jobId) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsFetching(true);
      setIsLoading(true);
      console.log('Fetching payments for job:', jobId);

      // First, get invoice IDs for this job
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('id')
        .eq('job_id', jobId);

      if (invoiceError) {
        console.error('Error fetching invoices for payments:', invoiceError);
        throw invoiceError;
      }

      const invoiceIds = invoiceData?.map(inv => inv.id) || [];
      console.log('Found invoice IDs for job:', invoiceIds);

      if (invoiceIds.length === 0) {
        console.log('No invoices found, no payments to fetch');
        setPayments([]);
        return;
      }

      // Fetch payments for those invoices
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .in('invoice_id', invoiceIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      console.log('Fetched payments:', data);

      // Transform the data to match Payment interface
      const transformedPayments = data?.map(payment => ({
        id: payment.id,
        date: payment.date,
        amount: payment.amount,
        method: payment.method as PaymentMethod,
        status: 'paid' as const,
        reference: payment.reference,
        notes: payment.notes,
        invoice_id: payment.invoice_id,
        created_at: payment.created_at,
        jobId: jobId
      })) || [];

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const refreshPayments = () => {
    console.log('🔄 Refreshing payments...');
    fetchPayments();
  };

  // Calculate totals
  const totalPaid = payments.filter(p => p.amount > 0).reduce((sum, payment) => sum + payment.amount, 0);
  const totalRefunded = payments.filter(p => p.amount < 0).reduce((sum, payment) => sum + Math.abs(payment.amount), 0);
  const netAmount = totalPaid - totalRefunded;

  useEffect(() => {
    fetchPayments();
  }, [jobId]);

  return {
    payments,
    setPayments,
    isLoading,
    refreshPayments,
    totalPaid,
    totalRefunded,
    netAmount
  };
};
