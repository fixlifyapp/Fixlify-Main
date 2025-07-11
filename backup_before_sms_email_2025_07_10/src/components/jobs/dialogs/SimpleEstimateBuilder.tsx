
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Save, Lightbulb, X } from "lucide-react";
import { LineItemsManager } from "./unified/LineItemsManager";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Estimate } from "@/hooks/useEstimates";
import { Product } from "../builder/types";

interface SimpleEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  clientInfo?: any;
  onEstimateCreated?: (estimate: Estimate) => void;
  existingEstimate?: Estimate;
}

export const SimpleEstimateBuilder = ({
  open,
  onOpenChange,
  jobId,
  clientInfo,
  onEstimateCreated,
  existingEstimate
}: SimpleEstimateBuilderProps) => {
  const [showWarrantyNotification, setShowWarrantyNotification] = useState(false);
  const [suggestedWarranty, setSuggestedWarranty] = useState<Product | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId);

  const {
    lineItems,
    taxRate,
    notes,
    documentNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType: "estimate",
    existingDocument: existingEstimate,
    jobId,
    open,
  });

  const finalClientInfo = clientInfo || job?.client || { name: '', email: '', phone: '' };

  // Smart warranty detection
  useEffect(() => {
    if (lineItems.length > 0 && !showWarrantyNotification) {
      // Check if any line items suggest warranty need
      const hasRepairItems = lineItems.some(item => 
        item.description.toLowerCase().includes('repair') ||
        item.description.toLowerCase().includes('fix') ||
        item.description.toLowerCase().includes('install') ||
        item.description.toLowerCase().includes('replace')
      );

      const hasWarranty = lineItems.some(item =>
        item.description.toLowerCase().includes('warranty')
      );

      if (hasRepairItems && !hasWarranty) {
        // Suggest appropriate warranty based on total amount
        const total = calculateGrandTotal();
        let warranty: Product;

        if (total > 500) {
          warranty = {
            id: "prod-5",
            name: "2-Year Warranty",
            description: "2-year comprehensive warranty package",
            category: "Warranties",
            price: 149,
            ourPrice: 0,
            ourprice: 0,
            cost: 0,
            taxable: false,
            tags: ["warranty", "protection"]
          };
        } else if (total > 200) {
          warranty = {
            id: "prod-4",
            name: "1-Year Warranty",
            description: "1-year extended warranty with priority service",
            category: "Warranties",
            price: 89,
            ourPrice: 0,
            ourprice: 0,
            cost: 0,
            taxable: false,
            tags: ["warranty", "protection"]
          };
        } else {
          warranty = {
            id: "prod-3",
            name: "6-Month Warranty",
            description: "Extended warranty covering parts and labor",
            category: "Warranties",
            price: 49,
            ourPrice: 0,
            ourprice: 0,
            cost: 0,
            taxable: false,
            tags: ["warranty", "protection"]
          };
        }

        setSuggestedWarranty(warranty);
        setShowWarrantyNotification(true);
      }
    }
  }, [lineItems, calculateGrandTotal, showWarrantyNotification]);

  // Auto-save functionality
  useEffect(() => {
    if (lineItems.length > 0 || notes) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          await saveDocumentChanges();
          console.log("Auto-saved estimate");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, 3000);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [lineItems, notes, saveDocumentChanges]);

  const handleAddWarranty = () => {
    if (suggestedWarranty) {
      handleAddProduct(suggestedWarranty);
      setShowWarrantyNotification(false);
      toast.success(`${suggestedWarranty.name} added to estimate`);
    }
  };

  const handleSaveAndClose = async () => {
    try {
      const savedDocument = await saveDocumentChanges();
      if (savedDocument && onEstimateCreated) {
        onEstimateCreated(savedDocument as Estimate);
      }
      onOpenChange(false);
      toast.success("Estimate saved successfully!");
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">
                  {existingEstimate ? 'Edit Estimate' : 'Create Estimate'}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-sm">{documentNumber}</Badge>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{finalClientInfo.name || 'Client'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(calculateGrandTotal())}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Smart Warranty Notification */}
        {showWarrantyNotification && suggestedWarranty && (
          <div className="flex-shrink-0 bg-amber-50 border border-amber-200 rounded-lg p-4 mx-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800">
                    Recommend warranty for this service
                  </div>
                  <div className="text-sm text-amber-700 mt-1">
                    Based on your service items, we suggest adding <strong>{suggestedWarranty.name}</strong> 
                    ({formatCurrency(suggestedWarranty.price)}) for customer peace of mind
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddWarranty} className="bg-amber-600 hover:bg-amber-700">
                  Add Warranty
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowWarrantyNotification(false)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <LineItemsManager
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
            documentType="estimate"
          />
        </div>

        <div className="flex-shrink-0 flex justify-between items-center pt-4 px-6 border-t">
          <div className="text-sm text-gray-500">
            Auto-saves every 3 seconds
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAndClose}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save & Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
