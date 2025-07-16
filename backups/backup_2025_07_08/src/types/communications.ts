// Communication types for Connect Center
export type CommunicationType = 'email' | 'sms' | 'internal_message';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
export type CommunicationCategory = 'estimate' | 'invoice' | 'notification' | 'marketing' | 'system' | 'general';

export interface Communication {
  id: string;
  type: CommunicationType;
  category: CommunicationCategory;
  status: CommunicationStatus;
  from: string;
  to: string;
  subject?: string;
  content: string;
  client_id?: string;
  job_id?: string;
  estimate_id?: string;
  invoice_id?: string;
  team_member_id?: string;
  metadata?: Record<string, any>;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  category: CommunicationCategory;
  type: CommunicationType;
  subject_template?: string;
  content_template: string;
  variables: string[];
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationAutomation {
  id: string;
  name: string;
  trigger_type: 'estimate_created' | 'invoice_created' | 'job_completed' | 'custom';
  trigger_conditions?: Record<string, any>;
  template_id: string;
  delay_minutes?: number;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}