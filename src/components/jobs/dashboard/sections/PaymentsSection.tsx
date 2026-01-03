import { SectionCard, SectionHeader, EmptyState, StatCard } from "../shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Plus, MoreHorizontal, RotateCcw, Trash2, TrendingUp, Banknote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  created_at?: string;
}

interface PaymentsSectionProps {
  payments: Payment[];
  totalPaid: number;
  totalRefunded: number;
  netAmount: number;
  outstandingBalance: number;
  isLoading?: boolean;
  onRecordPayment: () => void;
  onRefundPayment?: (paymentId: string) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export const PaymentsSection = ({
  payments,
  totalPaid,
  totalRefunded,
  netAmount,
  outstandingBalance,
  isLoading,
  onRecordPayment,
  onRefundPayment,
  onDeletePayment
}: PaymentsSectionProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      'credit-card': 'Card',
      'cash': 'Cash',
      'e-transfer': 'E-Transfer',
      'cheque': 'Cheque'
    };
    return methodMap[method] || method;
  };

  if (isLoading) {
    return (
      <SectionCard>
        <SectionHeader icon={CreditCard} title="Payments" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={CreditCard}
        title="Payments"
        subtitle={payments.length > 0 ? `${payments.length} recorded` : undefined}
        action={
          <Button
            size="sm"
            onClick={onRecordPayment}
            disabled={outstandingBalance <= 0}
            className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Record
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard
          icon={TrendingUp}
          label="Received"
          value={formatCurrency(totalPaid)}
          variant="success"
          className="p-2"
        />
        <StatCard
          icon={Banknote}
          label="Refunded"
          value={formatCurrency(totalRefunded)}
          variant={totalRefunded > 0 ? "danger" : "default"}
          className="p-2"
        />
        <StatCard
          icon={CreditCard}
          label="Net"
          value={formatCurrency(netAmount)}
          variant="default"
          className="p-2"
        />
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Record the first payment to get started"
        />
      ) : (
        <div className="space-y-2">
          {payments.slice(0, 4).map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 h-5 font-medium",
                    payment.amount < 0
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}
                >
                  {payment.amount < 0 ? "Refund" : "Paid"}
                </Badge>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">
                      {formatCurrency(Math.abs(payment.amount))}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {getMethodLabel(payment.method)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDistanceToNow(new Date(payment.created_at || payment.date), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {payment.amount > 0 && onRefundPayment && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onRefundPayment(payment.id)}
                        className="cursor-pointer text-amber-600 text-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Refund
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {onDeletePayment && (
                    <DropdownMenuItem
                      onClick={() => onDeletePayment(payment.id)}
                      className="cursor-pointer text-red-600 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {payments.length > 4 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-slate-500 hover:text-slate-700"
              >
                View all {payments.length} payments
              </Button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};
