import { useState, useCallback } from "react";
import { toast } from "sonner";
import { LineItem, Product } from "../../builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { useDocumentInitialization } from "./hooks/useDocumentInitialization";
import { useDocumentCalculations } from "./hooks/useDocumentCalculations";
import { useDocumentOperations } from "./hooks/useDocumentOperations";
import { useDocumentSmartFeatures } from "./hooks/useDocumentSmartFeatures";
import { useJobs } from "@/hooks/useJobs";

interface UseUnifiedDocumentBuilderProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  open: boolean;
  onSyncToInvoice?: () => void;
}

export const useUnifiedDocumentBuilder = ({
  documentType,
  existingDocument,
  jobId,
  open,
  onSyncToInvoice
}: UseUnifiedDocumentBuilderProps) => {
  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId);

  // Initialize document state
  const {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isInitialized
  } = useDocumentInitialization({
    documentType,
    existingDocument,
    jobId,
    open
  });

  // Calculate totals
  const {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage
  } = useDocumentCalculations({ lineItems });

  // Smart features
  const smartFeatures = useDocumentSmartFeatures({
    documentType,
    lineItems,
    jobId
  });

  // Create form data for operations
  const formData = {
    documentId: existingDocument?.id,
    documentNumber,
    items: lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxable: item.taxable
    })),
    notes,
    status: existingDocument?.status || (documentType === 'estimate' ? 'draft' : 'unpaid'),
    total: calculateGrandTotal()
  };

  // Job data for display
  const jobData = {
    id: jobId,
    title: job?.title || 'Service Request',
    client: job?.client,
    description: job?.description
  };

  // Document operations
  const {
    isSubmitting,
    saveDocumentChanges,
    convertToInvoice
  } = useDocumentOperations({
    documentType,
    existingDocument,
    jobId,
    formData,
    lineItems,
    notes,
    calculateGrandTotal,
    onSyncToInvoice
  });

  // Line item management with standardized interface
  const handleAddProduct = useCallback((product: Product) => {
    const newLineItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      ourPrice: product.ourPrice || product.ourprice || product.cost || 0,
      taxable: product.taxable !== undefined ? product.taxable : true,
      discount: 0,
      name: product.name,
      price: product.price,
      total: product.price
    };

    setLineItems(prev => [...prev, newLineItem]);
    toast.success(`${product.name} added to ${documentType}`);
  }, [setLineItems, documentType]);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed");
  }, [setLineItems]);

  // Standardized update interface to match both estimate and invoice patterns
  const handleUpdateLineItem = useCallback((id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  }, [setLineItems]);

  return {
    // State
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isInitialized,
    isSubmitting,

    // Data objects
    formData,
    jobData,

    // Calculations
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,

    // Line item actions with standardized interface
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,

    // Document operations
    saveDocumentChanges,
    convertToInvoice,

    // Smart features
    ...smartFeatures
  };
};
