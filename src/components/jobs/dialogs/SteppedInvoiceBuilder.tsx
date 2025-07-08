import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InvoiceSendStep from './invoice-builder/InvoiceSendStep';

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
}

const SteppedInvoiceBuilder: React.FC<SteppedInvoiceBuilderProps> = ({
  open,
  onOpenChange,
  jobId
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [invoiceId, setInvoiceId] = useState<string>('');

  const handleSendComplete = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Invoice - Step {currentStep + 1}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {currentStep === 0 && (
            <div>
              <p>Step 1: Invoice Form</p>
              {/* Invoice form implementation */}
            </div>
          )}
          {currentStep === 1 && (
            <div>
              <p>Step 2: Invoice Preview</p>
              {/* Invoice preview implementation */}
            </div>
          )}
          {currentStep === 2 && invoiceId && (
            <InvoiceSendStep
              invoiceId={invoiceId}
              onSendComplete={handleSendComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SteppedInvoiceBuilder;
export { SteppedInvoiceBuilder };
