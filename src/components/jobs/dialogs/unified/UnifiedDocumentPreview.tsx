
import React from "react";
import { LineItem } from "../../builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { useDocumentPreviewData } from "./hooks/useDocumentPreviewData";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useOrganizationDocumentSettings } from "@/hooks/useOrganizationDocumentSettings";
import { DocumentPreviewHeader } from "./components/DocumentPreviewHeader";
import { DocumentInfoGrid } from "./components/DocumentInfoGrid";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { DocumentPreviewFooter } from "./components/DocumentPreviewFooter";
import { BillToOption } from "./components/BillToSelector";
import { FooterOverrides } from "./components/EditableFooter";

interface UnifiedDocumentPreviewProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: LineItem[];
  taxRate?: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
  jobId?: string;
  // Optional Bill To selection - overrides default client
  billToOption?: BillToOption;
  // Optional footer customization - overrides organization defaults
  footerOverrides?: FooterOverrides;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  issueDate,
  dueDate,
  jobId,
  billToOption,
  footerOverrides
}: UnifiedDocumentPreviewProps) => {
  const { taxConfig } = useTaxSettings();
  const { settings: docSettings } = useOrganizationDocumentSettings();

  // Use passed taxRate or fallback to user settings
  const effectiveTaxRate = taxRate || taxConfig.rate;
  
  console.log('=== UnifiedDocumentPreview Debug ===');
  console.log('JobId prop received:', jobId);
  console.log('ClientInfo prop received:', clientInfo);
  console.log('Document type:', documentType);
  console.log('Line items received:', lineItems);
  console.log('Issue date:', issueDate);
  console.log('Due date:', dueDate);
  console.log('Tax rate:', effectiveTaxRate);

  const { companyInfo, enhancedClientInfo, jobAddress, loading } = useDocumentPreviewData({
    clientInfo,
    jobId,
    documentNumber,
    documentType
  });

  console.log('Enhanced client info from hook:', enhancedClientInfo);
  console.log('Job address from hook:', jobAddress);
  console.log('Company info from hook:', companyInfo);

  if (loading) {
    return (
      <div className="max-w-full mx-auto bg-white shadow-2xl border border-gray-200">
        <div className="animate-pulse space-y-4 sm:space-y-8 p-4 sm:p-8">
          <div className="h-16 sm:h-24 bg-gray-200 rounded"></div>
          <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
          <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();

  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';

  return (
    <div className="max-w-full mx-auto bg-white shadow-2xl border border-gray-200 print:shadow-none print:border-gray-300 overflow-x-auto">
      <DocumentPreviewHeader
        documentType={documentType}
        documentNumber={documentNumber}
        companyInfo={companyInfo}
      />

      <DocumentInfoGrid
        documentType={documentType}
        enhancedClientInfo={enhancedClientInfo}
        jobAddress={jobAddress}
        issueDate={issueDate}
        dueDate={dueDate}
        taxRate={effectiveTaxRate}
        companyInfo={companyInfo}
        billToOption={billToOption}
        validityDays={docSettings.estimate_validity_days}
      />

      {/* Line Items Section */}
      {lineItems && lineItems.length > 0 ? (
        <div className="overflow-x-auto">
          <DocumentLineItemsTable
            documentType={documentType}
            lineItems={lineItems}
          />
        </div>
      ) : (
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">No items found for this {documentType}</p>
          </div>
        </div>
      )}

      <DocumentTotalsSection
        documentType={documentType}
        subtotal={subtotal}
        tax={tax}
        total={total}
        taxRate={effectiveTaxRate}
      />

      {/* Notes Section */}
      {notes && (
        <div className="px-4 sm:px-8 py-6 sm:py-8 border-t">
          <h3 className={`font-bold text-lg sm:text-xl ${documentColor} mb-3 sm:mb-4 flex items-center`}>
            <div className={`w-1 h-4 sm:h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-2 sm:mr-3`}></div>
            <span className="text-sm sm:text-xl break-words">Notes & Instructions</span>
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-xs sm:text-base break-words">{notes}</p>
          </div>
        </div>
      )}

      <DocumentPreviewFooter
        documentType={documentType}
        companyInfo={companyInfo}
        customFooter={footerOverrides}
      />
    </div>
  );
};
