/**
 * PortalRoleBanner Component - 2026 Design
 * Shows the viewer's role context in the client portal
 * Clarifies who is viewing, their role, and what actions they can take
 */

import { cn } from "@/lib/utils";
import {
  Building,
  Home,
  Users,
  User,
  CreditCard,
  Eye,
  Forward,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContactRole,
  getRoleStyles,
  getRoleIcon,
  getRoleDisplayName,
  normalizeRole,
} from "@/lib/document-design-tokens";

interface PortalRoleBannerProps {
  // Viewer's information
  viewerName: string;
  viewerRole: string;
  viewerEmail?: string;

  // Document type context
  documentType: "estimate" | "invoice";

  // Service information
  serviceAddress?: string;
  serviceForName?: string;
  serviceForRole?: string;

  // Billing information
  isBillingContact: boolean;
  billingContactName?: string;
  billingContactRole?: string;

  // Payment status (for invoices)
  paymentStatus?: "unpaid" | "partial" | "paid" | "overdue";
  amountDue?: number;

  // Actions
  onApprove?: () => void;
  onPay?: () => void;
  onForward?: () => void;
  onContactSupport?: () => void;

  className?: string;
}

export function PortalRoleBanner({
  viewerName,
  viewerRole,
  viewerEmail,
  documentType,
  serviceAddress,
  serviceForName,
  serviceForRole,
  isBillingContact,
  billingContactName,
  billingContactRole,
  paymentStatus,
  amountDue,
  onApprove,
  onPay,
  onForward,
  onContactSupport,
  className,
}: PortalRoleBannerProps) {
  const normalizedRole = normalizeRole(viewerRole);
  const roleStyles = getRoleStyles(normalizedRole);
  const RoleIcon = getRoleIcon(normalizedRole);
  const roleDisplayName = getRoleDisplayName(normalizedRole);

  // Determine what the viewer can do based on their role
  const canPay = isBillingContact;
  const canApprove = normalizedRole === "landlord" || normalizedRole === "property_manager";
  const canForward = !isBillingContact && billingContactName;
  const isViewOnly = !canPay && !canApprove;

  // Get contextual message based on role
  const getRoleMessage = () => {
    if (isBillingContact) {
      return documentType === "estimate"
        ? "You can approve and authorize this work."
        : "You are responsible for payment.";
    }

    switch (normalizedRole) {
      case "tenant":
        return "This is for your reference. The billing contact will handle payment.";
      case "landlord":
        return serviceForName
          ? `Service performed for ${serviceForName} at your property.`
          : "Service performed at your property.";
      case "property_manager":
        return "You may approve on behalf of the property owner.";
      default:
        return "You are receiving a copy of this document.";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 sm:p-5",
        roleStyles.lightBg,
        roleStyles.border,
        className
      )}
    >
      {/* Header with role indicator */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              roleStyles.bg
            )}
          >
            <RoleIcon className={cn("h-5 w-5", roleStyles.text)} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              You are viewing as
            </p>
            <h3 className="text-lg font-semibold">{viewerName}</h3>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                roleStyles.bg,
                roleStyles.text
              )}
            >
              <RoleIcon className="h-3 w-3" />
              {roleDisplayName}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        {isBillingContact ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-200">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Billing Contact
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              Copy Recipient
            </span>
          </div>
        )}
      </div>

      {/* Context message */}
      <p className="text-sm text-muted-foreground mb-4">
        {getRoleMessage()}
      </p>

      {/* Service location info (if applicable) */}
      {serviceAddress && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-white/60 border">
          <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="text-muted-foreground">Service at: </span>
            <span className="font-medium">{serviceAddress}</span>
            {serviceForName && serviceForName !== viewerName && (
              <>
                <br />
                <span className="text-muted-foreground">For: </span>
                <span className="font-medium">{serviceForName}</span>
                {serviceForRole && (
                  <span className="text-muted-foreground ml-1">
                    ({getRoleDisplayName(normalizeRole(serviceForRole))})
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Billing contact info (if viewer is not the billing contact) */}
      {!isBillingContact && billingContactName && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-white/60 border">
          <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="text-muted-foreground">Bills to: </span>
            <span className="font-medium">{billingContactName}</span>
            {billingContactRole && (
              <span className="text-muted-foreground ml-1">
                ({getRoleDisplayName(normalizeRole(billingContactRole))})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Payment status for invoices */}
      {documentType === "invoice" && paymentStatus && (
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg mb-4",
            paymentStatus === "paid"
              ? "bg-emerald-50 border border-emerald-200"
              : paymentStatus === "overdue"
              ? "bg-red-50 border border-red-200"
              : "bg-amber-50 border border-amber-200"
          )}
        >
          <div className="flex items-center gap-2">
            {paymentStatus === "paid" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle
                className={cn(
                  "h-4 w-4",
                  paymentStatus === "overdue" ? "text-red-600" : "text-amber-600"
                )}
              />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                paymentStatus === "paid"
                  ? "text-emerald-700"
                  : paymentStatus === "overdue"
                  ? "text-red-700"
                  : "text-amber-700"
              )}
            >
              {paymentStatus === "paid"
                ? "Paid in Full"
                : paymentStatus === "partial"
                ? "Partially Paid"
                : paymentStatus === "overdue"
                ? "Payment Overdue"
                : "Payment Due"}
            </span>
          </div>
          {amountDue !== undefined && paymentStatus !== "paid" && (
            <span className="font-bold text-lg">
              ${amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Primary actions based on role */}
        {canPay && documentType === "invoice" && paymentStatus !== "paid" && onPay && (
          <Button onClick={onPay} className="gap-2">
            <CreditCard className="h-4 w-4" />
            Pay Now
          </Button>
        )}

        {canApprove && documentType === "estimate" && onApprove && (
          <Button onClick={onApprove} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {normalizedRole === "property_manager" ? "Approve on Behalf" : "Approve & Authorize"}
          </Button>
        )}

        {/* Forward option for non-billing contacts */}
        {canForward && onForward && (
          <Button variant="outline" onClick={onForward} className="gap-2">
            <Forward className="h-4 w-4" />
            Forward to {billingContactName}
          </Button>
        )}

        {/* Support contact */}
        {onContactSupport && (
          <Button variant="ghost" onClick={onContactSupport} className="gap-2">
            <Phone className="h-4 w-4" />
            Contact Support
          </Button>
        )}

        {/* View only indicator */}
        {isViewOnly && !onForward && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm">
            <Eye className="h-4 w-4" />
            View Only
          </div>
        )}
      </div>
    </div>
  );
}

export default PortalRoleBanner;
