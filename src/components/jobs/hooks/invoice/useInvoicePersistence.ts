
import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types/documents";
import { LineItem } from "@/components/jobs/builder/types";
import { InvoiceFormData } from "./types";

export const useInvoicePersistence = (
  jobId: string,
  formData: InvoiceFormData,
  lineItems: LineItem[],
  notes: string,
  taxRate: number,
  calculateSubtotal: () => number,
  calculateTotalTax: () => number,
  calculateGrandTotal: () => number,
  setFormData: React.Dispatch<React.SetStateAction<InvoiceFormData>>
) => {
  const saveInvoiceChanges = useCallback(async (): Promise<Invoice | null> => {
    try {
      console.log('💾 Starting invoice save process...');
      console.log('Job ID:', jobId);
      console.log('Form data:', formData);
      console.log('Line items:', lineItems);
      console.log('Notes:', notes);
      
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTotalTax();
      const total = calculateGrandTotal();
      
      const invoiceData = {
        job_id: jobId,
        invoice_number: formData.invoiceNumber,
        total: total,
        tax_amount: taxAmount,
        amount_paid: 0,
        status: formData.status,
        notes: notes || null,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: null,
        items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxable: item.taxable,
          total: item.quantity * item.unitPrice
        }))
      };

      console.log('Invoice data to save:', invoiceData);

      let invoice;
      if (formData.invoiceId) {
        console.log('Updating existing invoice:', formData.invoiceId);
        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', formData.invoiceId)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating invoice:', error);
          throw error;
        }
        invoice = data;
        console.log('Invoice updated successfully:', invoice);
      } else {
        console.log('Creating new invoice...');
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating invoice:', error);
          throw error;
        }
        invoice = data;
        console.log('Invoice created successfully:', invoice);
        
        setFormData(prev => ({
          ...prev,
          invoiceId: invoice.id
        }));
      }
      
      // Handle line items
      if (invoice) {
        console.log('Managing line items for invoice:', invoice.id);
        
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');
          
        if (deleteError) {
          console.error('Error deleting existing line items:', deleteError);
        }
        
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            parent_id: invoice.id,
            parent_type: 'invoice',
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            taxable: item.taxable
          }));
          
          console.log('Creating line items:', lineItemsData);
          
          const { error: insertError } = await supabase
            .from('line_items')
            .insert(lineItemsData);
            
          if (insertError) {
            console.error('Error creating line items:', insertError);
            throw insertError;
          }
          
          console.log('Line items created successfully');
        }
      }
      
      const successMessage = formData.invoiceId ? "Invoice updated successfully" : "Invoice created successfully";
      toast.success(successMessage);
      
      const standardizedInvoice: Invoice = {
        id: invoice.id,
        job_id: invoice.job_id,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        total: invoice.total,
        subtotal: invoice.subtotal || subtotal,
        amount_paid: invoice.amount_paid || 0,
        balance_due: (invoice.total || 0) - (invoice.amount_paid || 0),
        status: invoice.status,
        payment_status: invoice.payment_status || 'unpaid',
        notes: invoice.notes,
        terms: invoice.terms,
        items: invoice.items || [],
        tax_rate: invoice.tax_rate || taxRate,
        tax_amount: invoice.tax_amount || taxAmount,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at || invoice.created_at,
        created_by: invoice.created_by || 'unknown' // Add required created_by field
      };
      
      console.log('✅ Invoice save process completed successfully');
      return standardizedInvoice;
    } catch (error: any) {
      console.error("❌ Error saving invoice:", error);
      toast.error("Failed to save invoice: " + (error.message || "Unknown error"));
      return null;
    }
  }, [jobId, formData, lineItems, notes, taxRate, calculateSubtotal, calculateTotalTax, calculateGrandTotal, setFormData]);

  return {
    saveInvoiceChanges
  };
};
