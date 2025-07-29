// Comprehensive automation triggers with backend integration
import { TriggerTypes } from '@/types/automationFramework';

export interface TriggerDefinition {
  key: keyof TriggerTypes;
  name: string;
  description: string;
  category: 'job_management' | 'client_management' | 'financial' | 'configuration' | 'time_based';
  icon: string;
  implemented: boolean;
  backendFunction?: string;
}

export const AUTOMATION_TRIGGERS: TriggerDefinition[] = [
  // Job Management Triggers
  {
    key: 'job_created',
    name: 'Job Created',
    description: 'Triggers when a new job is created',
    category: 'job_management',
    icon: '📋',
    implemented: true,
    backendFunction: 'handle_job_automation_triggers'
  },
  {
    key: 'job_status_changed',
    name: 'Job Status Changed',
    description: 'Triggers when a job status is updated',
    category: 'job_management',
    icon: '🔄',
    implemented: true,
    backendFunction: 'handle_job_automation_triggers'
  },
  {
    key: 'job_scheduled',
    name: 'Job Scheduled',
    description: 'Triggers when a job is scheduled',
    category: 'job_management',
    icon: '📅',
    implemented: true,
    backendFunction: 'handle_job_automation_triggers'
  },
  {
    key: 'job_completed',
    name: 'Job Completed',
    description: 'Triggers when a job is marked as completed',
    category: 'job_management',
    icon: '✅',
    implemented: true,
    backendFunction: 'handle_job_automation_triggers'
  },
  {
    key: 'job_tags_changed',
    name: 'Job Tags Changed',
    description: 'Triggers when job tags are added or removed',
    category: 'job_management',
    icon: '🏷️',
    implemented: true,
    backendFunction: 'handle_job_tag_automation_triggers'
  },

  // Client Management Triggers
  {
    key: 'client_created',
    name: 'Client Created',
    description: 'Triggers when a new client is added',
    category: 'client_management',
    icon: '👤',
    implemented: true,
    backendFunction: 'handle_client_automation_triggers'
  },
  {
    key: 'client_updated',
    name: 'Client Updated',
    description: 'Triggers when client information is updated',
    category: 'client_management',
    icon: '✏️',
    implemented: false
  },
  {
    key: 'client_tags_changed',
    name: 'Client Tags Changed',
    description: 'Triggers when client tags are modified',
    category: 'client_management',
    icon: '🏷️',
    implemented: true,
    backendFunction: 'handle_client_tag_automation_triggers'
  },

  // Financial Triggers
  {
    key: 'estimate_sent',
    name: 'Estimate Sent',
    description: 'Triggers when an estimate is created or sent',
    category: 'financial',
    icon: '📝',
    implemented: true,
    backendFunction: 'handle_estimate_automation_triggers'
  },
  {
    key: 'estimate_accepted',
    name: 'Estimate Accepted',
    description: 'Triggers when an estimate is accepted by client',
    category: 'financial',
    icon: '✅',
    implemented: true,
    backendFunction: 'handle_estimate_automation_triggers'
  },
  {
    key: 'estimate_rejected',
    name: 'Estimate Rejected',
    description: 'Triggers when an estimate is rejected',
    category: 'financial',
    icon: '❌',
    implemented: true,
    backendFunction: 'handle_estimate_automation_triggers'
  },
  {
    key: 'estimate_status_changed',
    name: 'Estimate Status Changed',
    description: 'Triggers when estimate status changes',
    category: 'financial',
    icon: '🔄',
    implemented: true,
    backendFunction: 'handle_estimate_automation_triggers'
  },
  {
    key: 'invoice_sent',
    name: 'Invoice Sent',
    description: 'Triggers when an invoice is created or sent',
    category: 'financial',
    icon: '💰',
    implemented: true,
    backendFunction: 'handle_invoice_automation_triggers'
  },
  {
    key: 'invoice_overdue',
    name: 'Invoice Overdue',
    description: 'Triggers when an invoice becomes overdue',
    category: 'financial',
    icon: '⏰',
    implemented: false
  },
  {
    key: 'payment_received',
    name: 'Payment Received',
    description: 'Triggers when a payment is received',
    category: 'financial',
    icon: '💳',
    implemented: true,
    backendFunction: 'handle_invoice_automation_triggers'
  },

  // Configuration Triggers
  {
    key: 'job_status_created',
    name: 'Job Status Created',
    description: 'Triggers when a new job status is created',
    category: 'configuration',
    icon: '➕',
    implemented: true,
    backendFunction: 'handle_job_status_automation_triggers'
  },
  {
    key: 'job_status_updated',
    name: 'Job Status Updated',
    description: 'Triggers when a job status is modified',
    category: 'configuration',
    icon: '✏️',
    implemented: true,
    backendFunction: 'handle_job_status_automation_triggers'
  },
  {
    key: 'tag_created',
    name: 'Tag Created',
    description: 'Triggers when a new tag is created',
    category: 'configuration',
    icon: '🏷️',
    implemented: true,
    backendFunction: 'handle_tag_automation_triggers'
  },
  {
    key: 'tag_updated',
    name: 'Tag Updated',
    description: 'Triggers when a tag is modified',
    category: 'configuration',
    icon: '✏️',
    implemented: true,
    backendFunction: 'handle_tag_automation_triggers'
  },
  {
    key: 'lead_source_created',
    name: 'Lead Source Created',
    description: 'Triggers when a new lead source is created',
    category: 'configuration',
    icon: '📞',
    implemented: true,
    backendFunction: 'handle_lead_source_automation_triggers'
  },
  {
    key: 'lead_source_updated',
    name: 'Lead Source Updated',
    description: 'Triggers when a lead source is modified',
    category: 'configuration',
    icon: '✏️',
    implemented: true,
    backendFunction: 'handle_lead_source_automation_triggers'
  },

  // Time-Based Triggers
  {
    key: 'scheduled_time',
    name: 'Scheduled Time',
    description: 'Triggers at a specific date and time',
    category: 'time_based',
    icon: '⏰',
    implemented: false
  },
  {
    key: 'relative_time',
    name: 'Relative Time',
    description: 'Triggers relative to another event (e.g., 1 day after job completion)',
    category: 'time_based',
    icon: '⏱️',
    implemented: false
  }
];

export const getTriggersByCategory = (category?: string) => {
  if (!category || category === 'all') {
    return AUTOMATION_TRIGGERS;
  }
  return AUTOMATION_TRIGGERS.filter(trigger => trigger.category === category);
};

export const getImplementedTriggers = () => {
  return AUTOMATION_TRIGGERS.filter(trigger => trigger.implemented);
};

export const getTriggerByKey = (key: keyof TriggerTypes) => {
  return AUTOMATION_TRIGGERS.find(trigger => trigger.key === key);
};

export const TRIGGER_CATEGORIES = [
  { key: 'all', name: 'All Triggers', count: AUTOMATION_TRIGGERS.length },
  { key: 'job_management', name: 'Job Management', count: getTriggersByCategory('job_management').length },
  { key: 'client_management', name: 'Client Management', count: getTriggersByCategory('client_management').length },
  { key: 'financial', name: 'Financial', count: getTriggersByCategory('financial').length },
  { key: 'configuration', name: 'Configuration', count: getTriggersByCategory('configuration').length },
  { key: 'time_based', name: 'Time-Based', count: getTriggersByCategory('time_based').length }
];