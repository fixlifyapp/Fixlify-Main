import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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

  // Get job and client data
  const { clientInfo, loading: jobLoading } = useJobData(jobId);

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
    saveDocumentChanges
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

        if (!invoiceError && invoice?.estimate_id) {
          // Check if estimate had warranties
          const { data: estimateLineItems, error: estimateError } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_id', invoice.estimate_id)
            .eq('parent_type', 'estimate');

          if (!estimateError && estimateLineItems) {
            const hasWarrantiesInEstimate = estimateLineItems.some((item: any) => 
              item.description?.toLowerCase().includes('warranty') ||
              item.description?.toLowerCase().includes('protection') ||
              item.description?.toLowerCase().includes('extended')
            );
            
            if (hasWarrantiesInEstimate) {
              setHasExistingWarranties(true);
              setIsCheckingWarranties(false);
              console.log('Warranties found in original estimate, skipping upsell step');
              return;
            }
          }
        }
        
        // Check if the invoice already contains warranty items
        const { data: invoiceLineItems, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoiceId)
          .eq('parent_type', 'invoice');

        if (!error && invoiceLineItems) {
          const hasWarranties = invoiceLineItems.some((item: any) => 
            item.description?.toLowerCase().includes('warranty') ||
            item.description?.toLowerCase().includes('protection') ||
            item.description?.toLowerCase().includes('extended')
          );
          setHasExistingWarranties(hasWarranties);
          if (hasWarranties) {
            console.log('Warranties found in invoice, skipping upsell step');
          }
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
        
        // Skip upsell step if warranties already exist
        if (hasExistingWarranties) {
          console.log("Warranties already exist, skipping to send step");
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

  // Update steps based on warranty status
  const getSteps = () => {
    if (hasExistingWarranties) {
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
    if (hasExistingWarranties) {
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
    if (hasExistingWarranties) {
      return currentStep === "items" ? 1 : 2;
    }
    return currentStep === "items" ? 1 : currentStep === "upsell" ? 2 : 3;
  };

  const currentStepNumber = getCurrentStepNumber();

  return (
    <>
      <Dialog open={open && currentStep !== "send" && currentStep !== "upsell"} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                Step {currentStepNumber} of {steps.length}
              </span>
              {stepTitles[currentStep]}
              {documentNumber && <span className="text-sm text-muted-foreground">(#{documentNumber})</span>}
              {hasExistingWarranties && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Warranty Included
                </span>
              )}
            </DialogTitle>
            
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
                    {isSubmitting ? "Saving..." : hasExistingWarranties ? "Save & Send" : "Save & Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upsell Step Dialog - only show if no existing warranties */}
      {!hasExistingWarranties && (
        <Dialog open={currentStep === "upsell"} onOpenChange={(open) => {
          if (!open) {
            setCurrentStep("items");
          }
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  Step 2 of 3
                </span>
                Enhance Your Invoice
                {documentNumber && <span className="text-sm text-muted-foreground">(#{documentNumber})</span>}
              </DialogTitle>
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
                onClick={() => setCurrentStep("items")}
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
