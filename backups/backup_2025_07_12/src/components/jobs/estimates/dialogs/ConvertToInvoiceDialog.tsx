
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { Estimate } from "@/hooks/useEstimates";

interface ConvertToInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate?: Estimate;
  estimateNumber?: string;
  onConfirm: () => void;
}

export const ConvertToInvoiceDialog = ({
  open,
  onOpenChange,
  estimate,
  estimateNumber,
  onConfirm,
}: ConvertToInvoiceDialogProps) => {
  const [isConverting, setIsConverting] = useState(false);
  
  const handleConfirm = async () => {
    setIsConverting(true);
    try {
      await onConfirm();
    } finally {
      setIsConverting(false);
      onOpenChange(false);
    }
  };
  
  // Use either the estimate object or the direct estimateNumber prop
  const displayEstimateNumber = estimate?.estimate_number || estimateNumber;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert to Invoice</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to convert estimate {displayEstimateNumber} to an invoice?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This will create a new invoice with all the items from this estimate.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConverting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="gap-2" disabled={isConverting}>
            {isConverting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Convert to Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
