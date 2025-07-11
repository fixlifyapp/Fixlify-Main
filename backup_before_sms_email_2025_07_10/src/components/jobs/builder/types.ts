
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  ourPrice?: number;
  taxable: boolean;
  total: number;
  discount?: number;
  name?: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  ourprice?: number; // Database field name
  ourPrice?: number; // Component field name - for compatibility
  cost?: number; // Alternative field name
  our_price?: number; // Alternative field name
  unit?: string;
  taxable?: boolean;
  quantity?: number; // Add quantity support
  tags?: string[]; // Add tags support
}

export interface EstimateLineItem extends LineItem {
  discount: number;
  ourPrice: number;
}

export interface InvoiceLineItem extends LineItem {
  invoiceId?: string;
}
