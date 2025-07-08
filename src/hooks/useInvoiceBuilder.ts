
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  id?: string;
  invoice_number: string;
  title: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  terms?: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export const useInvoiceBuilder = (jobId: string) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoice_number: '',
    title: '',
    description: '',
    items: [],
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total: 0,
    status: 'draft'
  });

  const [isSaving, setIsSaving] = useState(false);

  const updateInvoiceData = (updates: Partial<InvoiceData>) => {
    setInvoiceData(prev => ({ ...prev, ...updates }));
  };

  const saveInvoice = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId,
          ...invoiceData
        });

      if (error) throw error;

      toast.success('Invoice saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    invoiceData,
    updateInvoiceData,
    saveInvoice,
    isSaving
  };
};
