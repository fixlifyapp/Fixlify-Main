import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentPreviewFooterProps {
  documentType: DocumentType;
  companyInfo: any;
}

export const DocumentPreviewFooter = ({
  documentType,
  companyInfo
}: DocumentPreviewFooterProps) => {
  return (
    <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-8 border-t border-gray-200">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="text-center space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Thank you for choosing {companyInfo?.name || 'FixLyfy Services'}!
          </h4>
          
          <div className="text-sm text-gray-600 space-y-2 max-w-2xl mx-auto">
            <p>
              This {documentType} contains confidential information. 
              For questions, contact us at {companyInfo?.phone || '(555) 123-4567'} or {companyInfo?.email || 'info@fixlify.com'}.
            </p>
            
            {documentType === 'estimate' && (
              <p className="font-medium text-blue-700">
                This estimate is valid for 30 days from the issue date.
              </p>
            )}
            
            {documentType === 'invoice' && (
              <p className="font-medium text-green-700">
                Payment is due within 30 days of the invoice date.
              </p>
            )}
          </div>
          
          {companyInfo?.website && (
            <p className="text-sm text-gray-500 pt-2">
              Visit us at {companyInfo.website}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
