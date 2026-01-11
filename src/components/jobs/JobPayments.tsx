import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, TrendingUp, Banknote } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { usePaymentActions } from "@/hooks/usePaymentActions";
import { UnifiedPaymentDialog } from "@/components/jobs/dialogs/UnifiedPaymentDialog";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency, roundToCurrency } from "@/lib/utils";
import { useJobDetails } from "./context/JobDetailsContext";
import { executeDelayedRefresh } from "@/utils/refreshUtils";
import { PaymentRowActions } from "./shared/PaymentRowActions";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

interface JobPaymentsProps {
  jobId: string;
}

export const JobPayments = ({ jobId }: JobPaymentsProps) => {
  const { payments, isLoading, totalPaid, totalRefunded, netAmount, refreshPayments } = usePayments(jobId);
  const { invoices, refreshInvoices } = useInvoices(jobId);
  const { refundPayment, deletePayment, isProcessing } = usePaymentActions(jobId, refreshPayments);
  const { refreshFinancials } = useJobDetails();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const getMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      'credit-card': 'Card',
      'cash': 'Cash',
      'e-transfer': 'E-Transfer',
      'cheque': 'Cheque'
    };
    return methodMap[method] || method;
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      await refundPayment(paymentId);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      await deletePayment(paymentId);
    }
  };

  const handleAddPayment = () => {
    // Find the first unpaid or partially paid invoice
    const unpaidInvoice = invoices.find(inv => inv.balance > 0);
    
    if (!unpaidInvoice) {
      return;
    }

    setSelectedInvoice(unpaidInvoice);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    console.log('Payment success callback triggered in JobPayments');
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
    
    // Use utility to handle all refreshes with proper delays
    executeDelayedRefresh({
      payments: refreshPayments,
      invoices: refreshInvoices,
      financials: refreshFinancials
    });
  };

  // Calculate outstanding balance with proper rounding
  const outstandingBalance = roundToCurrency(invoices.reduce((sum, invoice) => sum + (invoice.balance || 0), 0));

  return (
    <div className="space-y-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-emerald-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Received</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <Banknote className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Refunded</span>
          </div>
          <p className="text-2xl font-bold text-red-700 tabular-nums">{formatCurrency(totalRefunded)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-slate-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Net</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{formatCurrency(netAmount)}</p>
        </div>
      </div>

      {/* Payments List */}
      <ProfessionalCard>
        <ProfessionalSectionHeader
          icon={CreditCard}
          title="Payments"
          subtitle={payments.length > 0 ? `${payments.length} total` : undefined}
          action={
            <Button
              onClick={handleAddPayment}
              disabled={outstandingBalance <= 0}
              size="sm"
              className="h-8 bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Record
            </Button>
          }
        />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 mx-auto"></div>
            <p className="mt-3 text-sm text-slate-500">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No payments yet</p>
            <p className="text-xs text-slate-400 mt-1">Record the first payment to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {/* Left side - Status and amount */}
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant="outline"
                    className={
                      payment.amount < 0
                        ? "bg-red-50 text-red-700 border-red-200 text-xs"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                    }
                  >
                    {payment.amount < 0 ? "Refund" : "Paid"}
                  </Badge>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(Math.abs(payment.amount))}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        {getMethodLabel(payment.method)}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recorded {formatDistanceToNow(new Date(payment.created_at || payment.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Right side - Actions dropdown */}
                <PaymentRowActions
                  canRefund={payment.amount > 0}
                  onRefund={() => handleRefundPayment(payment.id)}
                  onDelete={() => handleDeletePayment(payment.id)}
                  isProcessing={isProcessing}
                />
              </div>
            ))}
          </div>
        )}
      </ProfessionalCard>

      {/* Unified Payment Dialog */}
      {selectedInvoice && (
        <UnifiedPaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            console.log('Closing payment dialog manually in JobPayments');
            setShowPaymentDialog(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          jobId={jobId}
          onPaymentAdded={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
