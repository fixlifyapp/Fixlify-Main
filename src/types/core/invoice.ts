// Invoice type definitions
import type { BaseOrganizationEntity, Metadata } from './base';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice extends BaseOrganizationEntity, Metadata {
  // Identity
  job_id: string;
  invoice_number: string;
  
  // Status
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  
  // Financial
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  
  // Dates
  due_date?: string | null;
  sent_at?: string | null;
  viewed_at?: string | null;
  paid_at?: string | null;
  
  // Communication
  message?: string | null;
  terms?: string | null;
  
  // Payment info
  payment_method?: string | null;
  payment_reference?: string | null;
  
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
  payments?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
  }>;
}

// Type for creating invoices
export interface CreateInvoiceInput {
  job_id: string;
  items: InvoiceItem[];
  tax_rate?: number;
  discount_amount?: number;
  due_date?: string;
  message?: string;
  terms?: string;
}
