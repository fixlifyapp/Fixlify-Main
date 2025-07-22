// UNIFIED TYPE DEFINITIONS
// This file contains the single source of truth for all shared types

// Universal LineItem interface that supports all use cases
export interface UnifiedLineItem {
  id: string;
  name?: string;
  description?: string;
  quantity: number;
  unit_price?: number;
  unitPrice?: number;
  price?: number;
  ourPrice?: number;
  taxable: boolean;
  total: number;
  discount?: number;
}

// Universal Document interfaces
export interface UnifiedEstimate {
  id: string;
  job_id: string;
  client_id?: string;
  estimate_number: string;
  number?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';
  items: UnifiedLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  terms?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface UnifiedInvoice {
  id: string;
  job_id: string;
  client_id?: string;
  invoice_number: string;
  number?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_status?: string;
  items: UnifiedLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid?: number;
  balance_due?: number;
  issue_date: string;
  due_date: string;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Universal Client interface
export interface UnifiedClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  company?: string;
  notes?: string;
  status?: string;
  type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  user_id?: string;
}

// Universal Message interfaces
export interface UnifiedMessage {
  id: string;
  conversation_id?: string;
  direction: 'inbound' | 'outbound';
  content: string;
  from_address?: string;
  to_address?: string;
  created_at: string;
  status?: string;
  metadata?: any;
}

export interface UnifiedConversation {
  id: string;
  client_id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  last_message_at: string;
  unread_count: number;
  type: 'sms' | 'email' | 'call';
  client?: UnifiedClient;
}

// Universal Modal types
export type UnifiedModalType = 
  | 'createEstimate'
  | 'editEstimate' 
  | 'createInvoice'
  | 'editInvoice'
  | 'clientSelection'
  | 'deleteConfirm';

// Re-export for backward compatibility
export type LineItem = UnifiedLineItem;
export type Estimate = UnifiedEstimate;
export type Invoice = UnifiedInvoice;
export type Client = UnifiedClient;
export type Message = UnifiedMessage;
export type MessageConversation = UnifiedConversation;
export type ModalType = UnifiedModalType;