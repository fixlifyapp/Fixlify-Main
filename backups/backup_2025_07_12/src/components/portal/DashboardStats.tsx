
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Clock } from "lucide-react";

interface DashboardStatsProps {
  totals: {
    totalEstimates: number;
    totalEstimateValue: number;
    totalInvoices: number;
    totalInvoiceValue: number;
    paidInvoices: number;
    paidValue: number;
    pendingInvoices: number;
  };
  formatCurrency: (amount: number) => string;
}

export const DashboardStats = ({ totals, formatCurrency }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-500">Total Estimates</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.totalEstimates}</div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">
                {formatCurrency(totals.totalEstimateValue)} total value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-500">Total Invoices</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.totalInvoices}</div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">
                {formatCurrency(totals.totalInvoiceValue)} total value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-500">Paid Invoices</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.paidInvoices}</div>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">
                {formatCurrency(totals.paidValue)} paid
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-500">Pending</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.pendingInvoices}</div>
              <div className="text-xs sm:text-sm text-orange-600 font-medium">
                Awaiting payment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
