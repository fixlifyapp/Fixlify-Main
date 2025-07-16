
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "@/hooks/useInvoices";

interface InvoicePreviewHeaderProps {
  invoice: Invoice;
}

export const InvoicePreviewHeader = ({ invoice }: InvoicePreviewHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DialogHeader className="flex-shrink-0 pb-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-6 w-6 text-blue-600" />
          <div>
            <DialogTitle className="text-xl">Invoice Preview</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-sm">
                {invoice.invoice_number}
              </Badge>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status || 'draft'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Amount</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(invoice.total || 0)}
          </div>
        </div>
      </div>
    </DialogHeader>
  );
};
