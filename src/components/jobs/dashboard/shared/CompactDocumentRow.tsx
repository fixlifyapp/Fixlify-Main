import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Receipt,
  MoreHorizontal,
  Eye,
  Send,
  CreditCard,
  ArrowRightLeft,
  Trash2,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CompactDocumentRowProps {
  type: "estimate" | "invoice";
  number: string;
  status: string;
  amount: number;
  balance?: number;
  createdAt: string;
  onView: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onPay?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
}

export const CompactDocumentRow = ({
  type,
  number,
  status,
  amount,
  balance,
  createdAt,
  onView,
  onEdit,
  onSend,
  onPay,
  onConvert,
  onDelete
}: CompactDocumentRowProps) => {
  const Icon = type === "estimate" ? FileText : Receipt;

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200" },
    sent: { label: "Sent", className: "bg-blue-50 text-blue-600 border-blue-200" },
    approved: { label: "Approved", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-200" },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-500 border-slate-200" },
    paid: { label: "Paid", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    partial: { label: "Partial", className: "bg-amber-50 text-amber-600 border-amber-200" },
    overdue: { label: "Overdue", className: "bg-red-50 text-red-600 border-red-200" },
    unpaid: { label: "Unpaid", className: "bg-amber-50 text-amber-600 border-amber-200" },
    converted: { label: "Converted", className: "bg-slate-100 text-slate-500 border-slate-200" }
  };

  const currentStatus = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const canConvert = type === "estimate" && status?.toLowerCase() === "approved";
  const canPay = type === "invoice" && ["sent", "partial", "overdue", "unpaid", "draft"].includes(status?.toLowerCase());

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all group">
      {/* Left: Icon + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0",
          type === "estimate" ? "bg-slate-100" : "bg-blue-50"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            type === "estimate" ? "text-slate-600" : "text-blue-600"
          )} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">
              {number}
            </span>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", currentStatus.className)}
            >
              {currentStatus.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-700">{formatCurrency(amount)}</span>
            {balance !== undefined && balance > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-amber-600">Balance: {formatCurrency(balance)}</span>
              </>
            )}
            <span className="text-slate-300">|</span>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView} className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onSend && (
              <DropdownMenuItem onClick={onSend} className="cursor-pointer">
                <Send className="h-4 w-4 mr-2" />
                Send
              </DropdownMenuItem>
            )}
            {canPay && onPay && (
              <DropdownMenuItem onClick={onPay} className="cursor-pointer text-emerald-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </DropdownMenuItem>
            )}
            {canConvert && onConvert && (
              <DropdownMenuItem onClick={onConvert} className="cursor-pointer text-blue-600">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Convert to Invoice
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
