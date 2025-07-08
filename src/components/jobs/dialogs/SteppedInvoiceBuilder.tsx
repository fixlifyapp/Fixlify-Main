
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { InvoiceFormStep } from './invoice-builder/InvoiceFormStep';
import { InvoicePreviewStep } from './invoice-builder/InvoicePreviewStep';
import { InvoiceSendStep } from './invoice-builder/InvoiceSendStep';
import { useInvoiceBuilder } from '@/hooks/useInvoiceBuilder';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SteppedInvoiceBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  clientId?: string;
  estimateId?: string;
}

export function SteppedInvoiceBuilder({ 
  isOpen, 
  onClose, 
  jobId, 
  clientId, 
  estimateId 
}: SteppedInvoiceBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  
  const {
    invoiceData,
    updateInvoiceData,
    saveInvoice,
    isLoading
  } = useInvoiceBuilder(jobId);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobAndClientData();
    }
  }, [isOpen, jobId]);

  const fetchJobAndClientData = async () => {
    try {
      // Fetch job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJobData(job);

      // Fetch client data
      if (job.client_id) {
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', job.client_id)
          .single();

        if (clientError) throw clientError;
        setClientData(client);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load job data');
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice - Step {currentStep} of 3</DialogTitle>
        </DialogHeader>

        {currentStep === 1 && (
          <InvoiceFormStep
            invoiceData={invoiceData}
            onUpdate={updateInvoiceData}
            jobData={jobData}
            clientData={clientData}
            estimateId={estimateId}
          />
        )}

        {currentStep === 2 && (
          <InvoicePreviewStep
            invoiceData={invoiceData}
            jobData={jobData}
            clientData={clientData}
          />
        )}

        {currentStep === 3 && (
          <InvoiceSendStep
            invoiceData={invoiceData}
            jobData={jobData}
            clientData={clientData}
            onClose={handleClose}
          />
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
