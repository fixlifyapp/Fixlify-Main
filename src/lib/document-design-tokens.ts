/**
 * Document Design Tokens - 2026 Design System
 * Centralized tokens for estimate/invoice documents
 * Supports multi-party billing with role-based visual hierarchy
 */

import { Building, Home, Users, AlertTriangle, User, LucideIcon } from "lucide-react";

// Role Types
export type ContactRole =
  | "landlord"
  | "tenant"
  | "property_manager"
  | "emergency_contact"
  | "client";

// Role Color Configuration
export interface RoleColors {
  bg: string;
  text: string;
  border: string;
  lightBg: string;
}

export const roleColors: Record<ContactRole, RoleColors> = {
  landlord: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    lightBg: "bg-violet-50",
  },
  tenant: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    lightBg: "bg-emerald-50",
  },
  property_manager: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    lightBg: "bg-blue-50",
  },
  emergency_contact: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    lightBg: "bg-amber-50",
  },
  client: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    lightBg: "bg-slate-50",
  },
};

// Role Icons
export const roleIcons: Record<ContactRole, LucideIcon> = {
  landlord: Building,
  tenant: Home,
  property_manager: Users,
  emergency_contact: AlertTriangle,
  client: User,
};

// Role Display Names
export const roleDisplayNames: Record<ContactRole, string> = {
  landlord: "Landlord",
  tenant: "Tenant",
  property_manager: "Property Manager",
  emergency_contact: "Emergency Contact",
  client: "Client",
};

// Billing Flow Tokens
export interface BillingFlowStep {
  type: "service_at" | "service_for" | "bill_to";
  label: string;
  description: string;
}

export const billingFlowSteps: Record<string, BillingFlowStep> = {
  service_at: {
    type: "service_at",
    label: "Service At",
    description: "Location where service is performed",
  },
  service_for: {
    type: "service_for",
    label: "Service For",
    description: "Person who requested or benefits from service",
  },
  bill_to: {
    type: "bill_to",
    label: "Bill To",
    description: "Person responsible for payment",
  },
};

// Document Status Colors
export type DocumentStatus = "draft" | "sent" | "viewed" | "approved" | "paid" | "partial" | "overdue" | "rejected";

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export const documentStatusColors: Record<DocumentStatus, StatusColors> = {
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  sent: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  viewed: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  paid: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  partial: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  overdue: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
};

// Payment Progress Thresholds
export const paymentProgressThresholds = {
  low: 25,    // 0-25% - red
  medium: 50, // 25-50% - amber
  high: 75,   // 50-75% - yellow
  full: 100,  // 75-100% - green
};

// Typography Scale
export const documentTypography = {
  title: "text-2xl font-bold tracking-tight",
  subtitle: "text-lg font-semibold",
  label: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
  body: "text-sm",
  small: "text-xs text-muted-foreground",
  amount: "text-xl font-bold tabular-nums",
  amountSmall: "text-sm font-semibold tabular-nums",
};

// Spacing Scale
export const documentSpacing = {
  section: "space-y-4",
  sectionCompact: "space-y-2",
  card: "p-4",
  cardCompact: "p-3",
  grid: "gap-4",
  gridCompact: "gap-2",
};

// Animation Tokens
export const documentAnimations = {
  fadeIn: "animate-in fade-in duration-200",
  slideUp: "animate-in slide-in-from-bottom-2 duration-200",
  scaleIn: "animate-in zoom-in-95 duration-200",
};

// Helper function to get role styles
export function getRoleStyles(role: ContactRole): RoleColors {
  return roleColors[role] || roleColors.client;
}

// Helper function to get role icon
export function getRoleIcon(role: ContactRole): LucideIcon {
  return roleIcons[role] || roleIcons.client;
}

// Helper function to get role display name
export function getRoleDisplayName(role: ContactRole): string {
  return roleDisplayNames[role] || "Client";
}

// Helper function to normalize role string to ContactRole
export function normalizeRole(role: string | null | undefined): ContactRole {
  if (!role) return "client";

  const normalized = role.toLowerCase().replace(/[\s-]/g, "_");

  const roleMap: Record<string, ContactRole> = {
    landlord: "landlord",
    owner: "landlord",
    property_owner: "landlord",
    tenant: "tenant",
    renter: "tenant",
    property_manager: "property_manager",
    manager: "property_manager",
    pm: "property_manager",
    emergency_contact: "emergency_contact",
    emergency: "emergency_contact",
    client: "client",
    customer: "client",
  };

  return roleMap[normalized] || "client";
}

// Helper function to get payment progress color
export function getPaymentProgressColor(percentage: number): string {
  if (percentage >= paymentProgressThresholds.full) return "bg-emerald-500";
  if (percentage >= paymentProgressThresholds.high) return "bg-green-500";
  if (percentage >= paymentProgressThresholds.medium) return "bg-yellow-500";
  if (percentage >= paymentProgressThresholds.low) return "bg-amber-500";
  return "bg-red-500";
}

// Helper function to format currency
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
