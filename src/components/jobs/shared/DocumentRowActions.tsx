import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye, Edit, Send, DollarSign, CreditCard, Trash2, MoreHorizontal, Loader2
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentRowActionsProps {
  documentType: 'estimate' | 'invoice';
  status: string;
  onView: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onConvert?: () => void;
  onPay?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isConverting?: boolean;
}

export const DocumentRowActions = ({
  documentType,
  status,
  onView,
  onEdit,
  onSend,
  onConvert,
  onPay,
  onDelete,
  isDeleting,
  isConverting,
}: DocumentRowActionsProps) => {
  const isMobile = useIsMobile();

  const showConvert = documentType === 'estimate' && status !== 'converted';
  const showPay = documentType === 'invoice' && onPay;

  return (
    <div className="flex items-center gap-2">
      {/* Primary Action - View (hidden on mobile, in dropdown) */}
      {!isMobile && (
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200 hover:border-violet-300"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          View
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* View on mobile */}
          {isMobile && (
            <DropdownMenuItem onClick={onView} className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
          )}

          {onEdit && (
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}

          {onSend && (
            <DropdownMenuItem onClick={onSend} className="cursor-pointer">
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </DropdownMenuItem>
          )}

          {(showConvert || showPay) && <DropdownMenuSeparator />}

          {/* Positive actions - emerald */}
          {showConvert && onConvert && (
            <DropdownMenuItem
              onClick={onConvert}
              disabled={isConverting}
              className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
            >
              {isConverting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Convert to Invoice
            </DropdownMenuItem>
          )}

          {showPay && (
            <DropdownMenuItem
              onClick={onPay}
              className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </DropdownMenuItem>
          )}

          {onDelete && <DropdownMenuSeparator />}

          {/* Destructive action - red */}
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
