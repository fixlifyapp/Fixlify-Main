
// Centralized document types - replaces duplicate interfaces across the codebase
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  taxable?: boolean;
  discount?: number;
}

export interface DocumentBase {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  client_id?: string;
  job_id: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'paid' | 'overdue' | 'cancelled' | 'converted';
  items: LineItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  total: number;
  notes?: string;
  terms?: string;
}

export interface Estimate extends DocumentBase {
  estimate_number: string;
  number?: string; // Legacy support
  amount?: number; // Legacy support
  date?: string; // Legacy support
  valid_until?: string;
  sent_at?: string;
  approved_at?: string;
  client_signature?: string;
  signature_timestamp?: string;
  signature_ip?: string;
  portal_access_token?: string;
  // Add techniciansNote for compatibility
  techniciansNote?: string;
}

export interface Invoice extends DocumentBase {
  invoice_number: string;
  number?: string; // Legacy support
  amount?: number; // Legacy support
  date?: string; // Legacy support
  issue_date: string;
  due_date?: string;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  balance_due?: number;
  amount_paid: number;
  paid_at?: string;
  sent_at?: string;
  payment_link?: string;
  portal_access_token?: string;
  estimate_id?: string;
  balance?: number; // Legacy support
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: 'cash' | 'check' | 'card' | 'bank_transfer' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  technician_id?: string;
  reference?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface DocumentCommunication {
  id: string;
  document_id: string;
  document_type: 'estimate' | 'invoice';
  document_number: string;
  communication_type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  content?: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  external_id?: string;
  provider_message_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'estimate' | 'invoice';

export interface DocumentSendParams {
  documentType: DocumentType;
  documentId: string;
  sendMethod: 'email' | 'sms';
  sendTo: string;
  customMessage?: string;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface DocumentSendResult {
  success: boolean;
  error?: string;
}
