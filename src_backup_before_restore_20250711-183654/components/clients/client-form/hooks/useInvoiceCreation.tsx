import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useInvoiceCreation = (clientId?: string) => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    description: "",
    amount: ""
  });

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = async () => {
    if (!clientId) return;
    
    try {
      // Create invoice in the database
      const currentDate = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          job_id: 'default-job-id', // This should be provided from context or props
          invoice_number: `INV-${Date.now().toString().slice(-6)}`,
          total: parseFloat(invoiceData.amount) || 0,
          notes: invoiceData.description,
          issue_date: currentDate,
          amount_paid: 0,
          client_id: clientId
        })
        .select();
        
      if (error) throw error;
      
      setIsInvoiceModalOpen(false);
      
      toast.success(`Invoice for $${invoiceData.amount} has been created successfully.`);
    
      // Reset form data
      setInvoiceData({
        description: "",
        amount: ""
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    }
  };

  return {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    invoiceData,
    setInvoiceData,
    handleCreateInvoice,
    handleInvoiceSubmit
  };
};
