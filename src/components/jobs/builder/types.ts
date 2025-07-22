
// LEGACY COMPATIBILITY FILE
// Import from unified types for consistency
export type {
  UnifiedLineItem as LineItem,
  UnifiedClient as Client
} from '@/types/unified';

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

// Remove these problematic interfaces - use UnifiedLineItem directly
