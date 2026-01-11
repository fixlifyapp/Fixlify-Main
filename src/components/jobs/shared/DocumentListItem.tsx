import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileText, Receipt, Calendar, Clock } from "lucide-react";

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

// More vibrant, modern status styles
const statusStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  sent: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', dot: 'bg-violet-500' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
  converted: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', dot: 'bg-violet-500' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  partial: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
  overdue: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
  unpaid: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300', dot: 'bg-slate-400' },
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
  const Icon = type === 'estimate' ? FileText : Receipt;

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-200 hover:shadow-md hover:shadow-violet-50 transition-all duration-200">
      {isMobile ? (
        // Mobile Layout - Stacked
        <div className="space-y-3">
          {/* Top row: Icon + Number + Status + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                type === 'estimate' ? 'bg-violet-50' : 'bg-emerald-50'
              )}>
                <Icon className={cn(
                  "h-4.5 w-4.5",
                  type === 'estimate' ? 'text-violet-500' : 'text-emerald-500'
                )} />
              </div>
              <div>
                <span className="font-semibold text-slate-800">{number}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                  <span className={cn("text-xs font-medium", statusStyle.text)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            {actions}
          </div>

          {/* Bottom row: Date + Amount */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">{format(new Date(createdAt), 'MMM d, yyyy')}</span>
              </div>
              {dueDate && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">Due {format(new Date(dueDate), 'MMM d')}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(amount)}
              </div>
              {hasBalance && (
                <div className="text-sm font-semibold text-red-500 tabular-nums">
                  {formatCurrency(balance)} due
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Desktop Layout - Single row
        <div className="flex items-center gap-4">
          {/* Left: Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            type === 'estimate' ? 'bg-violet-50 group-hover:bg-violet-100' : 'bg-emerald-50 group-hover:bg-emerald-100',
            "transition-colors duration-200"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              type === 'estimate' ? 'text-violet-500' : 'text-emerald-500'
            )} />
          </div>

          {/* Middle: Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800">{number}</span>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
                statusStyle.bg, statusStyle.border, "border"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                <span className={cn("text-xs font-medium", statusStyle.text)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1 text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-sm">{format(new Date(createdAt), 'MMM d, yyyy')}</span>
              </div>
              {dueDate && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-sm">Due {format(new Date(dueDate), 'MMM d')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Amount + Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right min-w-[120px]">
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(amount)}
              </div>
              {hasBalance && (
                <div className="text-sm font-semibold text-red-500 tabular-nums">
                  {formatCurrency(balance)} due
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
