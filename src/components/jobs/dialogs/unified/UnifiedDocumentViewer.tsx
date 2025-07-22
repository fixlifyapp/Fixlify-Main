import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface UnifiedDocumentViewerProps {
  document: any;
  documentType: "estimate" | "invoice";
  jobId: string;
  onConvertToInvoice?: (estimate: any) => Promise<void>;
  onDocumentUpdated?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const UnifiedDocumentViewer = ({
  document,
  documentType,
  jobId,
  onConvertToInvoice,
  onDocumentUpdated,
  isOpen,
  onClose
}: UnifiedDocumentViewerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {documentType === "estimate" ? "Estimate" : "Invoice"} Viewer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Document viewer is loading...
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            {documentType === "estimate" && onConvertToInvoice && (
              <Button onClick={() => onConvertToInvoice(document)}>
                Convert to Invoice
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};