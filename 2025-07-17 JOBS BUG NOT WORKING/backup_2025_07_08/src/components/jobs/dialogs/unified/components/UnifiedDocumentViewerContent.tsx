
import React from "react";
import { UnifiedDocumentPreview } from "../UnifiedDocumentPreview";

interface UnifiedDocumentViewerContentProps {
  documentType: "invoice" | "estimate";
  documentNumber: string;
  lineItems: any[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo: any;
  jobId: string;
  issueDate?: string;
  dueDate?: string;
}

export const UnifiedDocumentViewerContent = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  jobId,
  issueDate,
  dueDate
}: UnifiedDocumentViewerContentProps) => {
  console.log('UnifiedDocumentViewerContent - Tax rate received:', taxRate);
  console.log('UnifiedDocumentViewerContent - Line items:', lineItems);
  console.log('UnifiedDocumentViewerContent - Issue date:', issueDate);
  console.log('UnifiedDocumentViewerContent - Due date:', dueDate);
  
  return (
    <div className="flex-1 overflow-auto">
      <UnifiedDocumentPreview
        documentType={documentType}
        documentNumber={documentNumber}
        lineItems={lineItems}
        taxRate={taxRate}
        calculateSubtotal={calculateSubtotal}
        calculateTotalTax={calculateTotalTax}
        calculateGrandTotal={calculateGrandTotal}
        notes={notes}
        clientInfo={clientInfo}
        jobId={jobId}
        issueDate={issueDate}
        dueDate={dueDate}
      />
    </div>
  );
};
