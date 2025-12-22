import { useState } from "react";
import { ChevronDown, CreditCard, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency, cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  status?: string;
  invoice_number?: string;
  job_title?: string;
}

interface PaymentHistoryCardProps {
  payments: Payment[];
  totalCount: number;
  totalRevenue: number;
  clientId: string;
}

const getPaymentStatusIcon = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return <CheckCircle className="h-3 w-3 text-emerald-500" />;
    case 'pending':
      return <Clock className="h-3 w-3 text-amber-500" />;
    case 'failed':
    case 'cancelled':
      return <XCircle className="h-3 w-3 text-red-500" />;
    default:
      return <CheckCircle className="h-3 w-3 text-emerald-500" />;
  }
};

const getPaymentStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'failed':
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
};

const formatPaymentDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const PaymentHistoryCard = ({
  payments,
  totalCount,
  totalRevenue,
  clientId
}: PaymentHistoryCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between border-b border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Payment History</h3>
              <Badge variant="secondary" className="text-xs">
                {totalCount}
              </Badge>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Summary */}
          <div className="px-4 py-3 border-b border-border/50 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="text-lg font-bold text-emerald-600 tabular-nums">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>

          {payments.length > 0 ? (
            <>
              {/* Payments List */}
              <div className="divide-y divide-border/50">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="shrink-0">
                      {getPaymentStatusIcon(payment.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatPaymentDate(payment.payment_date)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {payment.invoice_number && (
                          <span>#{payment.invoice_number}</span>
                        )}
                        {payment.payment_method && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{payment.payment_method}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-xs capitalize border", getPaymentStatusStyle(payment.status))}
                    >
                      {payment.status || 'completed'}
                    </Badge>

                    <div className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              {totalCount > payments.length && (
                <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/finance?client=${clientId}`)}
                  >
                    View All Payments ({totalCount})
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No payments yet</p>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
