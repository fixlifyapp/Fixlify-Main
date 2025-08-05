
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUnifiedDocumentViewer } from "./unified/hooks/useUnifiedDocumentViewer";
import { UnifiedDocumentViewerHeader } from "./unified/components/UnifiedDocumentViewerHeader";
import { UnifiedDocumentViewerContent } from "./unified/components/UnifiedDocumentViewerContent";
import { UnifiedDocumentViewerDialogs } from "./unified/components/UnifiedDocumentViewerDialogs";
import { toast } from "sonner";
import { Estimate, Invoice } from "@/types/documents";
import { useEstimates } from "@/hooks/useEstimates";

interface UnifiedDocumentViewerProps {
  document: Estimate | Invoice;
  documentType: "estimate" | "invoice";
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onConvertToInvoice?: (estimate: Estimate) => void;
}

export const UnifiedDocumentViewer = ({
  document,
  documentType,
  jobId,
  isOpen,
  onClose,
  onUpdate,
  onConvertToInvoice,
}: UnifiedDocumentViewerProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { convertEstimateToInvoice } = useEstimates(jobId);
  
  const handleEdit = () => {
    setIsEditMode(true);
  };

  const {
    showSendDialog,
    setShowSendDialog,
    showEditDialog,
    setShowEditDialog,
    clientInfo,
    loading,
    lineItems,
    taxRate,
    documentNumber,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    getClientInfo,
    handleSend,
    handleSendSuccess,
    handleEditSuccess
  } = useUnifiedDocumentViewer({
    document,
    documentType,
    jobId,
    onConvertToInvoice,
    onDocumentUpdated: onUpdate
  });

  const handleConvert = async () => {
    if (documentType !== "estimate") return;
    
    try {
      const estimate = document as Estimate;
      const success = await convertEstimateToInvoice(estimate.id);
      
      if (success) {
        toast.success('Estimate converted to invoice successfully');
        if (onConvertToInvoice) {
          onConvertToInvoice(estimate);
        }
        if (onUpdate) {
          onUpdate();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const showConvertButton = documentType === "estimate" && !!onConvertToInvoice;

  // Format dates to show 24-hour format with date
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const issueDate = documentType === "invoice" 
    ? formatDateTime((document as Invoice).created_at)
    : formatDateTime((document as Estimate).created_at);

  const dueDate = documentType === "invoice" 
    ? formatDateTime((document as Invoice).due_date)
    : formatDateTime((document as Estimate).valid_until);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <UnifiedDocumentViewerHeader
            documentType={documentType}
            documentNumber={documentNumber}
            onEdit={handleEdit}
            onSend={handleSend}
            onConvert={handleConvert}
            showConvertButton={showConvertButton}
          />

          <UnifiedDocumentViewerContent
            documentType={documentType}
            documentNumber={documentNumber}
            lineItems={lineItems}
            taxRate={taxRate}
            calculateSubtotal={calculateSubtotal}
            calculateTotalTax={calculateTotalTax}
            calculateGrandTotal={calculateGrandTotal}
            notes={document.notes || ''}
            clientInfo={clientInfo}
            jobId={jobId}
            issueDate={issueDate}
            dueDate={dueDate}
          />
        </DialogContent>
      </Dialog>

      <UnifiedDocumentViewerDialogs
        documentType={documentType}
        document={document}
        jobId={jobId}
        showSendDialog={showSendDialog}
        setShowSendDialog={setShowSendDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showConvertDialog={false}
        setShowConvertDialog={() => {}}
        documentNumber={documentNumber}
        calculateGrandTotal={calculateGrandTotal}
        getClientInfo={getClientInfo}
        handleSendSuccess={handleSendSuccess}
        handleEditSuccess={handleEditSuccess}
        handleConvertSuccess={() => {}}
      />
    </>
  );
};
