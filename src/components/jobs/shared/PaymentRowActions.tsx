import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RotateCcw, Trash2, MoreHorizontal, Loader2 } from "lucide-react";

interface PaymentRowActionsProps {
  canRefund: boolean;
  onRefund: () => void;
  onDelete: () => void;
  isProcessing?: boolean;
}

export const PaymentRowActions = ({
  canRefund,
  onRefund,
  onDelete,
  isProcessing,
}: PaymentRowActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-slate-100"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          ) : (
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          )}
          <span className="sr-only">More actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {/* Refund action - amber */}
        {canRefund && (
          <>
            <DropdownMenuItem
              onClick={onRefund}
              disabled={isProcessing}
              className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refund
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Destructive action - red */}
        <DropdownMenuItem
          onClick={onDelete}
          disabled={isProcessing}
          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
