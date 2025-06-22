import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Trash2, RotateCcw } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { usePaymentActions } from "@/hooks/usePaymentActions";
import { UnifiedPaymentDialog } from "@/components/jobs/dialogs/UnifiedPaymentDialog";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency, roundToCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobDetails } from "./context/JobDetailsContext";
import { executeDelayedRefresh } from "@/utils/refreshUtils";

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
  const isMobile = useIsMobile();

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      'cash': 'bg-green-100 text-green-800',
      'credit-card': 'bg-blue-100 text-blue-800',
      'e-transfer': 'bg-purple-100 text-purple-800',
      'cheque': 'bg-orange-100 text-orange-800'
    };
    
    const methodMap = {
      'credit-card': 'Credit Card',
      'cash': 'Cash',
      'e-transfer': 'E-Transfer',
      'cheque': 'Cheque'
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {methodMap[method as keyof typeof methodMap] || method}
      </Badge>
    );
  };

  const getStatusBadge = (amount: number) => {
    if (amount < 0) {
      return <Badge className="bg-red-100 text-red-800">Refunded</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-green-600 break-all">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Refunded</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-red-600 break-all">{formatCurrency(totalRefunded)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Amount</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold break-all">{formatCurrency(netAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Payments ({payments.length})
            </CardTitle>
            <Button 
              onClick={handleAddPayment} 
              disabled={outstandingBalance <= 0}
              className={`w-full sm:w-auto ${isMobile ? 'h-11' : ''}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-medium">No payments yet</p>
              <p className="text-xs sm:text-sm">Record the first payment to get started</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <span className="font-medium text-sm sm:text-base break-all">{formatCurrency(Math.abs(payment.amount))}</span>
                      {getPaymentMethodBadge(payment.method)}
                      {getStatusBadge(payment.amount)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                      {payment.reference && <p className="break-words">Reference: {payment.reference}</p>}
                      {payment.notes && <p className="break-words">Notes: {payment.notes}</p>}
                      <p>Recorded {formatDistanceToNow(new Date(payment.created_at || payment.date), { addSuffix: true })}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'}`}>
                    {payment.amount > 0 && (
                      <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''} text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300`}
                        onClick={() => handleRefundPayment(payment.id)}
                        disabled={isProcessing}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Refund
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full h-11 justify-start' : ''} text-red-600 hover:text-red-700 border-red-200 hover:border-red-300`}
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
