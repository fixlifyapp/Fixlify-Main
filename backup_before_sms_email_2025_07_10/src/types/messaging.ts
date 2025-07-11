
// Centralized messaging types
export interface Message {
  id: string;
  conversation_id?: string;
  job_id?: string;
  client_id?: string;
  direction: 'inbound' | 'outbound';
  type: 'sms' | 'email';
  content: string;
  from: string;
  to: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  external_id?: string;
  provider_message_id?: string;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  client_id?: string;
  job_id?: string;
  status: 'active' | 'closed' | 'archived';
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage extends Message {
  type: 'email';
  subject?: string;
  body_html?: string;
  body_text?: string;
  attachments?: Array<{
    filename: string;
    content_type: string;
    size: number;
    url?: string;
  }>;
  opened_at?: string;
  clicked_at?: string;
}

export interface SMSMessage extends Message {
  type: 'sms';
  phone_number_id?: string;
  media_urls?: string[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email';
  subject?: string;
  content: string;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationLog {
  id: string;
  client_id: string;
  type: 'sms' | 'email' | 'call';
  provider: string;
  recipient: string;
  subject?: string;
  content?: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  external_id?: string;
  metadata?: Record<string, any>;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}
