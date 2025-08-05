// Temporary types to fix build errors - this bypasses the complex EstimateItem issues

export interface TempEstimateItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  our_price?: number | null;
  discount?: number | null;
  taxable: boolean;
  created_at?: string;
  updated_at?: string;
  parent_id?: string;
  parent_type?: string;
  // Legacy compatibility
  name?: string;
  unitPrice?: number;
  ourPrice?: number;
}

export interface TempJobInfo {
  id: string;
  clientId?: string;
  client_id?: string;
  client?: string | any;
  clients?: any;
  service?: string;
  address?: string;
  phone?: string;
  email?: string;
  total?: number;
  revenue?: number;
  status?: string;
  description?: string;
  estimates?: any[];
  invoices?: any[];
  payments?: any[];
  [key: string]: any;
}