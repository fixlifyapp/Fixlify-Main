// DEPRECATED: This file provides backward compatibility
// Please use imports from '@/types' or '@/types/core/*' instead

// Re-export from new core types
export type {
  Client as UnifiedClient,
  ClientFormData,
  ClientWithMetadata
} from './core/client';

export type {
  Estimate as UnifiedEstimate,
  EstimateItem as UnifiedLineItem,
  CreateEstimateInput
} from './core/estimate';

export type {
  Invoice as UnifiedInvoice,
  InvoiceItem,
  CreateInvoiceInput
} from './core/invoice';

export type {
  Job,
  JobWithRelations,
  CreateJobInput,
  UpdateJobInput
} from './core/job';

export { JobStatus } from './core/job';

// Legacy type aliases for backward compatibility
export type LineItem = import('./core/estimate').EstimateItem;
export type Estimate = import('./core/estimate').Estimate;
export type Invoice = import('./core/invoice').Invoice;
export type Client = import('./core/client').Client;

// Message types (TODO: Move to core)
export interface UnifiedMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: string;
  direction: 'inbound' | 'outbound';
  status?: 'sent' | 'delivered' | 'failed' | 'read';
  type: 'sms' | 'email' | 'call';
  metadata?: any;
}

export interface UnifiedConversation {
  id: string;
  client_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  type: 'sms' | 'email' | 'call';
  messages?: UnifiedMessage[];
}

// Modal types for UI
export type UnifiedModalType = 
  | 'estimate' 
  | 'invoice' 
  | 'payment' 
  | 'message' 
  | 'email' 
  | 'view-estimate' 
  | 'view-invoice' 
  | 'client' 
  | 'job-details' 
  | 'expense' 
  | 'time-entry' 
  | 'note' 
  | 'job-message';

export type ModalType = UnifiedModalType;
export type Message = UnifiedMessage;
export type MessageConversation = UnifiedConversation;
