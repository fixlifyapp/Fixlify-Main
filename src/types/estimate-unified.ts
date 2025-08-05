// Unified EstimateItem type that combines all needed properties
export interface EstimateItem {
  // Core properties
  id?: string;
  description: string;
  quantity: number;
  
  // Price properties (supporting both naming conventions)
  price?: number;
  unit_price?: number;
  unitPrice?: number;
  our_price?: number;
  ourPrice?: number;
  
  // Additional properties
  total?: number;
  discount?: number;
  taxable?: boolean;
  name?: string;
  
  // Database fields
  created_at?: string;
  updated_at?: string;
  parent_id?: string;
  parent_type?: string;
}

// Helper function to normalize price values
export const normalizeEstimateItem = (item: Partial<EstimateItem>): EstimateItem => {
  const unitPrice = item.unitPrice || item.unit_price || item.price || 0;
  const ourPrice = item.ourPrice || item.our_price || null;
  
  return {
    id: item.id,
    description: item.description || '',
    quantity: item.quantity || 1,
    price: unitPrice,
    unit_price: unitPrice,
    unitPrice: unitPrice,
    our_price: ourPrice,
    ourPrice: ourPrice,
    total: item.total || unitPrice * (item.quantity || 1),
    discount: item.discount || 0,
    taxable: item.taxable || false,
    name: item.name || item.description,
    created_at: item.created_at,
    updated_at: item.updated_at,
    parent_id: item.parent_id,
    parent_type: item.parent_type,
  };
};