// Placeholder types - to be implemented
export interface DocumentSendParams {
  documentType: 'estimate' | 'invoice';
  documentId: string;
  sendMethod: 'email' | 'sms';
  sendTo: string;
  customMessage?: string;
  contactInfo?: any;
}

export interface DocumentSendResult {
  success: boolean;
  error?: string;
}

export interface Estimate {
  id: string;
  estimate_number: string;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  [key: string]: any;
}

export interface LineItem {
  id: string;
  name?: string;
  description?: string;
  [key: string]: any;
}