import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { PaymentMethod, PaymentStatus } from "@/types/payment";
import { useClientPaymentsRealtime } from "./useClientPaymentsRealtime";

export interface ClientPayment {
  id: string;
  payment_date: string;
  amount: number;
  method: string;
  status: string;
  invoice_number?: string;
  job_title?: string;
  job_id?: string;
}

export const useClientPayments = (clientId?: string) => {
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);

  // Create a fetchPayments function that can be used as a callback
  const fetchPayments = useCallback(async () => {
    if (!clientId) {
      setPayments([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get jobs for the client
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, client_id')
        .eq('client_id', clientId);
        
      if (jobsError) throw jobsError;
      
      let paymentData: ClientPayment[] = [];
      let totalAmount = 0;
      let invoiceCount = 0;
      
      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map(job => job.id);
        
        // Get invoices for those jobs
        const { data: invoices, error: invoiceError } = await supabase
          .from('invoices')
          .select('id, job_id, invoice_number, total, status')
          .in('job_id', jobIds);
          
        if (invoiceError) throw invoiceError;
        
        const invoiceMap = new Map();
        invoices?.forEach(inv => {
          invoiceMap.set(inv.id, {
            invoice_number: inv.invoice_number,
            job_id: inv.job_id,
            total: inv.total,
            status: inv.status
          });
          
          if (inv.status === 'paid') {
            totalAmount += Number(inv.total);
            invoiceCount++;
          }
        });
        
        if (invoices && invoices.length > 0) {
          const invoiceIds = invoices.map(inv => inv.id);
          
          // Then get payments for those invoices - using payment_date
          const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('id, invoice_id, amount, method, payment_date')
            .in('invoice_id', invoiceIds)
            .order('payment_date', { ascending: false });
            
          if (paymentError) throw paymentError;
          
          // Create a map of job titles for quick lookup
          const jobTitlesMap = new Map();
          jobs.forEach(job => {
            jobTitlesMap.set(job.id, job.title);
          });
          
          // Format the payment data with all relevant info
          if (payments) {
            paymentData = payments.map(payment => {
              const invoice = invoiceMap.get(payment.invoice_id);
              const jobId = invoice?.job_id;
              const jobTitle = jobId ? jobTitlesMap.get(jobId) : null;
              
              return {
                id: payment.id,
                payment_date: payment.payment_date,
                amount: payment.amount,
                method: payment.method,
                status: 'paid', // Default status since column doesn't exist yet
                invoice_number: invoice?.invoice_number,
                job_title: jobTitle,
                job_id: jobId
              };
            });
          }
        }
      }
      
      setPayments(paymentData);
      setTotalRevenue(totalAmount);
      setPaidInvoices(invoiceCount);
    } catch (error) {
      console.error("Error loading client payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, toast]);
  
  // Set up initial data fetch
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  
  // Set up real-time updates
  useClientPaymentsRealtime(clientId, fetchPayments);
  
  return {
    payments,
    isLoading,
    totalRevenue,
    paidInvoices,
    refreshPayments: fetchPayments
  };
};
