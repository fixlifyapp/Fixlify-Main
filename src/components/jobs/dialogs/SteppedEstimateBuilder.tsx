
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Eye, EyeOff, FileText } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { FinalizeAndSendStep } from "./estimate-builder/FinalizeAndSendStep";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateNextId } from "@/utils/idGeneration";
import { useJobData } from "./unified/hooks/useJobData";
import { useIsMobile } from "@/hooks/use-mobile";
import { UnifiedDocumentPreview } from "./unified/UnifiedDocumentPreview";
import { BillToSelector, BillToOption } from "./unified/components/BillToSelector";
import { cn } from "@/lib/utils";

interface SteppedEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingEstimate?: any;
  onEstimateCreated?: () => void;
}

type BuilderStep = "items" | "finalize";

export const SteppedEstimateBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingEstimate,
  onEstimateCreated
}: SteppedEstimateBuilderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Use the optimized useJobData hook instead of fetching all jobs
  const { clientInfo, jobAddress, propertyId, loading: jobDataLoading } = useJobData(jobId);

  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedEstimate, setSavedEstimate] = useState<any>(null);
  const [estimateCreated, setEstimateCreated] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [billToOption, setBillToOption] = useState<BillToOption | undefined>(undefined);

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
    saveDocumentChanges,
    refetchLineItems
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
      console.log("💾 Saving estimate before continuing to finalize step...");

      // Always save the estimate, whether it's new or existing
      const estimate = await saveDocumentChanges();

      if (estimate) {
        setSavedEstimate(estimate);
        setEstimateCreated(true);
        console.log("✅ Estimate saved successfully:", estimate.id);
        toast.success("Estimate saved successfully!");

        // Move directly to finalize & send step
        setCurrentStep("finalize");
      } else {
        toast.error("Failed to save estimate. Please try again.");
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save estimate: " + (error.message || "Unknown error"));
    }
  };

  const handleFinalizeSuccess = () => {
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

  const handleFinalizeBack = () => {
    // Refetch line items to get any upsells that were added in step 2
    const estimateId = savedEstimate?.id || existingEstimate?.id;
    if (estimateId) {
      refetchLineItems(estimateId, 'estimate');
    }
    setCurrentStep("items");
  };

  const handleDialogClose = () => {
    if (currentStep === "finalize") {
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

  // Step indicator logic - simplified 2-step flow
  const steps = [
    { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
    { number: 2, title: "Finalize & Send", description: "Review, add extras, and send to client" }
  ];

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return lineItems.length > 0;
      case 2:
        return false; // Finalize step is never "complete" until actually sent
      default:
        return false;
    }
  };

  const stepTitles = {
    items: existingEstimate ? "Edit Estimate" : "Create Estimate",
    finalize: "Finalize & Send"
  };

  // Calculate current step number - always 2 steps
  const currentStepNumber = currentStep === "items" ? 1 : 2;
  const totalSteps = 2;

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[98vw] max-w-[1600px] max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            {/* Compact Header with Step Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <DialogTitle className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  Step {currentStepNumber} of {totalSteps}
                </span>
                <span className="text-lg font-semibold">
                  {stepTitles[currentStep]}
                </span>
              </DialogTitle>
              {documentNumber && (
                <span className="text-sm text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                  #{documentNumber}
                </span>
              )}
            </div>

            {/* Compact Step Progress Bar */}
            <div className="flex items-center justify-center gap-2 py-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-semibold transition-all",
                      currentStepNumber === step.number
                        ? "border-violet-500 bg-violet-500 text-white shadow-sm shadow-violet-200"
                        : currentStepNumber > step.number || isStepComplete(step.number)
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    )}
                  >
                    {currentStepNumber > step.number || (isStepComplete(step.number) && currentStepNumber !== step.number) ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Step Label - Hidden on mobile */}
                  <span className={cn(
                    "ml-2 text-xs font-medium hidden sm:inline",
                    currentStepNumber === step.number
                      ? "text-violet-600"
                      : currentStepNumber > step.number
                      ? "text-emerald-600"
                      : "text-slate-400"
                  )}>
                    {step.title}
                  </span>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-8 sm:w-12 h-0.5 mx-2 rounded-full transition-colors",
                      currentStepNumber > step.number + 1
                        ? "bg-emerald-500"
                        : currentStepNumber > step.number
                        ? "bg-violet-500"
                        : "bg-slate-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="py-4 sm:py-6">
            {currentStep === "items" && (
              <>
                {/* Preview Toggle - visible on screens smaller than XL */}
                <div className="flex justify-end mb-4 xl:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobilePreview(!showMobilePreview)}
                    className="gap-2"
                  >
                    {showMobilePreview ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Preview
                      </>
                    )}
                  </Button>
                </div>

                {/* Split View Layout - Form left, Preview right on XL screens */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 items-start">
                  {/* Form Section - hidden on small screens when preview is shown */}
                  <div className={cn(
                    "block space-y-4",
                    showMobilePreview && "hidden xl:block"
                  )}>
                    {/* Bill To Selector - only show if there are multiple options */}
                    <BillToSelector
                      jobId={jobId}
                      clientId={clientInfo?.id}
                      propertyId={propertyId}
                      currentClient={clientInfo ? {
                        id: clientInfo.id || '',
                        name: clientInfo.name,
                        company: clientInfo.company,
                        type: (clientInfo as any)?.type,
                        address: (clientInfo as any)?.address,
                        city: (clientInfo as any)?.city,
                        state: (clientInfo as any)?.state,
                        zip: (clientInfo as any)?.zip,
                        email: clientInfo.email,
                        phone: clientInfo.phone
                      } : undefined}
                      onSelect={setBillToOption}
                      initialSelection={billToOption}
                    />

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
                  </div>

                  {/* Preview Section - Always visible on XL, toggle on smaller screens */}
                  <div className={cn(
                    "border rounded-lg bg-slate-50/50 overflow-hidden self-stretch flex flex-col",
                    showMobilePreview ? "block" : "hidden xl:block"
                  )}>
                    <div className="bg-slate-100 px-3 py-1.5 border-b flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Preview</span>
                    </div>
                    <div className="overflow-auto flex-1 p-2">
                      <div className="transform scale-[0.8] origin-top-left w-[125%]">
                        <UnifiedDocumentPreview
                          documentType="estimate"
                          documentNumber={documentNumber}
                          lineItems={lineItems}
                          taxRate={taxRate}
                          calculateSubtotal={calculateSubtotal}
                          calculateTotalTax={calculateTotalTax}
                          calculateGrandTotal={calculateGrandTotal}
                          notes={notes}
                          clientInfo={clientInfo}
                          jobId={jobId}
                          issueDate={new Date().toLocaleDateString()}
                          dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          billToOption={billToOption}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t mt-6">
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

            {currentStep === "finalize" && (
              <FinalizeAndSendStep
                documentId={savedEstimate?.id || existingEstimate?.id || ''}
                documentNumber={savedEstimate?.estimate_number || savedEstimate?.number || documentNumber}
                documentTotal={calculateGrandTotal()}
                onBack={handleFinalizeBack}
                onSuccess={handleFinalizeSuccess}
                contactInfo={contactInfo}
                jobContext={jobContext}
                existingNotes={notes}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
