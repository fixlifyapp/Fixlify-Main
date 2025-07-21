export type CommunicationType = 'email' | 'sms' | 'call' | 'internal_message';
export type CommunicationCategory = 'marketing' | 'support' | 'notification' | 'reminder' | 'general';

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  subject?: string;
  variables: any;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
  preview_data?: any;
}

export interface CommunicationAutomation {
  id: string;
  name: string;
  trigger_type: string;
  template_id: string;
  delay_minutes?: number;
  is_active: boolean;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
  trigger_conditions?: any;
}