import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper/stepper';
import { useJob } from '@/hooks/useJob';
import { InvoiceForm } from '@/components/jobs/invoices/InvoiceForm';
import { useInvoice } from '@/hooks/useInvoice';
import { toast } from 'sonner';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/currency';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';

interface SteppedInvoiceBuilderProps {
  jobId: string;
  onClose: () => void;
}

export function SteppedInvoiceBuilder({ jobId, onClose }: SteppedInvoiceBuilderProps) {
  const [step, setStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState<Partial<Invoice>>({});
  const [showSendDialog, setShowSendDialog] = useState(false);
  const { job: jobData } = useJob(jobId);
  const { invoice: currentInvoice, createInvoice, updateInvoice } = useInvoice();

  useEffect(() => {
    if (currentInvoice) {
      setInvoiceData(currentInvoice);
    }
  }, [currentInvoice]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currentInvoice) {
        await updateInvoice(currentInvoice.id, invoiceData as Invoice);
        toast.success('Invoice updated successfully!');
      } else {
        if (!jobId) {
          toast.error('Job ID is required to create an invoice.');
          return;
        }
        await createInvoice(jobId, invoiceData as Invoice);
        toast.success('Invoice created successfully!');
      }
      setShowSendDialog(true);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save invoice.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>Create Invoice</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <Stepper step={step} steps={2} />

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  value={invoiceData.invoice_number || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  type="date"
                  id="invoice_date"
                  name="invoice_date"
                  value={invoiceData.invoice_date || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                type="text"
                id="notes"
                name="notes"
                value={invoiceData.notes || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Line Items</h3>
            <InvoiceForm
              invoiceId={currentInvoice?.id}
              onChange={(data) => setInvoiceData((prev) => ({ ...prev, line_items: data }))}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Save Invoice ({formatCurrency(currentInvoice?.total || 0)})
              </Button>
            </div>
          </div>
        )}
      
      <UniversalSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        documentType="invoice"
        documentId={currentInvoice?.id || ''}
        documentNumber={currentInvoice?.invoice_number || ''}
        total={currentInvoice?.total || 0}
        contactInfo={{
          name: jobData?.client?.name || '',
          email: jobData?.client?.email || '',
          phone: jobData?.client?.phone || ''
        }}
        onSuccess={() => {
          setShowSendDialog(false);
          onClose();
        }}
      />
    </Dialog>
  );
}
