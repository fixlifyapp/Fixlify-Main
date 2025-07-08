
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useJob } from '@/hooks/useJob';
import { Stepper } from '@/components/ui/stepper';
import { EstimateFormStep } from './estimate-builder/EstimateFormStep';
import { EstimatePreviewStep } from './estimate-builder/EstimatePreviewStep';
import { EstimateSendStep } from './estimate-builder/EstimateSendStep';

export interface SteppedEstimateBuilderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onEstimateCreated?: () => void;
}

const steps = [
  { title: 'Details', description: 'Estimate information' },
  { title: 'Preview', description: 'Review estimate' },
  { title: 'Send', description: 'Send to client' }
];

export const SteppedEstimateBuilder: React.FC<SteppedEstimateBuilderProps> = ({
  isOpen,
  onOpenChange,
  jobId,
  onEstimateCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: job, isLoading } = useJob(jobId);

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

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Estimate</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Stepper currentStep={currentStep} steps={steps} />

          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <EstimateFormStep jobId={jobId} job={job} />
            )}
            {currentStep === 1 && (
              <EstimatePreviewStep jobId={jobId} />
            )}
            {currentStep === 2 && (
              <EstimateSendStep 
                jobId={jobId}
                onClose={handleClose}
                onEstimateCreated={onEstimateCreated}
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

            <Button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
