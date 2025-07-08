import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useJob } from '@/hooks/useJob';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Stepper, Step } from '@/components/ui/stepper';
import { Separator } from '@/components/ui/separator';
import { EstimateLineItem } from '@/types/estimate';
import { formatCurrency } from '@/lib/currency';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';

interface SteppedEstimateBuilderProps {
  jobId: string;
  onClose: () => void;
}

export function SteppedEstimateBuilder({ jobId, onClose }: SteppedEstimateBuilderProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [estimateName, setEstimateName] = useState('');
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([{ id: Date.now().toString(), description: '', quantity: 1, unit_price: 0 }]);
  const [currentEstimate, setCurrentEstimate] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const { jobData } = useJob(jobId);

  const createEstimate = useMutation(api.estimates.createEstimate);
  const updateEstimate = useMutation(api.estimates.updateEstimate);
  const getEstimateByJobId = useQuery(api.estimates.getEstimateByJobId, { jobId });

  useEffect(() => {
    if (getEstimateByJobId) {
      setCurrentEstimate(getEstimateByJobId);
      if (getEstimateByJobId?.line_items) {
        setLineItems(getEstimateByJobId.line_items);
      }
      if (getEstimateByJobId?.name) {
        setEstimateName(getEstimateByJobId.name);
      }
    }
  }, [getEstimateByJobId]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLineItemChange = (id: string, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return lineItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  };

  const handleSaveEstimate = async () => {
    try {
      if (currentEstimate) {
        // Update existing estimate
        await updateEstimate({
          id: currentEstimate._id,
          name: estimateName,
          lineItems: lineItems,
          jobId: jobId,
          total: calculateTotal()
        });
        toast.success('Estimate updated successfully!');
      } else {
        // Create a new estimate
        const result = await createEstimate({
          name: estimateName,
          lineItems: lineItems,
          jobId: jobId,
          total: calculateTotal()
        });

        if (result) {
          toast.success('Estimate created successfully!');
        } else {
          toast.error('Failed to create estimate.');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Estimate Builder</h2>

        <Stepper active={activeStep}>
          <Step title="Details" description="Set estimate name" />
          <Step title="Line Items" description="Add items to the estimate" />
          <Step title="Review" description="Review and send" />
        </Stepper>

        <Separator className="my-4" />

        {activeStep === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="estimate-name">Estimate Name</Label>
              <Input
                id="estimate-name"
                type="text"
                placeholder="Estimate Name"
                value={estimateName}
                onChange={(e) => setEstimateName(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-4">
            {lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2">
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Input
                    id={`description-${item.id}`}
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`unit_price-${item.id}`}>Unit Price</Label>
                  <Input
                    id={`unit_price-${item.id}`}
                    type="number"
                    placeholder="Unit Price"
                    value={item.unit_price}
                    onChange={(e) => handleLineItemChange(item.id, 'unit_price', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Button variant="destructive" size="icon" onClick={() => removeLineItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Line Item
            </Button>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Estimate Name</Label>
              <p className="font-semibold">{estimateName}</p>
            </div>
            <div>
              <Label>Line Items</Label>
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-3 gap-4">
                    <div>{item.description}</div>
                    <div>{item.quantity}</div>
                    <div>{formatCurrency(item.unit_price)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Total</Label>
              <p className="font-semibold">{formatCurrency(calculateTotal())}</p>
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button onClick={() => setShowSendDialog(true)}>Send Estimate</Button>
            </div>
          </div>
        )}
      </div>
      
      <UniversalSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        documentType="estimate"
        documentId={currentEstimate?.id}
        documentNumber={currentEstimate?.estimate_number}
        total={currentEstimate?.total || 0}
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
