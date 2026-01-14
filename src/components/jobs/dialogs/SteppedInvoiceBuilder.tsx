import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, FileText } from "lucide-react";
import { UnifiedItemsStep } from "./unified/UnifiedItemsStep";
import { EstimateUpsellStep } from "./estimate-builder/EstimateUpsellStep";
import { UniversalSendDialog } from "./shared/UniversalSendDialog";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { UpsellItem } from "./shared/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useJobData } from "./unified/hooks/useJobData";
import { useUpsellSettings } from "@/hooks/useUpsellSettings";
import { UnifiedDocumentPreview } from "./unified/UnifiedDocumentPreview";
import { BillToSelector, BillToOption } from "./unified/components/BillToSelector";
import { cn } from "@/lib/utils";

interface SteppedInvoiceBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingInvoice?: Invoice;
  estimateToConvert?: Estimate;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

type BuilderStep = "items" | "upsell" | "send";

// Helper to check if a document is an estimate
const isEstimate = (doc: any): doc is Estimate => {
  return doc && ('estimate_number' in doc || 'valid_until' in doc);
};

export const SteppedInvoiceBuilder = ({
  open,
  onOpenChange,
  jobId,
  existingInvoice,
  estimateToConvert,
  onInvoiceCreated
}: SteppedInvoiceBuilderProps) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>("items");
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [upsellNotes, setUpsellNotes] = useState("");
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [hasExistingWarranties, setHasExistingWarranties] = useState(false);
  const [isCheckingWarranties, setIsCheckingWarranties] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Get job and client data
  const { clientInfo, propertyId, loading: jobLoading } = useJobData(jobId);

  // Bill To selection state
  const [billToOption, setBillToOption] = useState<BillToOption | undefined>(undefined);

  // Check if upsell step is enabled in admin settings
  const { isInvoiceUpsellEnabled } = useUpsellSettings();

  // Combined check: skip upsell if admin disabled OR warranties already exist
  const shouldSkipUpsell = !isInvoiceUpsellEnabled || hasExistingWarranties;

  // Use the unified document builder hook
  const {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    isSubmitting,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveDocumentChanges,
    refetchLineItems
  } = useUnifiedDocumentBuilder({
    documentType: "invoice",
    existingDocument: existingInvoice || estimateToConvert,
    jobId,
    open,
    onSyncToInvoice: undefined
  });

  // Check for existing warranties when we have an invoice
  useEffect(() => {
    const checkExistingWarranties = async () => {
      const invoiceId = savedInvoice?.id || existingInvoice?.id;
      if (!invoiceId) {
        setHasExistingWarranties(false);
        return;
      }

      setIsCheckingWarranties(true);
      try {
        // Check if this invoice was converted from an estimate
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('estimate_id')
          .eq('id', invoiceId)
          .single();

        const estimateId = invoice?.estimate_id;

        // OPTIMIZED: Single query to get both estimate and invoice line items
        // Instead of 2 separate queries, we use .or() filter to combine them
        let lineItemsQuery = supabase
          .from('line_items')
          .select('description, parent_type');

        if (!invoiceError && estimateId) {
          // Get both estimate and invoice line items in one query
          lineItemsQuery = lineItemsQuery.or(
            `and(parent_id.eq.${estimateId},parent_type.eq.estimate),and(parent_id.eq.${invoiceId},parent_type.eq.invoice)`
          );
        } else {
          // Only get invoice line items
          lineItemsQuery = lineItemsQuery
            .eq('parent_id', invoiceId)
            .eq('parent_type', 'invoice');
        }

        const { data: allLineItems, error } = await lineItemsQuery;

        if (!error && allLineItems) {
          // Check for warranty keywords in any line item (estimate or invoice)
          const hasWarranties = allLineItems.some((item: any) =>
            item.description?.toLowerCase().includes('warranty') ||
            item.description?.toLowerCase().includes('protection') ||
            item.description?.toLowerCase().includes('extended')
          );
          setHasExistingWarranties(hasWarranties);
        }
      } catch (error) {
        console.error('Error checking existing warranties:', error);
        setHasExistingWarranties(false);
      } finally {
        setIsCheckingWarranties(false);
      }
    };

    if (open && (savedInvoice?.id || existingInvoice?.id)) {
      checkExistingWarranties();
    }
  }, [open, savedInvoice?.id, existingInvoice?.id]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (existingInvoice) {
        setInvoiceCreated(true);
        setSavedInvoice(existingInvoice);
      } else if (estimateToConvert) {
        // The unified hook will handle estimate conversion
        setInvoiceCreated(false);
        setSavedInvoice(null);
        console.log("Initializing invoice from estimate:", estimateToConvert.id);
        
        // Check if estimate already has warranties
        checkEstimateForWarranties(estimateToConvert.id);
      }
      setCurrentStep("items");
      setSelectedUpsells([]);
      setUpsellNotes("");
    }
  }, [open, existingInvoice, estimateToConvert]);

  // Helper function to check if estimate has warranties
  const checkEstimateForWarranties = async (estimateId: string) => {
    try {
      const { data: lineItems } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');

      if (lineItems) {
        const hasWarranties = lineItems.some((item: any) => 
          item.description?.toLowerCase().includes('warranty') ||
          item.description?.toLowerCase().includes('protection') ||
          item.description?.toLowerCase().includes('extended')
        );
        
        if (hasWarranties) {
          setHasExistingWarranties(true);
          console.log('Warranties found in estimate, will skip upsell step');
        }
      }
    } catch (error) {
      console.error('Error checking estimate warranties:', error);
    }
  };

  const handleSaveAndContinue = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    try {
      console.log("💾 Saving invoice before continuing...");
      
      const invoice = await saveDocumentChanges();
      
      if (invoice) {
        setSavedInvoice(invoice as Invoice);
        setInvoiceCreated(true);
        console.log("✅ Invoice saved successfully:", invoice.id);
        toast.success("Invoice saved successfully!");
        
        // Skip upsell step if disabled by admin OR warranties already exist
        if (shouldSkipUpsell) {
          console.log("Skipping upsell step (disabled or warranties exist)");
          setCurrentStep("send");
        } else {
          setCurrentStep("upsell");
        }
      } else {
        toast.error("Failed to save invoice. Please try again.");
        return;
      }
    } catch (error: any) {
      console.error("Error in handleSaveAndContinue:", error);
      toast.error("Failed to save invoice: " + (error.message || "Unknown error"));
    }
  };

  const handleUpsellContinue = async (upsells: UpsellItem[], notes: string) => {
    setSelectedUpsells(prev => [...prev, ...upsells]);
    setUpsellNotes(notes);
    
    if (notes.trim() && savedInvoice?.id) {
      try {
        console.log("💾 Updating invoice notes...");
        const { error } = await supabase
          .from('invoices')
          .update({ notes: notes.trim() })
          .eq('id', savedInvoice.id);
          
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

  const handleDialogClose = () => {
    // Only close dialog if user is on first step or explicitly wants to close
    if (currentStep === "items") {
      onOpenChange(false);
    }
    // For other steps, user should use navigation buttons
  };

  const handleSendDialogClose = () => {
    // Don't change step when closing send dialog - stay on send step
    // User can use back button to go to previous step if needed
  };

  const handleSendSuccess = () => {
    // Close the entire dialog after successful send
    if (onInvoiceCreated && savedInvoice) {
      onInvoiceCreated(savedInvoice);
    }
    onOpenChange(false);
  };

  const handleSaveForLater = async () => {
    if (lineItems.length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.log("💾 Saving invoice for later...");
      const invoice = await saveDocumentChanges();
      if (invoice) {
        toast.success("Invoice saved as draft");
        onOpenChange(false);
        
        if (onInvoiceCreated) {
          onInvoiceCreated(invoice as Invoice);
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  const getClientInfo = () => {
    if (clientInfo) {
      return {
        name: clientInfo.name || '',
        email: clientInfo.email || '',
        phone: clientInfo.phone || ''
      };
    }
    return { name: '', email: '', phone: '' };
  };

  // Get the current invoice ID for the send dialog
  const getCurrentInvoiceId = () => {
    // Always prefer savedInvoice (newly created) over existingInvoice
    return savedInvoice?.id || existingInvoice?.id || '';
  };

  // Update steps based on upsell settings and warranty status
  const getSteps = () => {
    if (shouldSkipUpsell) {
      return [
        { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
        { number: 2, title: "Send Invoice", description: "Review and send to client" }
      ];
    }
    return [
      { number: 1, title: "Items & Pricing", description: "Add line items and set pricing" },
      { number: 2, title: "Additional Services", description: "Add warranties and extras" },
      { number: 3, title: "Send Invoice", description: "Review and send to client" }
    ];
  };

  const steps = getSteps();

  const isStepComplete = (stepNumber: number) => {
    if (shouldSkipUpsell) {
      switch (stepNumber) {
        case 1:
          return lineItems.length > 0;
        case 2:
          return false;
        default:
          return false;
      }
    } else {
      switch (stepNumber) {
        case 1:
          return lineItems.length > 0;
        case 2:
          return true;
        case 3:
          return false;
        default:
          return false;
      }
    }
  };

  const stepTitles = {
    items: existingInvoice ? "Edit Invoice" : "Create Invoice",
    upsell: "Enhance Your Invoice",
    send: "Send Invoice"
  };

  const getCurrentStepNumber = () => {
    if (shouldSkipUpsell) {
      return currentStep === "items" ? 1 : 2;
    }
    return currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;
  };

  const currentStepNumber = getCurrentStepNumber();

  return (
    <>
      <Dialog open={open && currentStep !== "send" && currentStep !== "upsell"} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[98vw] max-w-[1600px] max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            {/* Compact Header with Step Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <DialogTitle className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  Step {currentStepNumber} of {steps.length}
                </span>
                <span className="text-lg font-semibold">
                  {stepTitles[currentStep]}
                </span>
                {shouldSkipUpsell && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {hasExistingWarranties ? "Warranty Included" : "Quick Mode"}
                  </span>
                )}
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
                        ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-200"
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
                      ? "text-blue-600"
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
                        ? "bg-blue-500"
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
                    {/* Bill To Selector */}
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
                      documentType="invoice"
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
                          documentType="invoice"
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
                    {isSubmitting ? "Saving..." : shouldSkipUpsell ? "Save & Send" : "Save & Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upsell Step Dialog - only show if upsell is enabled and no existing warranties */}
      {!shouldSkipUpsell && (
        <Dialog open={currentStep === "upsell"} onOpenChange={(open) => {
          if (!open) {
            setCurrentStep("items");
          }
        }}>
          <DialogContent className="w-[98vw] max-w-[1600px] max-h-[92vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <DialogTitle className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    Step 2 of 3
                  </span>
                  <span className="text-lg font-semibold">Enhance Your Invoice</span>
                </DialogTitle>
                {documentNumber && (
                  <span className="text-sm text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                    #{documentNumber}
                  </span>
                )}
              </div>
            </DialogHeader>
            
            <div className="py-6">
              <EstimateUpsellStep
                documentTotal={calculateGrandTotal()}
                onContinue={handleUpsellContinue}
                onBack={() => setCurrentStep("items")}
                existingUpsellItems={selectedUpsells}
                jobContext={{
                  job_type: 'General Service',
                  service_category: 'Maintenance',
                  job_value: calculateGrandTotal(),
                  client_history: clientInfo,
                  invoiceId: savedInvoice?.id || existingInvoice?.id
                }}
              />
            </div>
            
            {/* Navigation buttons for upsell step */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  // Refetch line items to get any upsells that were added
                  const invoiceId = savedInvoice?.id || existingInvoice?.id;
                  if (invoiceId) {
                    refetchLineItems(invoiceId, 'invoice');
                  }
                  setCurrentStep("items");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Items
              </Button>
              
              <Button 
                onClick={() => setCurrentStep("send")}
                className="gap-2"
              >
                Continue to Send
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Universal Send Dialog */}
      <UniversalSendDialog
        isOpen={currentStep === "send"}
        onClose={handleSendDialogClose}
        documentType="invoice"
        documentId={getCurrentInvoiceId()}
        documentNumber={documentNumber}
        total={calculateGrandTotal()}
        contactInfo={getClientInfo()}
        onSuccess={handleSendSuccess}
      />
    </>
  );
};
