// Payment type definitions
import type { BaseOrganizationEntity, Metadata } from './base';

export interface Payment extends BaseOrganizationEntity, Metadata {
  // Identity
  job_id?: string | null;
  invoice_id?: string | null;
  client_id: string;
  
  // Amount
  amount: number;
  currency?: string;
  
  // Payment details
  payment_method: 'cash' | 'check' | 'card' | 'bank_transfer' | 'other';
  payment_date: string;
  reference_number?: string | null;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Processing
  processor?: string | null;
  processor_payment_id?: string | null;
  processor_fee?: number | null;
  
  // Relations (populated by queries)
  job?: {
    id: string;
    title: string;
  };
  invoice?: {
    id: string;
    invoice_number: string;
    total: number;
  };
  client?: {
    id: string;
    name: string;
  };
}

// Type for creating payments
export interface CreatePaymentInput {
  client_id: string;
  job_id?: string;
  invoice_id?: string;
  amount: number;
  payment_method: Payment['payment_method'];
  payment_date?: string;
  reference_number?: string;
  notes?: string;
}
