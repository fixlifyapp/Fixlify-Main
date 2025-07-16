import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Estimate as EstimateType, LineItem } from "@/types/documents";

// Extended interface for backward compatibility
export interface Estimate extends EstimateType {
  [key: string]: any; // Allow any additional properties
  // Additional properties for backward compatibility
  title?: string;
  techniciansNote?: string;
  number?: string; // Alias for estimate_number
  date?: string; // Alias for created_at
  description?: string; // Add missing description field
}

// Re-export LineItem for backward compatibility
export type { LineItem };

export const useEstimates = (jobId?: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchEstimates = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('⚠️ Fetch already in progress for estimates, skipping...');
      return;
    }
    
    if (!jobId) {
      setEstimates([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsFetching(true);
      console.log('📊 Fetching estimates' + (jobId ? ` for job: ${jobId}` : ''));
      
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching estimates:', error);
        toast.error('Failed to load estimates');
        return;
      }

      console.log('✅ Estimates fetched:', data?.length || 0);
      
      // Transform data to match Estimate interface
      const transformedEstimates: Estimate[] = (data || []).map(item => ({
        ...item,
        status: (item.status as Estimate['status']) || 'draft',
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
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        discount_amount: item.discount_amount || 0,
        updated_at: item.updated_at || item.created_at
      }));
      
      setEstimates(transformedEstimates);
    } catch (error) {
      console.error('❌ Error in fetchEstimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const convertEstimateToInvoice = async (estimateId: string): Promise<boolean> => {
    try {
      console.log('🔄 Converting estimate to invoice:', estimateId);

      const estimate = estimates.find(e => e.id === estimateId);
      if (!estimate) {
        toast.error('Estimate not found');
        return false;
      }

      // Generate invoice number
      const { data: invoiceNumber, error: idError } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'invoice'
      });

      if (idError) {
        console.error('❌ Error generating invoice number:', idError);
        toast.error('Failed to generate invoice number');
        return false;
      }

      // Transform LineItem objects to plain JSON for database storage
      const itemsForDb = estimate.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxable: item.taxable,
        total: item.quantity * item.unitPrice
      }));

      // Create invoice from estimate
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          client_id: estimate.client_id,
          estimate_id: estimate.id,
          invoice_number: invoiceNumber,
          items: itemsForDb,
          subtotal: estimate.subtotal,
          tax_rate: estimate.tax_rate,
          tax_amount: estimate.tax_amount,
          discount_amount: estimate.discount_amount,
          total: estimate.total,
          notes: estimate.notes,
          terms: estimate.terms,
          status: 'draft',
          payment_status: 'unpaid',
          amount_paid: 0,
          issue_date: new Date().toISOString().split('T')[0]
        });

      if (invoiceError) {
        console.error('❌ Error creating invoice:', invoiceError);
        toast.error('Failed to create invoice');
        return false;
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);

      if (updateError) {
        console.error('❌ Error updating estimate status:', updateError);
        toast.error('Failed to update estimate status');
        return false;
      }

      console.log('✅ Estimate converted to invoice successfully');
      
      // Add delay to ensure database changes are committed
      setTimeout(() => {
        fetchEstimates();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Error converting estimate:', error);
      toast.error('Failed to convert estimate');
      return false;
    }
  };

  const refreshEstimates = () => {
    console.log('🔄 Refreshing estimates...');
    fetchEstimates();
  };

  useEffect(() => {
    fetchEstimates();
  }, [jobId]);

  return {
    estimates,
    isLoading,
    convertEstimateToInvoice,
    refreshEstimates
  };
};
