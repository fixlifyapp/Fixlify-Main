import { SectionCard, SectionHeader, StatCard } from "../shared";
import { DollarSign, FileText, CreditCard, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialSummaryCardProps {
  invoiceAmount: number;
  totalPaid: number;
  balance: number;
  overdueAmount?: number;
  isLoading?: boolean;
}

export const FinancialSummaryCard = ({
  invoiceAmount,
  totalPaid,
  balance,
  overdueAmount = 0,
  isLoading
}: FinancialSummaryCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return (
      <SectionCard>
        <SectionHeader icon={DollarSign} title="Financials" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 animate-pulse">
              <div className="h-3 w-12 bg-slate-200 rounded mb-2" />
              <div className="h-5 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionHeader icon={DollarSign} title="Financial Summary" />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={FileText}
          label="Invoiced"
          value={formatCurrency(invoiceAmount)}
          variant="default"
        />

        <StatCard
          icon={CreditCard}
          label="Received"
          value={formatCurrency(totalPaid)}
          variant="success"
        />

        <StatCard
          icon={balance > 0 ? AlertCircle : CreditCard}
          label={balance > 0 ? "Balance" : "Status"}
          value={balance > 0 ? formatCurrency(balance) : "Paid"}
          variant={balance > 0 ? (overdueAmount > 0 ? "danger" : "warning") : "success"}
        />
      </div>

      {overdueAmount > 0 && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-xs font-medium text-red-700">
            {formatCurrency(overdueAmount)} overdue
          </span>
        </div>
      )}
    </SectionCard>
  );
};
