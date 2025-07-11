
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { EstimateUpsellStep } from "./estimate-builder/EstimateUpsellStep";
import { UniversalSendDialog } from "./shared/UniversalSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateNextId } from "@/utils/idGeneration";
import { useJobData } from "./unified/hooks/useJobData";
import { UpsellItem } from "./shared/types";
import { supabase } from "@/integrations/supabase/client";

interface SteppedEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingEstimate?: any;
  onEstimateCreated?: () => void;
}

type BuilderStep = "items" | "upsell" | "send";

export const SteppedEstimateBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingEstimate,
  onEstimateCreated
}: SteppedEstimateBuilderProps) => {
  const navigate = useNavigate();
  
  // Use the optimized useJobData hook instead of fetching all jobs
  const { clientInfo, jobAddress, loading: jobDataLoading } = useJobData(jobId);
  
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedEstimate, setSavedEstimate] = useState<any>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  const [estimateCreated, setEstimateCreated] = useState(false);

  // Create contactInfo object for compatibility - now loads much faster
  const contactInfo = {
    name: clientInfo?.name || 'Client',
    email: clientInfo?.email || '',
    phone: clientInfo?.phone || ''
  };
  
  const {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isSubmitting,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType: "estimate",
    existingDocument: existingEstimate,
    jobId,
    open
  });

  // Create job context for AI recommendations - now includes estimateId
  const jobContext = {
    job_type: existingEstimate?.job_type || 'General Service',
    service_category: existingEstimate?.service_category || 'Maintenance',
    job_value: calculateGrandTotal(),
    client_history: clientInfo,
    estimateId: savedEstimate?.id || existingEstimate?.id
  };

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep("items");
      setSavedEstimate(existingEstimate || null);
      setSelectedUpsells([]);
      setUpsellNotes("");
      setEstimateCreated(!!existingEstimate);
    }
  }, [open, existingEstimate]);

  // Generate estimate number if creating new - only once per session
  useEffect(() => {
    const generateEstimateNumber = async () => {
      if (open && !existingEstimate && !documentNumber) {
        try {
          const newNumber = await generateNextId('estimate');
          setDocumentNumber(newNumber);
          console.log('Generated new estimate number:', newNumber);
        } catch (error) {
          console.error("Error generating estimate number:", error);
          const fallbackNumber = `EST-${Date.now()}`;
          setDocumentNumber(fallbackNumber);
        }
      } else if (existingEstimate && !documentNumber) {
        // Set existing estimate number
        const existingNumber = existingEstimate.estimate_number || existingEstimate.number;
        if (existingNumber) {
          setDocumentNumber(existingNumber);
          console.log('Using existing estimate number:', existingNumber);
        }
      }
    };

    generateEstimateNumber();
  }, [open, existingEstimate]); // Removed documentNumber from dependencies to prevent regeneration

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the estimate");
      return;
    }

    if (!jobId) {
      toast.error("Job ID is required to save estimate");
      return;
    }

    if (typeof jobId !== 'string') {
      toast.error("Invalid job ID format");
      return;
    }
    
    try {
      console.log("💾 Saving estimate before continuing to upsell step...");
      
      // Always save the estimate, whether it's new or existing
      const estimate = await saveDocumentChanges();
      
      if (estimate) {
        setSavedEstimate(estimate);
        setEstimateCreated(true);
        console.log("✅ Estimate saved successfully:", estimate.id);
        toast.success("Estimate saved successfully!");
        
        // Move to upsell step
        setCurrentStep("upsell");
      } else {
        toast.error("Failed to save estimate. Please try again.");
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save estimate: " + (error.message || "Unknown error"));
    }
  };

  const handleUpsellContinue = async (upsells: UpsellItem[], notes: string) => {
    setSelectedUpsells(prev => [...prev, ...upsells]);
    setUpsellNotes(notes);
    
    // Don't add line items here since they're already saved in the upsell step
    // Just update notes if needed
    if (notes.trim() && savedEstimate?.id) {
      try {
        console.log("💾 Updating estimate notes...");
        const { error } = await supabase
          .from('estimates')
          .update({ notes: notes.trim() })
          .eq('id', savedEstimate.id);
          
        if (error) {
          console.error('Error updating notes:', error);
          toast.error('Failed to save notes');
          return;
        }
      } catch (error) {
        console.error("Failed to save notes:", error);
        toast.error("Failed to save notes");
        return;
      }
    }
    
    setCurrentStep("send");
  };

  const handleSaveAndSend = async () => {
    try {
      const savedEstimate = await saveDocumentChanges();
      if (savedEstimate && onEstimateCreated) {
        onEstimateCreated();
      }
      return savedEstimate !== null;
    } catch (error) {
      console.error("Error saving estimate:", error);
      return false;
    }
  };

  const handleSendSuccess = () => {
    onOpenChange(false);
    
    if (onEstimateCreated) {
      onEstimateCreated();
    }

    setTimeout(() => {
      navigate(`/jobs/${jobId}`, { 
        state: { activeTab: "estimates" },
        replace: true 
      });
    }, 100);
  };

  const handleSendCancel = () => {
    setCurrentStep("upsell");
  };

  const handleUpsellBack = () => {
    setCurrentStep("items");
  };

  const handleDialogClose = () => {
    if (currentStep === "send") {
      setCurrentStep("upsell");
    } else if (currentStep === "upsell") {
      setCurrentStep("items");
    } else {
      onOpenChange(false);
    }
  };

  // Function to save estimate without continuing (for cancel/close scenarios)
  const handleSaveForLater = async () => {
    if (lineItems.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.log("💾 Saving estimate for later...");
      await saveDocumentChanges();
      toast.success("Estimate saved as draft");
      onOpenChange(false);
      
      if (onEstimateCreated) {
        onEstimateCreated();
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
    }
  };

  // Step indicator logic matching invoice builder
  const steps = [
    { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
    { number: 2, title: "Additional Services", description: "Add warranties and extras" },
    { number: 3, title: "Send Estimate", description: "Review and send to client" }
  ];

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return lineItems.length > 0;
      case 2:
        return true; // Upsell step is always optional
      case 3:
        return false; // Send step is never "complete" until actually sent
      default:
        return false;
    }
  };

  const stepTitles = {
    items: existingEstimate ? "Edit Estimate" : "Create Estimate",
    upsell: "Enhance Your Service",
    send: "Send Estimate"
  };

  const currentStepNumber = currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;

  return (
    <>
      <Dialog open={open && currentStep !== "send"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                Step {currentStepNumber} of 3
              </span>
              {stepTitles[currentStep]}
              {documentNumber && <span className="text-sm text-muted-foreground">(#{documentNumber})</span>}
            </DialogTitle>
            
            {/* Step Indicator matching invoice builder */}
            <div className="flex items-center justify-start sm:justify-center space-x-4 py-4 overflow-x-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStepNumber === step.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : isStepComplete(step.number)
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                  }`}>
                    {isStepComplete(step.number) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  
                  <div className="ml-3 text-left">
                    <div className={`text-sm font-medium ${
                      currentStepNumber === step.number ? "text-primary" : "text-gray-500"
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="py-6">
            {currentStep === "items" && (
              <>
                <UnifiedItemsStep
                  documentType="estimate"
                  documentNumber={documentNumber}
                  lineItems={lineItems}
                  taxRate={taxRate}
                  notes={notes}
                  onLineItemsChange={setLineItems}
                  onTaxRateChange={setTaxRate}
                  onNotesChange={setNotes}
                  onAddProduct={handleAddProduct}
                  onRemoveLineItem={handleRemoveLineItem}
                  onUpdateLineItem={handleUpdateLineItem}
                  calculateSubtotal={calculateSubtotal}
                  calculateTotalTax={calculateTotalTax}
                  calculateGrandTotal={calculateGrandTotal}
                />

                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={lineItems.length > 0 ? handleSaveForLater : () => onOpenChange(false)}
                  >
                    {lineItems.length > 0 ? "Save for Later" : "Cancel"}
                  </Button>
                  
                  <Button 
                    onClick={handleSaveAndContinue}
                    disabled={isSubmitting || lineItems.length === 0}
                    className="gap-2"
                  >
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {currentStep === "upsell" && (
              <EstimateUpsellStep
                documentTotal={calculateGrandTotal()}
                onContinue={handleUpsellContinue}
                onBack={handleUpsellBack}
                existingUpsellItems={selectedUpsells}
                jobContext={jobContext}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Universal Send Dialog for estimates */}
      <UniversalSendDialog
        isOpen={currentStep === "send"}
        onClose={handleSendCancel}
        documentType="estimate"
        documentId={savedEstimate?.id || existingEstimate?.id || ''}
        documentNumber={savedEstimate?.estimate_number || savedEstimate?.number || documentNumber}
        total={calculateGrandTotal()}
        contactInfo={contactInfo}
        onSuccess={handleSendSuccess}
      />
    </>
  );
};
