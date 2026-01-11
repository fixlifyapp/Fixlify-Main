import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { SteppedInvoiceBuilder } from "../dialogs/SteppedInvoiceBuilder";
import { UniversalSendDialog } from "../dialogs/shared/UniversalSendDialog";
import { UnifiedDocumentViewer } from "../dialogs/UnifiedDocumentViewer";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedPaymentDialog } from "../dialogs/UnifiedPaymentDialog";
import { useJobDetails } from "../context/JobDetailsContext";
import { executeDelayedRefresh } from "@/utils/refreshUtils";
import { DocumentListItem, DocumentRowActions } from "../shared";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const { invoices, isLoading, refreshInvoices } = useInvoices(jobId);
  const { estimates } = useEstimates(jobId);
  // Use context's clientInfo instead of separate useJobData hook
  const { refreshFinancials, clientInfo } = useJobDetails();
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const canAcceptPayment = (invoice: any) => {
    const status = invoice.status?.toLowerCase();
    return status === 'sent' || status === 'partial' || status === 'overdue' || status === 'draft' || status === 'unpaid';
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-7 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{invoices?.length || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Value</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{formatCurrency(totalInvoiceValue)}</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">{pendingPayment}</p>
        </div>
      </div>

      {/* Convert Estimates Section */}
      {convertibleEstimates.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm font-medium text-emerald-800 mb-3">
            {convertibleEstimates.length} approved estimate{convertibleEstimates.length !== 1 ? 's' : ''} ready to convert
          </p>
          <div className="space-y-2">
            {convertibleEstimates.map((estimate) => (
              <div key={estimate.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-100">
                <div>
                  <p className="font-medium text-slate-800">Estimate #{estimate.estimate_number}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(estimate.total)}</p>
                </div>
                <Button
                  size="sm"
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleConvertEstimate(estimate)}
                >
                  Convert
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices List */}
      <ProfessionalCard>
        <ProfessionalSectionHeader
          icon={FileText}
          title="Invoices"
          subtitle={invoices && invoices.length > 0 ? `${invoices.length} total` : undefined}
          action={
            <Button
              onClick={handleCreateInvoice}
              size="sm"
              className="h-8 bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create
            </Button>
          }
        />

        {(!invoices || invoices.length === 0) ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No invoices yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first invoice or convert an approved estimate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <DocumentListItem
                key={invoice.id}
                type="invoice"
                number={invoice.invoice_number}
                status={invoice.status}
                createdAt={invoice.created_at}
                dueDate={invoice.due_date}
                amount={invoice.total || 0}
                balance={invoice.balance}
                actions={
                  <DocumentRowActions
                    documentType="invoice"
                    status={invoice.status}
                    onView={() => handleViewInvoice(invoice)}
                    onEdit={() => handleEditInvoice(invoice)}
                    onSend={() => handleSendInvoice(invoice)}
                    onPay={canAcceptPayment(invoice) ? () => handlePayInvoice(invoice) : undefined}
                    onDelete={() => handleRemoveInvoice(invoice)}
                    isDeleting={isDeleting}
                  />
                }
              />
            ))}
          </div>
        )}
      </ProfessionalCard>

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
