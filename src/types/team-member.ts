
import { UserRole } from "@/components/auth/types";

export interface TeamMemberSkill {
  id: string;
  name: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zipCode?: string;
}

export interface TeamMemberProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  avatar?: string;
  lastLogin?: string;
  isPublic: boolean;
  availableForJobs: boolean;
  phone?: string[];
  address?: string;
  twoFactorEnabled: boolean;
  callMaskingEnabled: boolean;
  laborCostPerHour: number;
  skills: TeamMemberSkill[];
  serviceAreas: ServiceArea[];
  scheduleColor: string;
  internalNotes?: string;
  usesTwoFactor: boolean;
  commissionRate?: number;
  commissionRules?: CommissionRule[];
  commissionFees?: CommissionFee[];
}

export interface CommissionRule {
  id: string;
  name: string;
  type: 'schedule' | 'job-type' | 'amount' | 'company';
  value: number; // percentage
  condition?: any; // specific conditions based on type
}

export interface CommissionFee {
  id: string;
  name: string;
  value: number; // percentage
  deductFromTotal?: boolean;
}

export interface TeamMemberCommission {
  baseRate: number;
  rules: CommissionRule[];
  fees: CommissionFee[];
}

export interface Permission {
  id: string;
  name: string;
  module: 'jobs' | 'clients' | 'estimates' | 'invoices' | 'reports' | 'finance' | 'schedule' | 'automation';
  type: 'view' | 'edit' | 'create' | 'delete';
  enabled: boolean;
}

export interface TeamMemberPermissions {
  permissions: Permission[];
}

export interface AIInsight {
  id: string;
  type: 'performance' | 'upsell' | 'satisfaction' | 'skill';
  message: string;
  details: string;
  icon: string;
  action?: {
    label: string;
    url?: string;
    handler?: string;
  };
  createdAt: string;
  acknowledged: boolean;
}
