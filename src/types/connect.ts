// CONNECT CENTER TYPE DEFINITIONS
// Types for communication, calls, emails, and integrations

export interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
}

export interface CallLog {
  id: string;
  phone_number: string;
  user_id?: string;
  status: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration?: number;
  direction?: string;
  notes?: string;
}

export interface Email {
  id: string;
  client_id: string;
  email_address: string;
  subject: string;
  body: string;
  direction: 'incoming' | 'outgoing';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface SMSMessage {
  id: string;
  conversation_id?: string;
  direction: 'inbound' | 'outbound';
  content: string;
  from_address?: string;
  to_address?: string;
  created_at: string;
  status?: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  client_id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  last_message_at: string;
  unread_count: number;
  type: 'sms' | 'email' | 'call';
}

export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'voice' | 'webhook';
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  last_sync?: string;
  created_at: string;
}