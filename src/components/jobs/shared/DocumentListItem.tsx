import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentListItemProps {
  type: 'estimate' | 'invoice';
  number: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  amount: number;
  balance?: number;
  actions: React.ReactNode;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-700 border-slate-300',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  converted: 'bg-slate-100 text-slate-500 border-slate-300',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  unpaid: 'bg-slate-50 text-slate-600 border-slate-300',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-300',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export const DocumentListItem = ({
  type,
  number,
  status,
  createdAt,
  dueDate,
  amount,
  balance,
  actions,
}: DocumentListItemProps) => {
  const isMobile = useIsMobile();
  const statusStyle = statusStyles[status.toLowerCase()] || statusStyles.draft;
  const hasBalance = balance !== undefined && balance > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all">
      {isMobile ? (
        // Mobile Layout - Stacked
        <div className="space-y-3">
          {/* Top row: Status + Number + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs font-medium", statusStyle)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <span className="font-semibold text-slate-800">{number}</span>
            </div>
            {actions}
          </div>

          {/* Bottom row: Date + Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {format(new Date(createdAt), 'MMM d, yyyy')}
              {dueDate && (
                <span className="ml-2 text-slate-400">
                  Due: {format(new Date(dueDate), 'MMM d')}
                </span>
              )}
            </span>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">
                {formatCurrency(amount)}
              </div>
              {hasBalance && (
                <div className="text-sm font-medium text-red-600">
                  Due: {formatCurrency(balance)}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Desktop Layout - Single row
        <div className="flex items-center justify-between gap-4">
          {/* Left: Status + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Badge variant="outline" className={cn("text-xs font-medium shrink-0", statusStyle)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-800">{number}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm">
                {format(new Date(createdAt), 'MMM d, yyyy')}
              </span>
              {dueDate && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm text-slate-500">
                    Due: {format(new Date(dueDate), 'MMM d')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Amount + Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right min-w-[100px]">
              <div className="text-lg font-bold text-slate-900">
                {formatCurrency(amount)}
              </div>
              {hasBalance && (
                <div className="text-sm font-medium text-red-600">
                  Due: {formatCurrency(balance)}
                </div>
              )}
            </div>
            {actions}
          </div>
        </div>
      )}
    </div>
  );
};
