
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InvoiceFormStep } from "./invoice/InvoiceFormStep";
import { InvoicePreviewStep } from "./invoice/InvoicePreviewStep";
import { InvoicePaymentStep } from "./invoice/InvoicePaymentStep";

interface InvoiceFormProps {
  jobId: string;
  onClose: () => void;
}

export const InvoiceForm = ({ jobId, onClose }: InvoiceFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    items: [],
    notes: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const steps = [
    { title: "Invoice Details", component: InvoiceFormStep },
    { title: "Preview", component: InvoicePreviewStep },
    { title: "Payment", component: InvoicePaymentStep }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePayment = async (amount: number, method: string, reference?: string, notes?: string) => {
    // Handle payment recording logic here
    console.log("Recording payment:", { amount, method, reference, notes });
    // You would typically call an API to record the payment
  };

  const handleSendInvoice = () => {
    // Handle invoice sending logic here
    console.log("Sending invoice:", formData);
    // You would typically call an API to send the invoice
  };

  // Calculate invoice total for the payment step
  const calculateTotal = () => {
    return formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) { // Invoice Form Step
      return (
        <InvoiceFormStep
          formData={formData}
          onFormDataChange={handleFormDataChange}
          jobId={jobId}
        />
      );
    }
    
    if (currentStep === 1) { // Preview Step
      return (
        <InvoicePreviewStep
          formData={formData}
          jobId={jobId}
        />
      );
    }
    
    if (currentStep === 2) { // Payment Step
      const invoiceData = {
        ...formData,
        total: calculateTotal()
      };
      
      return (
        <InvoicePaymentStep
          invoice={invoiceData}
          onPayment={handlePayment}
          onSendInvoice={handleSendInvoice}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create Invoice</h2>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <Tabs value={currentStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {steps.map((step, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  disabled={index > currentStep}
                  className="text-sm"
                >
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
