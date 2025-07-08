
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onInvoiceCreated: (invoice: any) => void;
}

const InvoiceBuilderDialog: React.FC<InvoiceBuilderDialogProps> = ({
  open,
  onOpenChange,
  jobId,
  onInvoiceCreated
}) => {
  const handleInvoiceCreate = (invoice: any) => {
    onInvoiceCreated(invoice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Invoice builder for job: {jobId}</p>
          {/* Invoice builder implementation */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceBuilderDialog;
