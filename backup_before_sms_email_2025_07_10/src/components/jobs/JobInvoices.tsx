
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SteppedInvoiceBuilder } from "./dialogs/SteppedInvoiceBuilder";
import { UnifiedDocumentViewer } from "./dialogs/UnifiedDocumentViewer";
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "@/types/documents";

interface JobInvoicesProps {
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Add compatibility properties and ensure required fields
      const processedInvoices: Invoice[] = (data || []).map(invoice => ({
        ...invoice,
        status: (invoice.status as Invoice['status']) || 'draft',
        payment_status: (invoice.payment_status as Invoice['payment_status']) || 'unpaid',
        items: Array.isArray(invoice.items) ? 
          (invoice.items as any[]).map((item: any) => ({
            id: item.id || `item-${Math.random()}`,
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.unit_price || 0,
            taxable: item.taxable !== false,
            total: (item.quantity || 1) * (item.unitPrice || item.unit_price || 0)
          })) : [],
        subtotal: invoice.subtotal || 0,
        total: invoice.total || 0,
        amount_paid: invoice.amount_paid || 0,
        tax_rate: invoice.tax_rate || 0,
        tax_amount: invoice.tax_amount || 0,
        discount_amount: invoice.discount_amount || 0,
        updated_at: invoice.updated_at || invoice.created_at,
        balance_due: (invoice.total || 0) - (invoice.amount_paid || 0)
      }));
      
      setInvoices(processedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvoices();
  }, [jobId]);
  
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);
        
      if (error) {
        throw error;
      }
      
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewer(true);
  };
  
  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setIsInvoiceDialogOpen(true);
  };

  const handleInvoiceCreated = () => {
    fetchInvoices();
  };

  const handleDocumentUpdated = () => {
    fetchInvoices();
    setSelectedInvoice(null);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color = "";
    
    switch (status.toLowerCase()) {
      case "paid":
        color = "bg-green-100 text-green-800";
        break;
      case "partial":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "unpaid":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-200";
    }
    
    return (
      <Badge className={color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <>
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Invoices</h3>
            <Button className="gap-2" onClick={handleNewInvoice}>
              <PlusCircle size={16} />
              New Invoice
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No invoices found for this job.</p>
              <p className="mt-2">Create your first invoice or convert an estimate to invoice.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{invoice.invoice_number}</h4>
                      {renderStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(invoice.total)}
                    </div>
                    {invoice.amount_paid > 0 && (
                      <p className="text-sm text-green-600">
                        Paid: {formatCurrency(invoice.amount_paid)}
                      </p>
                    )}
                    {(invoice.balance_due || 0) > 0 && (
                      <p className="text-sm text-red-600">
                        Balance: {formatCurrency(invoice.balance_due || 0)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      View
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Builder Dialog */}
      <SteppedInvoiceBuilder
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        jobId={jobId}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Unified Document Viewer */}
      {selectedInvoice && (
        <UnifiedDocumentViewer
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          document={selectedInvoice}
          documentType="invoice"
          jobId={jobId}
          onUpdate={handleDocumentUpdated}
        />
      )}
    </>
  );
};
