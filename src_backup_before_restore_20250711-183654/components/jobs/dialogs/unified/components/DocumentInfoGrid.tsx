
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentInfoGridProps {
  documentType: DocumentType;
  enhancedClientInfo: any;
  jobAddress: string;
  issueDate?: string;
  dueDate?: string;
  taxRate: number;
  companyInfo: any;
}

export const DocumentInfoGrid = ({
  documentType,
  enhancedClientInfo,
  jobAddress,
  issueDate,
  dueDate,
  taxRate,
  companyInfo
}: DocumentInfoGridProps) => {
  console.log('=== DocumentInfoGrid Debug ===');
  console.log('Enhanced client info:', enhancedClientInfo);
  console.log('Job address:', jobAddress);

  return (
    <div className="px-8 py-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Information */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
          </h3>
          
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">
              {enhancedClientInfo?.name || 'Client Name'}
            </h4>
            
            {enhancedClientInfo?.company && (
              <p className="text-gray-600 font-medium">{enhancedClientInfo.company}</p>
            )}
            
            <div className="text-gray-600 space-y-1">
              {enhancedClientInfo?.fullAddress && (
                <div>
                  {enhancedClientInfo.fullAddress.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line || 'Address not available'}</p>
                  ))}
                </div>
              )}
            </div>

            {jobAddress && jobAddress !== enhancedClientInfo?.fullAddress && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Service Address
                </p>
                <div className="text-gray-600">
                  {jobAddress.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line || 'Service address not available'}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
              {enhancedClientInfo?.phone && (
                <p className="text-gray-600">{enhancedClientInfo.phone}</p>
              )}
              {enhancedClientInfo?.email && (
                <p className="text-gray-600">{enhancedClientInfo.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {documentType === 'estimate' ? 'Estimate Date' : 'Issue Date'}
              </span>
              <span className="font-medium text-gray-900">
                {issueDate || new Date().toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">
                {documentType === 'estimate' ? 'Valid Until' : 'Due Date'}
              </span>
              <span className="font-medium text-gray-900">
                {documentType === 'estimate' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  : dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tax Rate</span>
              <span className="font-medium text-gray-900">{taxRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
