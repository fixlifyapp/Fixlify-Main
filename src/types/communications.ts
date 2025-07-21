export type CommunicationType = 'email' | 'sms' | 'call' | 'internal_message';
export type CommunicationCategory = 'marketing' | 'support' | 'notification' | 'reminder' | 'general';

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: CommunicationType;
  category: CommunicationCategory;
  subject_template: string;
  content_template: string;
  is_active: boolean;
  variables: string[];
  organization_id: string;
}

export interface CommunicationAutomation {
  id: string;
  name: string;
  type: CommunicationType;
  trigger: string;
  template_id: string;
  is_active: boolean;
  organization_id: string;
}