
import React from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { UnifiedDocumentPreview } from "../unified/UnifiedDocumentPreview";
import { EstimateForm } from "./EstimateForm";

interface EstimateBuilderContentProps {
  activeTab: string;
  estimateNumber: string;
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
  notes: string;
  clientInfo?: any;
  jobData?: any;
}

export const EstimateBuilderContent = ({
  activeTab,
  estimateNumber,
  lineItems,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  taxRate,
  setTaxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage,
  notes,
  clientInfo,
  jobData
}: EstimateBuilderContentProps) => {
  console.log('=== EstimateBuilderContent Debug ===');
  console.log('Active tab:', activeTab);
  console.log('Client info passed to content:', clientInfo);
  console.log('Job data passed to content:', jobData);
  console.log('Job ID from jobData:', jobData?.id);

  if (activeTab === "form") {
    return (
      <EstimateForm
        estimateNumber={estimateNumber}
        lineItems={lineItems}
        onRemoveLineItem={onRemoveLineItem}
        onUpdateLineItem={onUpdateLineItem}
        onEditLineItem={onEditLineItem}
        onAddEmptyLineItem={onAddEmptyLineItem}
        onAddCustomLine={onAddCustomLine}
        taxRate={taxRate}
        setTaxRate={setTaxRate}
        calculateSubtotal={calculateSubtotal}
        calculateTotalTax={calculateTotalTax}
        calculateGrandTotal={calculateGrandTotal}
        calculateTotalMargin={calculateTotalMargin}
        calculateMarginPercentage={calculateMarginPercentage}
      />
    );
  }

  if (activeTab === "preview") {
    return (
      <UnifiedDocumentPreview
        documentType="estimate"
        documentNumber={estimateNumber}
        lineItems={lineItems}
        taxRate={taxRate}
        calculateSubtotal={calculateSubtotal}
        calculateTotalTax={calculateTotalTax}
        calculateGrandTotal={calculateGrandTotal}
        notes={notes}
        clientInfo={clientInfo}
        jobId={jobData?.id}
        issueDate={new Date().toLocaleDateString()}
        dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
      />
    );
  }

  return null;
};
