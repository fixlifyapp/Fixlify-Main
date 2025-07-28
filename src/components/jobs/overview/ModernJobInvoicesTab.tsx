import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Edit, CreditCard, Eye, FileText, Trash2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { SteppedInvoiceBuilder } from "../dialogs/SteppedInvoiceBuilder";
import { UniversalSendDialog } from "../dialogs/shared/UniversalSendDialog";
import { UnifiedDocumentViewer } from "../dialogs/UnifiedDocumentViewer";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobData } from "../dialogs/unified/hooks/useJobData";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedPaymentDialog } from "../dialogs/UnifiedPaymentDialog";
import { useJobDetails } from "../context/JobDetailsContext";
import { executeDelayedRefresh } from "@/utils/refreshUtils";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { invoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { estimates } = useEstimates(jobId);
  const { refreshFinancials } = useJobDetails();
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();
  
  // Load job data only when needed (when sending)
  const [loadJobData, setLoadJobData] = useState(false);
  const { clientInfo, loading: jobDataLoading } = useJobData(loadJobData ? jobId : '');

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setSelectedEstimate(null);
    setShowInvoiceBuilder(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setSelectedEstimate(null);
    setShowInvoiceBuilder(true);
  };

  const handleConvertEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setSelectedInvoice(null);
    setShowInvoiceBuilder(true);
  };

  const handleSendInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setLoadJobData(true);  // Load job data when sending
    setShowSendDialog(true);
  };

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPreviewWindow(true);
  };

  const handleRemoveInvoice = async (invoice: any) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);

      if (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
        return;
      }

      // Add delay to ensure database changes are committed
      setTimeout(() => {
        refreshInvoices();
      }, 500);
      
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    setSelectedInvoice(null);
    
    // Add delay to ensure database changes are committed
    setTimeout(() => {
      refreshInvoices();
    }, 500);
    
    toast.success("Invoice sent successfully!");
  };

  const handleSendCancel = () => {
    setShowSendDialog(false);
    setSelectedInvoice(null);
  };

  const handlePaymentSuccess = () => {
    console.log('Payment success callback triggered in ModernJobInvoicesTab');
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
    
    // Use utility to handle all refreshes with proper delays
    executeDelayedRefresh({
      invoices: refreshInvoices,
      financials: refreshFinancials
    });
  };

  const handleViewerClosed = () => {
    setShowPreviewWindow(false);
    setSelectedInvoice(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      sent: { label: "Sent", variant: "default" as const },
      paid: { label: "Paid", variant: "success" as const },
      partial: { label: "Partial", variant: "warning" as const },
      overdue: { label: "Overdue", variant: "destructive" as const },
      cancelled: { label: "Cancelled", variant: "secondary" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canAcceptPayment = (invoice: any) => {
    const status = invoice.status?.toLowerCase();
    return status === 'sent' || status === 'partial' || status === 'overdue' || status === 'draft' || status === 'unpaid';
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-2 sm:px-0">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-fixlyfy-border">
            <CardContent className="p-3 sm:p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const convertibleEstimates = estimates?.filter(est => 
    est.status === 'approved' && 
    !invoices?.some(inv => inv.job_id === est.job_id)
  ) || [];

  const totalInvoiceValue = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
  
  // Fix the status comparison issue by using proper payment_status and status values
  const pendingPayment = invoices?.filter(inv => {
    const paymentStatus = inv.payment_status?.toLowerCase();
    const status = inv.status?.toLowerCase();
    return paymentStatus === 'unpaid' || paymentStatus === 'partial' || status === 'sent' || status === 'overdue';
  }).length || 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{invoices?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 break-all">{formatCurrency(totalInvoiceValue)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{pendingPayment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Convert Estimates Section */}
      {convertibleEstimates.length > 0 && (
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
            <CardTitle className="text-sm sm:text-base">Convert Estimates to Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
            {convertibleEstimates.map((estimate) => (
              <div key={estimate.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base break-all">Estimate #{estimate.estimate_number}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatCurrency(estimate.total)} • Approved
                  </p>
                </div>
                <Button
                  size={isMobile ? "default" : "sm"}
                  className={`${isMobile ? 'w-full h-11' : ''}`}
                  onClick={() => handleConvertEstimate(estimate)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Convert
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Invoices ({invoices?.length || 0})
            </CardTitle>
            <Button 
              onClick={handleCreateInvoice}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          {(!invoices || invoices.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm">Create your first invoice or convert an approved estimate</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    {/* Left side - Invoice info */}
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{invoice.invoice_number}</h4>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Created: {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
                        {invoice.due_date && (
                          <p className="text-sm text-gray-600">Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                        )}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(invoice.total)}
                        </div>
                        {invoice.balance && invoice.balance > 0 && (
                          <p className="text-sm text-red-600 font-medium">Balance: {formatCurrency(invoice.balance)}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      
                      {canAcceptPayment(invoice) && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handlePayInvoice(invoice)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveInvoice(invoice)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SteppedInvoiceBuilder
        open={showInvoiceBuilder}
        onOpenChange={setShowInvoiceBuilder}
        jobId={jobId}
        existingInvoice={selectedInvoice}
        estimateToConvert={selectedEstimate}
        onInvoiceCreated={refreshInvoices}
      />

      {selectedInvoice && (
        <>
          <UniversalSendDialog
            isOpen={showSendDialog}
            onClose={handleSendCancel}
            documentType="invoice"
            documentId={selectedInvoice.id}
            documentNumber={selectedInvoice.invoice_number}
            total={selectedInvoice.total || 0}
            contactInfo={{
              name: clientInfo?.name || 'Client',
              email: clientInfo?.email || '',
              phone: clientInfo?.phone || ''
            }}
            onSuccess={handleSendSuccess}
          />

          <UnifiedPaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => {
              console.log('Closing payment dialog manually');
              setShowPaymentDialog(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
            jobId={jobId}
            onPaymentAdded={handlePaymentSuccess}
          />

          {/* Unified Document Viewer for Invoices */}
          <UnifiedDocumentViewer
            isOpen={showPreviewWindow}
            onClose={handleViewerClosed}
            document={selectedInvoice}
            documentType="invoice"
            jobId={jobId}
            onUpdate={refreshInvoices}
          />
        </>
      )}
    </div>
  );
};
