
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { Mail, Phone, MapPin, Calendar, Percent, Clock } from "lucide-react";
import { BillToOption } from "./BillToSelector";
import { RoleBadge, PaysBadge } from "@/components/documents/shared/RoleBadge";
import { BillingFlowIndicator } from "@/components/documents/shared/BillingFlowIndicator";
import { normalizeRole, ContactRole } from "@/lib/document-design-tokens";
import { cn } from "@/lib/utils";

interface DocumentInfoGridProps {
  documentType: DocumentType;
  enhancedClientInfo: any;
  jobAddress: string;
  issueDate?: string;
  dueDate?: string;
  taxRate: number;
  companyInfo: any;
  // Optional Bill To override - when user selects a different billing recipient
  billToOption?: BillToOption;
  // Validity days from organization settings
  validityDays?: number;
  // Multi-party billing support
  serviceForClient?: {
    name: string;
    role?: string;
  };
  ccRecipients?: Array<{
    name: string;
    email?: string;
    role?: string;
  }>;
  showBillingFlow?: boolean;
}

export const DocumentInfoGrid = ({
  documentType,
  enhancedClientInfo,
  jobAddress,
  issueDate,
  dueDate,
  taxRate,
  companyInfo,
  billToOption,
  validityDays = 30,
  serviceForClient,
  ccRecipients = [],
  showBillingFlow = false
}: DocumentInfoGridProps) => {
  // Use billToOption if provided, otherwise fall back to enhancedClientInfo
  const displayName = billToOption?.name || enhancedClientInfo?.name || 'Client Name';
  const displayCompany = billToOption?.company || enhancedClientInfo?.company;
  const displayAddress = billToOption?.address || enhancedClientInfo?.fullAddress;
  const displayPhone = billToOption?.phone || enhancedClientInfo?.phone;
  const displayEmail = billToOption?.email || enhancedClientInfo?.email;
  const clientType = billToOption?.type || enhancedClientInfo?.type;

  // Determine if we should show billing flow (multi-party scenario)
  const hasMultiPartyBilling =
    (serviceForClient && serviceForClient.name !== displayName) ||
    (jobAddress && jobAddress !== displayAddress);

  const normalizedRole = normalizeRole(clientType);

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 bg-muted/30">
      {/* Billing Flow Indicator - shows when there are multiple parties */}
      {(showBillingFlow || hasMultiPartyBilling) && (
        <div className="mb-4">
          <BillingFlowIndicator
            serviceAt={jobAddress && jobAddress !== displayAddress ? {
              label: "Service At",
              name: jobAddress.split(',')[0] || "Service Location",
              address: jobAddress
            } : undefined}
            serviceFor={serviceForClient && serviceForClient.name !== displayName ? {
              label: "Service For",
              name: serviceForClient.name,
              role: serviceForClient.role
            } : undefined}
            billTo={{
              label: "Bill To",
              name: displayName,
              role: clientType
            }}
            variant={hasMultiPartyBilling ? "full" : "minimal"}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Client / Bill To Information - Enhanced Card */}
        <div className="bg-card rounded-xl p-4 sm:p-5 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
            </h3>
            <PaysBadge />
          </div>

          <div className="space-y-3">
            {/* Name with role badge */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-semibold text-foreground">
                {displayName}
              </h4>
              {clientType && clientType !== 'client' && (
                <RoleBadge role={normalizedRole} size="sm" />
              )}
            </div>

            {displayCompany && (
              <p className="text-sm text-muted-foreground font-medium">{displayCompany}</p>
            )}

            {/* Address with icon */}
            {displayAddress && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  {displayAddress.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line || 'Address not available'}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Service Address - only show if different (with visual separator) */}
            {jobAddress && jobAddress !== displayAddress && (
              <div className="pt-3 border-t border-dashed">
                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Service Location
                </p>
                <div className="text-sm text-muted-foreground pl-4">
                  {jobAddress.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info with icons */}
            <div className="pt-3 border-t space-y-1.5">
              {displayPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{displayPhone}</span>
                </div>
              )}
              {displayEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{displayEmail}</span>
                </div>
              )}
            </div>

            {/* CC Recipients indicator */}
            {ccRecipients.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Copy To ({ccRecipients.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ccRecipients.map((cc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
                    >
                      {cc.name}
                      {cc.role && (
                        <RoleBadge role={cc.role} size="sm" showLabel={false} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Details - Enhanced Card */}
        <div className="bg-card rounded-xl p-4 sm:p-5 border shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Details
          </h3>

          <div className="space-y-4">
            {/* Issue Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{documentType === 'estimate' ? 'Estimate Date' : 'Issue Date'}</span>
              </div>
              <span className="text-sm font-semibold">
                {issueDate || new Date().toLocaleDateString()}
              </span>
            </div>

            {/* Due Date / Valid Until */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{documentType === 'estimate' ? 'Valid Until' : 'Due Date'}</span>
              </div>
              <span className="text-sm font-semibold">
                {documentType === 'estimate'
                  ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()
                  : dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                }
              </span>
            </div>

            {/* Tax Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="h-4 w-4" />
                <span>Tax Rate</span>
              </div>
              <span className="text-sm font-semibold">{taxRate}%</span>
            </div>

            {/* Validity Period for estimates */}
            {documentType === 'estimate' && (
              <div className="pt-3 mt-2 border-t">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-700">
                    This estimate is valid for {validityDays} days
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
