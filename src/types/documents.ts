// LEGACY COMPATIBILITY FILE
// Import from unified types for consistency
export type {
  UnifiedLineItem as LineItem,
  UnifiedEstimate as Estimate,
  UnifiedInvoice as Invoice,
  UnifiedClient as Client,
  UnifiedMessage as Message,
  UnifiedConversation as MessageConversation,
  UnifiedModalType as ModalType
} from './unified';

// Legacy email types for backward compatibility
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  thread_id?: string;
  in_reply_to?: string;
  message_id?: string;
  status?: 'sent' | 'received' | 'draft';
  conversation_id?: string;
}

export interface ConversationThreadProps {
  conversation: {
    id: string;
    client_id: string;
    client_name: string;
    client_phone?: string;
    client_email?: string;
    last_message_at: string;
    unread_count: number;
    type: 'sms' | 'email' | 'call';
  };
  onBack: () => void;
}