// Data transformation utilities for backward compatibility

import { LineItem as DocumentsLineItem } from '@/types/documents';
import { LineItem as BuilderLineItem } from '@/components/jobs/builder/types';

// Transform between different LineItem formats
export const transformLineItem = {
  // Convert database/builder format to documents format
  toDocuments: (item: any): DocumentsLineItem => ({
    id: item.id || '',
    name: item.name || item.description || '',
    description: item.description || '',
    quantity: item.quantity || 1,
    unit_price: item.unit_price || item.unitPrice || item.price || 0,
    unitPrice: item.unitPrice || item.unit_price || item.price || 0,
    taxable: item.taxable !== false,
    total: item.total || 0,
    discount: item.discount || 0
  }),

  // Convert documents format to builder format
  toBuilder: (item: DocumentsLineItem): BuilderLineItem => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    quantity: item.quantity,
    unitPrice: item.unitPrice || item.unit_price,
    unit_price: item.unit_price || item.unitPrice,
    ourPrice: (item as any).ourPrice || 0,
    taxable: item.taxable,
    total: item.total,
    discount: (item as any).discount || 0,
    price: item.unitPrice || item.unit_price
  }),

  // Normalize any line item to have both formats
  normalize: (item: any): any => ({
    ...item,
    name: item.name || item.description || '',
    description: item.description || item.name || '',
    unit_price: item.unit_price || item.unitPrice || item.price || 0,
    unitPrice: item.unitPrice || item.unit_price || item.price || 0,
    total: item.total || (item.quantity || 1) * (item.unitPrice || item.unit_price || item.price || 0)
  })
};

// Transform database results to expected formats
export const transformDatabaseResults = {
  invoices: (dbInvoices: any[]): any[] => {
    return (dbInvoices || []).map(invoice => ({
      ...invoice,
      items: (invoice.items || []).map(transformLineItem.normalize),
      payment_status: invoice.payment_status || 'unpaid',
      amount_paid: invoice.amount_paid || 0,
      issue_date: invoice.issue_date || invoice.created_at,
      due_date: invoice.due_date || null,
      tax_rate: invoice.tax_rate || 0,
      subtotal: invoice.subtotal || invoice.total || 0,
      tax_amount: invoice.tax_amount || 0,
      discount_amount: invoice.discount_amount || 0
    }));
  },

  estimates: (dbEstimates: any[]): any[] => {
    return (dbEstimates || []).map(estimate => ({
      ...estimate,
      items: (estimate.items || []).map(transformLineItem.normalize),
      number: estimate.number || estimate.estimate_number,
      valid_until: estimate.valid_until || null,
      tax_rate: estimate.tax_rate || 0,
      subtotal: estimate.subtotal || estimate.total || 0,
      tax_amount: estimate.tax_amount || 0
    }));
  }
};