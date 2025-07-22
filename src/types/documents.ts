
// Document types for estimates and invoices
export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  unitPrice?: number; // For backward compatibility
  taxable: boolean;
  total: number;
}

export interface Estimate {
  id: string;
  job_id: string;
  client_id?: string;
  estimate_number: string;
  number?: string; // For backward compatibility
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  items: LineItem[];
  upsells?: LineItem[];
  notes?: string;
  valid_until?: string;
  tax_rate?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Invoice {
  id: string;
  job_id: string;
  client_id?: string;
  estimate_id?: string;
  invoice_number: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  balance_due: number;
  paid_at?: string;
  items: LineItem[];
  notes?: string;
  payment_status?: 'paid' | 'unpaid' | 'partial';
  amount_paid?: number;
  issue_date?: string;
  due_date?: string;
  tax_rate?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DocumentSendParams {
  documentType: 'estimate' | 'invoice';
  documentId: string;
  sendMethod: 'email' | 'sms';
  sendTo: string;
  customMessage?: string;
  contactInfo?: any;
}

export interface DocumentSendResult {
  success: boolean;
  error?: string;
}
