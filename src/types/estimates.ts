import { Database } from '@/integrations/supabase/types';

// Use the actual database line_items type with extended properties for UI compatibility
export type EstimateItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  our_price: number | null;
  discount: number | null;
  taxable: boolean;
  created_at: string;
  updated_at: string;
  parent_id: string;
  parent_type: string;
  // Additional properties for UI compatibility
  name?: string;
  unitPrice?: number;
  ourPrice?: number;
};

// Helper function to convert database line_items to EstimateItem
export const mapLineItemToEstimateItem = (lineItem: Database['public']['Tables']['line_items']['Row']): EstimateItem => ({
  ...lineItem,
  name: lineItem.description, // Use description as name fallback
  unitPrice: lineItem.unit_price,
  ourPrice: lineItem.our_price || undefined,
});

// Helper function to convert EstimateItem to database line_items
export const mapEstimateItemToLineItem = (item: EstimateItem): Database['public']['Tables']['line_items']['Insert'] => ({
  description: item.description,
  unit_price: item.unitPrice || item.unit_price || 0,
  our_price: item.ourPrice || item.our_price || null,
  quantity: item.quantity || 1,
  taxable: item.taxable || false,
  discount: item.discount || null,
  parent_id: item.parent_id,
  parent_type: item.parent_type,
});