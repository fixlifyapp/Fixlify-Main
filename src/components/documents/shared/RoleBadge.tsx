/**
 * RoleBadge Component - 2026 Design
 * Displays role indicator with icon and color coding
 * Used for landlord/tenant/property manager identification
 */

import { cn } from "@/lib/utils";
import {
  ContactRole,
  getRoleStyles,
  getRoleIcon,
  getRoleDisplayName,
  normalizeRole,
} from "@/lib/document-design-tokens";

interface RoleBadgeProps {
  role: string | ContactRole;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  variant?: "default" | "outline" | "subtle";
}

export function RoleBadge({
  role,
  size = "md",
  showLabel = true,
  showIcon = true,
  className,
  variant = "default",
}: RoleBadgeProps) {
  const normalizedRole = normalizeRole(role);
  const styles = getRoleStyles(normalizedRole);
  const Icon = getRoleIcon(normalizedRole);
  const displayName = getRoleDisplayName(normalizedRole);

  const sizeStyles = {
    sm: {
      container: "px-1.5 py-0.5 text-[10px] gap-1",
      icon: "h-3 w-3",
    },
    md: {
      container: "px-2 py-1 text-xs gap-1.5",
      icon: "h-3.5 w-3.5",
    },
    lg: {
      container: "px-3 py-1.5 text-sm gap-2",
      icon: "h-4 w-4",
    },
  };

  const variantStyles = {
    default: cn(styles.bg, styles.text),
    outline: cn("bg-transparent border", styles.border, styles.text),
    subtle: cn(styles.lightBg, styles.text),
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        sizeStyles[size].container,
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <Icon className={cn(sizeStyles[size].icon, "shrink-0")} />}
      {showLabel && <span>{displayName}</span>}
    </span>
  );
}

// Specialized badge for "PAYS" indicator
interface PaysBadgeProps {
  className?: string;
}

export function PaysBadge({ className }: PaysBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        "bg-emerald-500 text-white",
        className
      )}
    >
      Pays
    </span>
  );
}

// Specialized badge for "COPY" indicator (CC recipients)
interface CopyBadgeProps {
  className?: string;
}

export function CopyBadge({ className }: CopyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        "bg-slate-200 text-slate-600",
        className
      )}
    >
      Copy
    </span>
  );
}

// Combined role with billing status
interface RoleWithBillingProps {
  role: string | ContactRole;
  isBillingContact?: boolean;
  className?: string;
}

export function RoleWithBilling({
  role,
  isBillingContact = false,
  className,
}: RoleWithBillingProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <RoleBadge role={role} size="sm" />
      {isBillingContact ? <PaysBadge /> : <CopyBadge />}
    </div>
  );
}

export default RoleBadge;
