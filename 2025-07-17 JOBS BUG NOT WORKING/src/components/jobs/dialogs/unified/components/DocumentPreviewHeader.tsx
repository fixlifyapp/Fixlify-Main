
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentPreviewHeaderProps {
  documentType: DocumentType;
  documentNumber: string;
  companyInfo: any;
}

export const DocumentPreviewHeader = ({
  documentType,
  documentNumber,
  companyInfo
}: DocumentPreviewHeaderProps) => {
  const documentTitle = documentType === 'estimate' ? 'ESTIMATE' : 'INVOICE';
  const documentColor = documentType === 'estimate' ? 'text-blue-600' : 'text-green-600';
  const documentBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-green-50';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          {/* Company Info */}
          <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
            {companyInfo?.logoUrl ? (
              <img 
                src={companyInfo.logoUrl} 
                alt={companyInfo.name} 
                className="h-12 sm:h-16 w-auto object-contain flex-shrink-0"
              />
            ) : (
              <div className="h-12 sm:h-16 w-12 sm:w-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {companyInfo?.name?.charAt(0) || 'F'}
                </span>
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">
                {companyInfo?.name || 'FixLyfy Services'}
              </h2>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p className="break-words">{companyInfo?.address}</p>
                <p className="break-words">
                  {[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}
                </p>
                <p className="break-words">{companyInfo?.phone}</p>
                <p className="break-words">{companyInfo?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Document Info */}
          <div className="text-right sm:text-right flex-shrink-0">
            <div className={`inline-block px-3 sm:px-4 py-2 rounded-lg ${documentBg} mb-2 sm:mb-3`}>
              <h1 className={`text-xl sm:text-2xl font-bold ${documentColor}`}>
                {documentTitle}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">Number</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 break-words">#{documentNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
