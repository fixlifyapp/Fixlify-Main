import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Invoice as InvoiceType, LineItem } from "@/types/documents";

// Extended interface for backward compatibility
export interface Invoice extends InvoiceType {
  [key: string]: any; // Allow any additional properties
  // Additional properties for backward compatibility
  title?: string;
  number?: string; // Alias for invoice_number
  date?: string; // Alias for created_at
  balance?: number; // Alias for balance_due
  description?: string; // Add missing description field
}

// Re-export LineItem for backward compatibility
export type { LineItem };

export const useInvoices = (jobId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchInvoices = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('⚠️ Fetch already in progress, skipping...');
      return;
    }
    
    try {
      setIsFetching(true);
      console.log('📊 Fetching invoices' + (jobId ? ` for job: ${jobId}` : ''), 'at', new Date().toISOString());
      setIsLoading(true);
      
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching invoices:', error);
        toast.error('Failed to load invoices');
        return;
      }

      console.log('✅ Invoices fetched:', data?.length || 0, 'invoices with updated amounts');
      
      // Transform data to match Invoice interface
      const transformedInvoices: Invoice[] = (data || []).map(item => ({
        ...item,
        status: (item.status as Invoice['status']) || 'draft',
        payment_status: (item.payment_status as Invoice['payment_status']) || 'unpaid',
        items: Array.isArray(item.items) ? 
          (item.items as any[]).map((lineItem: any) => ({
            id: lineItem.id || `item-${Math.random()}`,
            description: lineItem.description || '',
            quantity: lineItem.quantity || 1,
            unitPrice: lineItem.unitPrice || lineItem.unit_price || 0,
            taxable: lineItem.taxable !== false,
            total: (lineItem.quantity || 1) * (lineItem.unitPrice || lineItem.unit_price || 0)
          } as LineItem)) : [],
        subtotal: item.subtotal || 0,
        total: item.total || 0,
        amount_paid: item.amount_paid || 0,
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        discount_amount: item.discount_amount || 0,
        updated_at: item.updated_at || item.created_at,
        balance_due: (item.total || 0) - (item.amount_paid || 0)
      }));
      
      // Log payment status for debugging
      transformedInvoices.forEach(invoice => {
        console.log(`📋 Invoice ${invoice.invoice_number}: Total=${invoice.total}, Paid=${invoice.amount_paid}, Balance=${invoice.balance_due}, Status=${invoice.status}`);
      });
      
      setInvoices(transformedInvoices);
    } catch (error) {
      console.error('❌ Error in fetchInvoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const refreshInvoices = () => {
    console.log('🔄 Refreshing invoices...');
    fetchInvoices();
  };

  useEffect(() => {
    fetchInvoices();
  }, [jobId]);

  return {
    invoices,
    isLoading,
    refreshInvoices
  };
};
