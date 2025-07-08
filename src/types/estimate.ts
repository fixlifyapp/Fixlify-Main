
export interface Estimate {
  id: string;
  estimate_number: string;
  job_id: string;
  client_id?: string;
  title?: string;
  description?: string;
  items?: any[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  valid_until?: string;
  terms?: string;
  notes?: string;
  sent_at?: string;
  approved_at?: string;
  client_signature?: string;
  signature_timestamp?: string;
  signature_ip?: string;
  portal_access_token?: string;
  created_by?: string;
  user_id?: string;
}

export interface EstimateItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}
