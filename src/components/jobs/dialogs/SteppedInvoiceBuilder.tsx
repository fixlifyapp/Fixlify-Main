
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import { InvoiceFormStep } from './invoice-builder/InvoiceFormStep';
import { InvoicePreviewStep } from './invoice-builder/InvoicePreviewStep';
import { InvoiceSendStep } from './invoice-builder/InvoiceSendStep';
import { useInvoiceBuilder } from '@/hooks/useInvoiceBuilder';

export interface SteppedInvoiceBuilderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onInvoiceCreated?: () => void;
}

const steps = [
  { title: 'Details', description: 'Invoice information' },
  { title: 'Preview', description: 'Review invoice' },
  { title: 'Send', description: 'Send to client' }
];

export const SteppedInvoiceBuilder: React.FC<SteppedInvoiceBuilderProps> = ({
  isOpen,
  onOpenChange,
  jobId,
  onInvoiceCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { invoiceData, updateInvoiceData, saveInvoice, isSaving } = useInvoiceBuilder(jobId);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  const handleSave = async () => {
    const success = await saveInvoice();
    if (success) {
      onInvoiceCreated?.();
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Stepper currentStep={currentStep} steps={steps} />

          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <InvoiceFormStep
                invoiceData={invoiceData}
                onUpdate={updateInvoiceData}
              />
            )}
            {currentStep === 1 && (
              <InvoicePreviewStep invoiceData={invoiceData} />
            )}
            {currentStep === 2 && (
              <InvoiceSendStep 
                invoiceId={invoiceData.id || ''}
                onClose={handleClose}
              />
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save & Send'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
