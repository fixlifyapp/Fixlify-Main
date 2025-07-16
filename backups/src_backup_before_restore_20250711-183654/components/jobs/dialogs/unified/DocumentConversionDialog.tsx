
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Estimate } from "@/hooks/useEstimates";
import { formatCurrency } from "@/lib/utils";

interface DocumentConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate;
  onConvert: () => Promise<void>;
  isConverting: boolean;
}

export const DocumentConversionDialog = ({
  open,
  onOpenChange,
  estimate,
  onConvert,
  isConverting
}: DocumentConversionDialogProps) => {
  const handleConvert = async () => {
    await onConvert();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Convert to Invoice
          </DialogTitle>
          <DialogDescription>
            This will create a new invoice based on the current estimate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Estimate Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Estimate {estimate.estimate_number}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Total: {formatCurrency(estimate.total)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Created: {new Date(estimate.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Conversion Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium text-foreground">What will happen:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>New invoice will be created with invoice number</li>
                  <li>All line items will be copied to the invoice</li>
                  <li>Estimate status will be updated to "Converted"</li>
                  <li>Due date will be set to 30 days from today</li>
                  <li>All warranty selections will be preserved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConvert}
            disabled={isConverting}
            className="gap-2"
          >
            {isConverting ? (
              "Converting..."
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Convert to Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
