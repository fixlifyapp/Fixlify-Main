
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface EstimateData {
  id?: string;
  estimate_number: string;
  title: string;
  description: string;
  items: EstimateItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  terms?: string;
  valid_until?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}
