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