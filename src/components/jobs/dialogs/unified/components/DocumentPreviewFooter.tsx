import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { useOrganizationDocumentSettings, replaceTemplateVariables } from "@/hooks/useOrganizationDocumentSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentPreviewFooterProps {
  documentType: DocumentType;
  companyInfo: any;
  // Optional per-document overrides
  customFooter?: {
    thankYouMessage?: string;
    confidentialityText?: string;
    contactText?: string;
    showWebsite?: boolean;
    termsText?: string;
  };
}

export const DocumentPreviewFooter = ({
  documentType,
  companyInfo,
  customFooter
}: DocumentPreviewFooterProps) => {
  const { settings, isLoading } = useOrganizationDocumentSettings();

  // Prepare template variable values from company info
  const templateValues = {
    company_name: companyInfo?.name || companyInfo?.company_name || 'Our Company',
    document_type: documentType as 'estimate' | 'invoice',
    phone: companyInfo?.phone || companyInfo?.company_phone || '(555) 123-4567',
    email: companyInfo?.email || companyInfo?.company_email || 'info@company.com',
    website: companyInfo?.website || '',
    validity_days: settings.estimate_validity_days,
  };

  // Use custom overrides if provided, otherwise use organization settings
  const thankYouMessage = customFooter?.thankYouMessage
    ?? settings.footer_thank_you_message;
  const confidentialityText = customFooter?.confidentialityText
    ?? settings.footer_confidentiality_text;
  const contactText = customFooter?.contactText
    ?? settings.footer_contact_text;
  const showWebsite = customFooter?.showWebsite
    ?? settings.footer_show_website;

  // Get document-specific terms text
  const termsText = customFooter?.termsText ?? (
    documentType === 'estimate'
      ? settings.estimate_terms_text
      : settings.invoice_payment_terms
  );

  // Late fee text for invoices (only if configured)
  const lateFeeText = documentType === 'invoice' ? settings.invoice_late_fee_text : null;

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-8 border-t border-gray-200">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-6 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-8 border-t border-gray-200">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="text-center space-y-4">
          {/* Thank You Message */}
          <h4 className="text-lg font-semibold text-gray-900">
            {replaceTemplateVariables(thankYouMessage, templateValues)}
          </h4>

          <div className="text-sm text-gray-600 space-y-2 max-w-2xl mx-auto">
            {/* Confidentiality + Contact Text */}
            <p>
              {replaceTemplateVariables(confidentialityText, templateValues)}
              {' '}
              {replaceTemplateVariables(contactText, templateValues)}
            </p>

            {/* Document-specific Terms */}
            {termsText && (
              <p className={`font-medium ${documentType === 'estimate' ? 'text-blue-700' : 'text-green-700'}`}>
                {replaceTemplateVariables(termsText, templateValues)}
              </p>
            )}

            {/* Late Fee Text (invoices only) */}
            {lateFeeText && (
              <p className="text-sm text-amber-600">
                {replaceTemplateVariables(lateFeeText, templateValues)}
              </p>
            )}
          </div>

          {/* Website Link */}
          {showWebsite && templateValues.website && (
            <p className="text-sm text-gray-500 pt-2">
              Visit us at {templateValues.website}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
