import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useInvoiceCreation = (clientId?: string, jobId?: string) => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    description: "",
    amount: ""
  });

  const handleCreateInvoice = () => {
    // Invoices must be created from a job context
    if (!jobId) {
      toast.error("Please create an invoice from the job detail page. Invoices must be associated with a job.");
      return;
    }
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = async () => {
    if (!clientId || !jobId) {
      toast.error("Invoice requires both a client and a job.");
      return;
    }

    try {
      // Create invoice in the database
      const currentDate = new Date().toISOString();

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId, // ✅ FIXED: Now uses actual job_id parameter
          invoice_number: `INV-${Date.now().toString().slice(-6)}`,
          total: parseFloat(invoiceData.amount) || 0,
          notes: invoiceData.description,
          issue_date: currentDate,
          amount_paid: 0,
          client_id: clientId,
          status: 'draft',
          payment_status: 'unpaid'
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
