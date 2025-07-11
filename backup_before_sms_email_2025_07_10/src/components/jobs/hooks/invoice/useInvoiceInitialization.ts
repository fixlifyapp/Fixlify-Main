
import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate, Invoice } from "@/types/documents";
import { LineItem } from "@/components/jobs/builder/types";
import { InvoiceFormData } from "./types";

export const useInvoiceInitialization = (
  setLineItems: (items: LineItem[]) => void,
  setNotes: (notes: string) => void,
  setFormData: React.Dispatch<React.SetStateAction<InvoiceFormData>>
) => {
  const initializeFromEstimate = useCallback(async (estimate: Estimate) => {
    try {
      const { data: lineItemsData, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimate.id)
        .eq('parent_type', 'estimate');
        
      if (error) throw error;
      
      const items = lineItemsData?.map((item, index) => ({
        id: item.id || `item-${index}`,
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        taxable: item.taxable || true,
        discount: 0,
        ourPrice: 0,
        name: item.description || "",
        price: item.unit_price || 0,
        total: (item.quantity || 1) * (item.unit_price || 0)
      })) || [];
      
      setLineItems(items);
      setNotes(estimate.notes || "");
    } catch (error) {
      console.error("Error loading estimate items:", error);
      toast.error("Failed to load estimate items");
    }
  }, [setLineItems, setNotes]);

  const initializeFromInvoice = useCallback(async (invoice: Invoice) => {
    try {
      const { data: lineItemsData, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', invoice.id)
        .eq('parent_type', 'invoice');
        
      if (error) throw error;
      
      const items = lineItemsData?.map((item, index) => ({
        id: item.id || `item-${index}`,
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        taxable: item.taxable || true,
        discount: 0,
        ourPrice: 0,
        name: item.description || "",
        price: item.unit_price || 0,
        total: (item.quantity || 1) * (item.unit_price || 0)
      })) || [];
      
      setLineItems(items);
      setNotes(invoice.notes || "");
      setFormData(prev => ({
        ...prev,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        total: invoice.total
      }));
    } catch (error) {
      console.error("Error loading invoice items:", error);
      toast.error("Failed to load invoice items");
    }
  }, [setLineItems, setNotes, setFormData]);

  return {
    initializeFromEstimate,
    initializeFromInvoice
  };
};
