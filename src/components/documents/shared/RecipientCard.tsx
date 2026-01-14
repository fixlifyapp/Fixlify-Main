/**
 * RecipientCard Component - 2026 Design
 * Displays recipient information with role and billing status
 * Supports primary (billing) and CC (copy) recipients
 */

import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Check, Copy } from "lucide-react";
import { RoleBadge, PaysBadge, CopyBadge } from "./RoleBadge";
import {
  ContactRole,
  getRoleStyles,
  normalizeRole,
} from "@/lib/document-design-tokens";

interface RecipientInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  isBillingContact?: boolean;
  receivesInvoices?: boolean;
  canApproveWork?: boolean;
}

interface RecipientCardProps {
  recipient: RecipientInfo;
  variant?: "primary" | "secondary" | "compact";
  showContactInfo?: boolean;
  className?: string;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function RecipientCard({
  recipient,
  variant = "primary",
  showContactInfo = true,
  className,
  onSelect,
  isSelected = false,
}: RecipientCardProps) {
  const normalizedRole = normalizeRole(recipient.role);
  const roleStyles = getRoleStyles(normalizedRole);
  const isPrimary = variant === "primary" || recipient.isBillingContact;

  if (variant === "compact") {
    return (
      <CompactRecipientCard
        recipient={recipient}
        className={className}
        onSelect={onSelect}
        isSelected={isSelected}
      />
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-lg border p-4 transition-all",
        isPrimary
          ? cn(
              roleStyles.lightBg,
              roleStyles.border,
              "border-2"
            )
          : "bg-card border-border hover:border-primary/30",
        onSelect && "cursor-pointer hover:shadow-sm",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Header with name and badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm truncate">{recipient.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role={normalizedRole} size="sm" />
            {recipient.isBillingContact ? <PaysBadge /> : recipient.receivesInvoices && <CopyBadge />}
          </div>
        </div>

        {/* Approval indicator */}
        {recipient.canApproveWork && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-medium">
            <Check className="h-3 w-3" />
            Can Approve
          </div>
        )}
      </div>

      {/* Contact info */}
      {showContactInfo && (
        <div className="space-y-1.5">
          {recipient.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{recipient.email}</span>
            </div>
          )}
          {recipient.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{recipient.phone}</span>
            </div>
          )}
          {recipient.address && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{recipient.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline version for lists
function CompactRecipientCard({
  recipient,
  className,
  onSelect,
  isSelected,
}: {
  recipient: RecipientInfo;
  className?: string;
  onSelect?: () => void;
  isSelected?: boolean;
}) {
  const normalizedRole = normalizeRole(recipient.role);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md border transition-all",
        onSelect && "cursor-pointer hover:bg-muted/50",
        isSelected && "bg-primary/5 border-primary",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{recipient.name}</span>
          <RoleBadge role={normalizedRole} size="sm" showLabel={false} />
        </div>
        {recipient.email && (
          <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
        )}
      </div>
      {recipient.isBillingContact ? <PaysBadge /> : <CopyBadge />}
    </div>
  );
}

// Multi-recipient list component
interface RecipientListProps {
  primary: RecipientInfo;
  ccRecipients?: RecipientInfo[];
  className?: string;
}

export function RecipientList({
  primary,
  ccRecipients = [],
  className,
}: RecipientListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Primary recipient (pays) */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Bill To
        </p>
        <RecipientCard
          recipient={{ ...primary, isBillingContact: true }}
          variant="primary"
        />
      </div>

      {/* CC recipients */}
      {ccRecipients.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Copy To ({ccRecipients.length})
          </p>
          <div className="space-y-2">
            {ccRecipients.map((recipient) => (
              <RecipientCard
                key={recipient.id}
                recipient={recipient}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipientCard;
