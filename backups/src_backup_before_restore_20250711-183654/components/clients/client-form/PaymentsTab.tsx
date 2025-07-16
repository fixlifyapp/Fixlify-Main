
import { Card } from "@/components/ui/card";
import { useClientPayments } from "./hooks/useClientPayments";
import { EmptyTabContent } from "./EmptyTabContent";
import { Loader, CreditCard, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PaymentMethod } from "@/types/payment";
import { Button } from "@/components/ui/button";

interface PaymentsTabProps {
  clientId?: string;
  onCreateInvoice: () => void;
}

export const PaymentsTab = ({ clientId, onCreateInvoice }: PaymentsTabProps) => {
  const { payments, isLoading, totalRevenue, paidInvoices, refreshPayments } = useClientPayments(clientId);
  const navigate = useNavigate();
  
  const handleViewJob = (jobId?: string) => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit-card":
        return <CreditCard size={16} className="text-blue-500" />;
      case "cash":
        return <DollarSign size={16} className="text-green-500" />;
      case "e-transfer":
        return <FileText size={16} className="text-purple-500" />; 
      case "cheque":
        return <FileText size={16} className="text-orange-500" />;
      default:
        return <CreditCard size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading payment history...</span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyTabContent 
        message="No payments found for this client. Payments will automatically sync from completed jobs."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-700">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-1">From {paidInvoices} paid invoices</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h3 className="text-sm font-medium text-green-900 mb-1">Payment History</h3>
            <p className="text-2xl font-bold text-green-700">{payments.length} payments</p>
            <p className="text-xs text-green-600 mt-1">Latest: {payments[0]?.payment_date ? new Date(payments[0].payment_date).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Date</th>
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Job</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Method</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/30">
                  <td className="py-3">
                    <div>{new Date(payment.payment_date).toLocaleDateString()}</div>
                    <div className="text-xs text-fixlyfy-text-secondary">
                      {formatDistanceToNow(new Date(payment.payment_date), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="py-3">{payment.invoice_number || 'N/A'}</td>
                  <td className="py-3">
                    {payment.job_title ? (
                      <span className="text-primary hover:underline cursor-pointer" onClick={() => handleViewJob(payment.job_id)}>
                        {payment.job_title}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 font-medium">${payment.amount.toFixed(2)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {getMethodIcon(payment.method)}
                      <span>{payment.method === 'credit-card' ? 'Credit Card' : 
                             payment.method === 'cash' ? 'Cash' : 
                             payment.method === 'e-transfer' ? 'E-transfer' : payment.method}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge 
                      className={
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : payment.status === 'refunded'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    >
                      {payment.status === 'paid' ? 'Completed' : 
                       payment.status === 'refunded' ? 'Refunded' : payment.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewJob(payment.job_id)}
                      className="h-8 text-xs"
                    >
                      View Job
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
