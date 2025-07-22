// UNIVERSAL DATA TRANSFORMERS
// This file contains utilities to transform data between different formats

import { UnifiedLineItem, UnifiedEstimate, UnifiedInvoice, UnifiedClient } from '@/types/unified';

// Transform any line item format to unified format
export const transformToUnifiedLineItem = (item: any): UnifiedLineItem => {
  const unitPrice = Number(item.unit_price || item.unitPrice || item.price || 0);
  const quantity = Number(item.quantity || 1);
  
  return {
    id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
    name: item.name || item.description || '',
    description: item.description || item.name || '',
    quantity,
    unit_price: unitPrice,
    unitPrice,
    price: unitPrice,
    ourPrice: Number(item.ourPrice || item.our_price || 0),
    taxable: item.taxable !== false,
    total: Number(item.total || (quantity * unitPrice)),
    discount: Number(item.discount || 0)
  };
};

// Transform array of line items
export const transformLineItemsArray = (items: any[]): UnifiedLineItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map(transformToUnifiedLineItem);
};

// Transform any estimate format to unified format
export const transformToUnifiedEstimate = (estimate: any): UnifiedEstimate => {
  return {
    id: estimate.id,
    job_id: estimate.job_id,
    client_id: estimate.client_id,
    estimate_number: estimate.estimate_number || estimate.number,
    number: estimate.number || estimate.estimate_number,
    status: estimate.status || 'draft',
    items: transformLineItemsArray(estimate.items || []),
    subtotal: Number(estimate.subtotal || 0),
    tax_rate: Number(estimate.tax_rate || 0),
    tax_amount: Number(estimate.tax_amount || 0),
    total: Number(estimate.total || 0),
    notes: estimate.notes,
    terms: estimate.terms,
    valid_until: estimate.valid_until,
    created_at: estimate.created_at || new Date().toISOString(),
    updated_at: estimate.updated_at || new Date().toISOString(),
    created_by: estimate.created_by || 'system'
  };
};

// Transform any invoice format to unified format
export const transformToUnifiedInvoice = (invoice: any): UnifiedInvoice => {
  return {
    id: invoice.id,
    job_id: invoice.job_id,
    client_id: invoice.client_id,
    invoice_number: invoice.invoice_number || invoice.number,
    number: invoice.number || invoice.invoice_number,
    status: invoice.status || 'draft',
    payment_status: invoice.payment_status || 'unpaid',
    items: transformLineItemsArray(invoice.items || []),
    subtotal: Number(invoice.subtotal || 0),
    tax_rate: Number(invoice.tax_rate || 0),
    tax_amount: Number(invoice.tax_amount || 0),
    total: Number(invoice.total || 0),
    amount_paid: Number(invoice.amount_paid || 0),
    balance_due: Number(invoice.balance_due || (invoice.total - invoice.amount_paid) || 0),
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    notes: invoice.notes,
    terms: invoice.terms,
    created_at: invoice.created_at || new Date().toISOString(),
    updated_at: invoice.updated_at || new Date().toISOString(),
    created_by: invoice.created_by || 'system'
  };
};

// Transform any client format to unified format
export const transformToUnifiedClient = (client: any): UnifiedClient => {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    state: client.state,
    zip: client.zip,
    country: client.country || 'USA',
    company: client.company,
    notes: client.notes,
    status: client.status || 'active',
    type: client.type || 'Residential',
    tags: client.tags || [],
    created_at: client.created_at,
    updated_at: client.updated_at,
    created_by: client.created_by,
    user_id: client.user_id
  };
};

// Create default line item
export const createDefaultLineItem = (): UnifiedLineItem => ({
  id: `item-${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  unitPrice: 0,
  price: 0,
  ourPrice: 0,
  taxable: true,
  total: 0,
  discount: 0
});

// Validate unified line item
export const isValidLineItem = (item: any): item is UnifiedLineItem => {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.taxable === 'boolean' &&
    typeof item.total === 'number'
  );
};