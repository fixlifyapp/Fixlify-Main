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
      return;
    }

    if (!jobId) {
      setEstimates([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsFetching(true);
      
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load estimates');
        return;
      }

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
      toast.error('Failed to load estimates');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const convertEstimateToInvoice = async (estimateId: string): Promise<boolean> => {
    try {
      const estimate = estimates.find(e => e.id === estimateId);
      if (!estimate) {
        toast.error('Estimate not found');
        return false;
      }

      // Get line items from line_items table
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimateId);

      if (lineItemsError) {
        toast.error('Failed to fetch estimate line items');
        return false;
      }

      // Generate invoice number
      const { data: invoiceNumber, error: idError } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'invoice'
      });

      if (idError) {
        toast.error('Failed to generate invoice number');
        return false;
      }

      // Create invoice from estimate
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          job_id: estimate.job_id,
          client_id: estimate.client_id,
          estimate_id: estimate.id,
          total: estimate.total,
          status: 'draft',
          payment_status: 'unpaid',
          amount_paid: 0,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: estimate.notes,
          terms: estimate.terms,
          subtotal: estimate.subtotal || 0,
          tax_rate: estimate.tax_rate || 0,
          tax_amount: estimate.tax_amount || 0,
          discount_amount: estimate.discount_amount || 0,
          items: []
        })
        .select()
        .single();

      if (invoiceError) {
        toast.error('Failed to create invoice');
        return false;
      }

      // Copy line items to invoice in line_items table
      if (lineItems && lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_type: 'invoice' as const,
          parent_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable
        }));

        const { error: lineItemsCreateError } = await supabase
          .from('line_items')
          .insert(invoiceLineItems);

        if (lineItemsCreateError) {
          // Try to rollback invoice creation
          await supabase.from('invoices').delete().eq('id', newInvoice.id);
          toast.error('Failed to copy line items to invoice');
          return false;
        }
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' as const })
        .eq('id', estimateId);

      if (updateError) {
        // Don't fail the conversion if status update fails
        toast.success(`Invoice ${invoiceNumber} created successfully (estimate status update pending)`);
      } else {
        toast.success(`Invoice ${invoiceNumber} created successfully from estimate`);
      }

      // Refresh estimates to reflect status change
      setTimeout(() => {
        fetchEstimates();
      }, 300);

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      toast.error(`Failed to convert estimate: ${errorMessage}`);
      return false;
    }
  };

  const refreshEstimates = () => {
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
