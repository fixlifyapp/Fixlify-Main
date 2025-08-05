
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Payment } from "@/types/payment";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onRefund: (paymentId: string, notes?: string) => void;
}

export function RefundDialog({ 
  open, 
  onOpenChange, 
  payment, 
  onRefund 
}: RefundDialogProps) {
  const [notes, setNotes] = useState(payment.notes || "");

  const handleSubmit = () => {
    onRefund(payment.id, notes);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Refund</DialogTitle>
          <DialogDescription>
            Are you sure you want to refund this payment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm">Client:</div>
            <div className="text-sm font-medium">{payment.client?.name || 'Unknown Client'}</div>
            
            <div className="text-sm">Job #:</div>
            <div className="text-sm font-medium">#{payment.job_id || 'N/A'}</div>
            
            <div className="text-sm">Amount:</div>
            <div className="text-sm font-medium">{formatCurrency(payment.amount)}</div>
            
            <div className="text-sm">Payment Method:</div>
            <div className="text-sm font-medium capitalize">{payment.payment_method.replace("_", " ")}</div>
            
            {payment.reference_number && (
              <>
                <div className="text-sm">Reference:</div>
                <div className="text-sm font-medium">{payment.reference_number}</div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Refund Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for refund..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>
            Confirm Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
