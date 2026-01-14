import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  reference?: string;
  notes?: string;
  payment_number?: string;
  created_at: string;
  // Joined fields
  invoice_number?: string;
  client_name?: string;
  job_id?: string;
}

export const useAllPayments = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);

      // Fetch payments with invoice and client info
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner (
            invoice_number,
            job_id,
            jobs (
              clients (
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
        return;
      }

      // Transform data to flat structure
      const transformedPayments: PaymentRecord[] = (data || []).map((payment: any) => ({
        id: payment.id,
        invoice_id: payment.invoice_id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status || 'completed',
        date: payment.date || payment.payment_date,
        reference: payment.reference,
        notes: payment.notes,
        payment_number: payment.payment_number,
        created_at: payment.created_at,
        invoice_number: payment.invoices?.invoice_number,
        client_name: payment.invoices?.jobs?.clients?.name,
        job_id: payment.invoices?.job_id
      }));

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPayments = () => {
    fetchPayments();
  };

  // Calculate metrics
  const totalPayments = payments
    .filter(p => p.amount > 0 && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunds = payments
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  const failedPayments = payments.filter(p => p.status === 'failed').length;

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    isLoading,
    refreshPayments,
    totalPayments,
    totalRefunds,
    failedPayments
  };
};
