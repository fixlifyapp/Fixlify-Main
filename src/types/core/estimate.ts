// Estimate type definitions
import type { BaseOrganizationEntity, Metadata } from './base';

export interface EstimateItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Estimate extends BaseOrganizationEntity, Metadata {
  // Identity
  job_id: string;
  estimate_number: string;
  
  // Status
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';
  
  // Financial
  items: EstimateItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  
  // Dates
  valid_until?: string | null;
  sent_at?: string | null;
  viewed_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  
  // Communication
  message?: string | null;
  terms?: string | null;
  
  // Relations (populated by queries)
  job?: {
    id: string;
    title: string;
    client_id: string;
  };
  client?: {
    id: string;
    name: string;
    email?: string;
  };
}

// Type for creating estimates
export interface CreateEstimateInput {
  job_id: string;
  items: EstimateItem[];
  tax_rate?: number;
  discount_amount?: number;
  message?: string;
  terms?: string;
  valid_until?: string;
}
