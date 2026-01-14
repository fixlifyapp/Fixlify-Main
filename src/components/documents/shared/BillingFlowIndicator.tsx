/**
 * BillingFlowIndicator Component - 2026 Design
 * Visual flow showing: SERVICE AT [property] → SERVICE FOR [tenant] → BILL TO [landlord]
 * Clarifies multi-party billing relationships
 */

import { cn } from "@/lib/utils";
import { MapPin, UserCheck, CreditCard, ArrowRight } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import {
  ContactRole,
  getRoleStyles,
  normalizeRole,
} from "@/lib/document-design-tokens";

interface FlowParty {
  label: string;
  name: string;
  address?: string;
  role?: string;
}

interface BillingFlowIndicatorProps {
  serviceAt?: FlowParty;
  serviceFor?: FlowParty;
  billTo: FlowParty;
  variant?: "full" | "compact" | "minimal";
  className?: string;
}

export function BillingFlowIndicator({
  serviceAt,
  serviceFor,
  billTo,
  variant = "full",
  className,
}: BillingFlowIndicatorProps) {
  // Determine if we need to show the full flow or a simplified version
  const showFullFlow = serviceAt || serviceFor;
  const isSameParty =
    !serviceFor || (serviceFor.name === billTo.name && !serviceAt);

  if (variant === "minimal" || (!showFullFlow && isSameParty)) {
    return (
      <MinimalBillingIndicator billTo={billTo} className={className} />
    );
  }

  if (variant === "compact") {
    return (
      <CompactBillingFlow
        serviceAt={serviceAt}
        serviceFor={serviceFor}
        billTo={billTo}
        className={className}
      />
    );
  }

  return (
    <FullBillingFlow
      serviceAt={serviceAt}
      serviceFor={serviceFor}
      billTo={billTo}
      className={className}
    />
  );
}

// Full visual flow with cards
function FullBillingFlow({
  serviceAt,
  serviceFor,
  billTo,
  className,
}: BillingFlowIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/30 border",
        className
      )}
    >
      {serviceAt && (
        <>
          <FlowStep
            icon={MapPin}
            label="Service At"
            name={serviceAt.name}
            sublabel={serviceAt.address}
            role={serviceAt.role}
          />
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
        </>
      )}

      {serviceFor && serviceFor.name !== billTo.name && (
        <>
          <FlowStep
            icon={UserCheck}
            label="Service For"
            name={serviceFor.name}
            role={serviceFor.role}
          />
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
        </>
      )}

      <FlowStep
        icon={CreditCard}
        label="Bill To"
        name={billTo.name}
        role={billTo.role}
        isPrimary
      />
    </div>
  );
}

// Compact inline flow
function CompactBillingFlow({
  serviceAt,
  serviceFor,
  billTo,
  className,
}: BillingFlowIndicatorProps) {
  const parts: string[] = [];

  if (serviceAt) {
    parts.push(`at ${serviceAt.name}`);
  }
  if (serviceFor && serviceFor.name !== billTo.name) {
    parts.push(`for ${serviceFor.name}`);
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
    >
      {parts.length > 0 && (
        <>
          <span>Service {parts.join(" ")}</span>
          <ArrowRight className="h-3 w-3" />
        </>
      )}
      <span className="font-medium text-foreground flex items-center gap-1.5">
        <CreditCard className="h-3.5 w-3.5" />
        Bill to {billTo.name}
        {billTo.role && (
          <RoleBadge role={billTo.role} size="sm" showLabel={false} />
        )}
      </span>
    </div>
  );
}

// Minimal badge only
function MinimalBillingIndicator({
  billTo,
  className,
}: {
  billTo: FlowParty;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Bill to:</span>
      <span className="font-medium">{billTo.name}</span>
      {billTo.role && <RoleBadge role={billTo.role} size="sm" />}
    </div>
  );
}

// Individual flow step component
interface FlowStepProps {
  icon: React.ElementType;
  label: string;
  name: string;
  sublabel?: string;
  role?: string;
  isPrimary?: boolean;
}

function FlowStep({
  icon: Icon,
  label,
  name,
  sublabel,
  role,
  isPrimary = false,
}: FlowStepProps) {
  const normalizedRole = role ? normalizeRole(role) : undefined;
  const roleStyles = normalizedRole ? getRoleStyles(normalizedRole) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md min-w-0",
        isPrimary
          ? "bg-primary/10 border border-primary/20"
          : roleStyles
          ? cn(roleStyles.lightBg, roleStyles.border, "border")
          : "bg-card border"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isPrimary
            ? "text-primary"
            : roleStyles
            ? roleStyles.text
            : "text-muted-foreground"
        )}
      />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{name}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground truncate">{sublabel}</p>
        )}
      </div>
      {role && (
        <RoleBadge
          role={role}
          size="sm"
          showLabel={false}
          variant="subtle"
          className="shrink-0"
        />
      )}
    </div>
  );
}

export default BillingFlowIndicator;
