// Enhanced Automation Framework Types
// Based on FIXLIFY_AUTOMATION_SYSTEM_PLAN.md - Phase 1 Implementation

export interface AutomationTrigger {
  id: string;
  type: keyof TriggerTypes;
  name: string;
  description: string;
  conditions?: TriggerCondition[];
  config: any;
}

export interface AutomationAction {
  id: string;
  type: keyof (CommunicationActions & BusinessActions & AIActions);
  name: string;
  description: string;
  config: any;
  delay_minutes?: number;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  trigger_data: any;
}

export interface TriggerTypes {
  // Job Management Triggers
  job_created: {
    job_type?: string[];
    priority?: string[];
    location?: string[];
    technician?: string[];
  };
  job_status_changed: {
    from_status?: string[];
    to_status?: string[];
    job_type?: string[];
  };
  job_scheduled: {
    hours_before?: number;
    technician?: string[];
    job_type?: string[];
  };
  job_completed: {
    job_type?: string[];
    completion_rating?: number;
    payment_status?: string[];
  };
  
  // Client Management Triggers
  client_created: {
    client_type?: string[];
    lead_source?: string[];
    location?: string[];
  };
  client_updated: {
    fields_changed?: string[];
  };
  
  // Financial Triggers
  estimate_sent: {
    amount_range?: { min: number; max: number };
    job_type?: string[];
  };
  estimate_accepted: {
    amount_range?: { min: number; max: number };
  };
  invoice_sent: {
    amount_range?: { min: number; max: number };
    payment_terms?: string[];
  };
  invoice_overdue: {
    days_overdue?: number;
    amount_range?: { min: number; max: number };
  };
  payment_received: {
    payment_method?: string[];
    amount_range?: { min: number; max: number };
  };
  
  // Communication Triggers
  sms_received: {
    from_client?: string[];
    contains_keywords?: string[];
  };
  email_received: {
    from_client?: string[];
    subject_contains?: string[];
  };
  call_missed: {
    from_client?: string[];
    during_hours?: { start: string; end: string };
  };
  
  // Inventory & Products
  product_low_stock: {
    product_id?: string[];
    threshold?: number;
  };
  
  // Time-Based Triggers
  scheduled_time: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    time: string;
    days_of_week?: number[];
  };
  relative_time: {
    relative_to: string; // 'job_scheduled', 'invoice_sent', etc.
    offset_hours: number;
  };
}

export interface CommunicationActions {
  send_sms: {
    to: 'client' | 'technician' | 'custom';
    template_id?: string;
    message: string;
    schedule_delay?: number;
  };
  send_email: {
    to: 'client' | 'technician' | 'custom';
    template_id?: string;
    subject: string;
    body: string;
    attachments?: string[];
    schedule_delay?: number;
  };
  make_call: {
    to: 'client' | 'technician' | 'custom';
    caller_id?: string;
    script?: string;
  };
  send_push_notification: {
    to: 'technician' | 'office_staff';
    title: string;
    body: string;
    action_url?: string;
  };
}

export interface BusinessActions {
  create_job: {
    job_type: string;
    priority: string;
    assign_to?: string;
    schedule_date?: string;
    notes?: string;
  };
  update_job_status: {
    new_status: string;
    notes?: string;
    notify_client?: boolean;
  };
  assign_technician: {
    technician_id: string;
    notify_technician?: boolean;
    include_details?: boolean;
  };
  create_estimate: {
    template_id?: string;
    items: any[];
    notes?: string;
    auto_send?: boolean;
  };
  create_invoice: {
    template_id?: string;
    items: any[];
    payment_terms?: string;
    auto_send?: boolean;
  };
  create_task: {
    title: string;
    description?: string;
    assign_to?: string;
    due_date?: string;
    priority: string;
  };
  update_client: {
    fields: Record<string, any>;
    merge_strategy?: 'replace' | 'append';
  };
}

export interface AIActions {
  ai_generate_response: {
    context: 'sms' | 'email' | 'call';
    tone: 'professional' | 'friendly' | 'urgent';
    include_variables?: boolean;
  };
  ai_sentiment_analysis: {
    text_source: 'last_sms' | 'last_email' | 'job_notes';
    action_on_negative?: string;
  };
  ai_schedule_optimization: {
    consider_traffic?: boolean;
    prefer_technician?: string[];
    time_constraints?: any;
  };
  ai_price_suggestion: {
    based_on: 'market_rates' | 'historical_data' | 'competition';
    markup_percentage?: number;
  };
}

export interface ConditionTypes {
  field_comparison: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 
             'contains' | 'not_contains' | 'starts_with' | 'ends_with';
    value: any;
  };
  time_based: {
    condition: 'business_hours' | 'weekend' | 'holiday' | 'after_hours';
    timezone?: string;
  };
  geolocation: {
    client_within_radius: number; // miles
    from_location: 'technician' | 'office' | 'custom';
  };
  relationship: {
    client_has_jobs: { status: string[]; count: number };
    technician_availability: { date: string; duration_hours: number };
  };
  historical: {
    client_last_service: { days_ago: number; service_type?: string[] };
    payment_history: { on_time_percentage: number };
  };
}

export interface EnhancedWorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'branch';
  name: string;
  config: any;
  position: { x: number; y: number };
  connections?: string[]; // IDs of connected steps
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer_lifecycle' | 'revenue_optimization' | 'operational_efficiency' | 'customer_retention';
  industry_specific?: boolean;
  steps: EnhancedWorkflowStep[];
  trigger_type: keyof TriggerTypes;
  tags: string[];
  estimated_setup_time: number; // minutes
  business_impact: {
    time_saved_hours?: number;
    revenue_impact?: number;
    client_satisfaction_improvement?: number;
  };
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_data: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  steps_executed: {
    step_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    started_at: string;
    completed_at?: string;
    error_message?: string;
    output_data?: any;
  }[];
  error_message?: string;
  execution_time_ms?: number;
}

export interface WorkflowAnalytics {
  workflow_id: string;
  execution_count: number;
  success_rate: number;
  conversion_rate: number;
  revenue_generated: number;
  client_satisfaction_impact: number;
  time_saved_hours: number;
  cost_per_execution: number;
  roi_percentage: number;
  last_30_days: {
    executions: number;
    successes: number;
    failures: number;
    avg_execution_time_ms: number;
  };
}

// Predefined trigger configurations for easy setup
export const TRIGGER_DEFINITIONS = {
  job_created: {
    name: 'Job Created',
    description: 'Triggered when a new job is created',
    icon: 'briefcase',
    category: 'job_management',
    fields: [
      { name: 'job_type', type: 'multiselect', label: 'Job Types', options: [] },
      { name: 'priority', type: 'multiselect', label: 'Priorities', options: ['Low', 'Medium', 'High', 'Urgent'] },
      { name: 'location', type: 'multiselect', label: 'Locations', options: [] },
      { name: 'technician', type: 'multiselect', label: 'Technicians', options: [] }
    ]
  },
  client_created: {
    name: 'New Client Added',
    description: 'Triggered when a new client is added to the system',
    icon: 'user-plus',
    category: 'client_management',
    fields: [
      { name: 'client_type', type: 'multiselect', label: 'Client Types', options: ['Residential', 'Commercial'] },
      { name: 'lead_source', type: 'multiselect', label: 'Lead Sources', options: [] },
      { name: 'location', type: 'multiselect', label: 'Service Areas', options: [] }
    ]
  },
  invoice_overdue: {
    name: 'Invoice Overdue',
    description: 'Triggered when an invoice becomes overdue',
    icon: 'alert-circle',
    category: 'financial',
    fields: [
      { name: 'days_overdue', type: 'number', label: 'Days Overdue', min: 1, max: 365 },
      { name: 'amount_range', type: 'range', label: 'Amount Range', min: 0, max: 100000 }
    ]
  }
} as const;

// Predefined action configurations
export const ACTION_DEFINITIONS = {
  send_sms: {
    name: 'Send SMS',
    description: 'Send SMS message to client or technician',
    icon: 'message-square',
    category: 'communication',
    fields: [
      { name: 'to', type: 'select', label: 'Send To', options: ['client', 'technician', 'custom'] },
      { name: 'message', type: 'textarea', label: 'Message', required: true },
      { name: 'template_id', type: 'select', label: 'Template (Optional)', options: [] }
    ]
  },
  send_email: {
    name: 'Send Email',
    description: 'Send email to client or technician',
    icon: 'mail',
    category: 'communication',
    fields: [
      { name: 'to', type: 'select', label: 'Send To', options: ['client', 'technician', 'custom'] },
      { name: 'subject', type: 'text', label: 'Subject', required: true },
      { name: 'body', type: 'textarea', label: 'Message Body', required: true },
      { name: 'template_id', type: 'select', label: 'Template (Optional)', options: [] }
    ]
  },
  create_task: {
    name: 'Create Task',
    description: 'Create a new task for team members',
    icon: 'check-square',
    category: 'business_process',
    fields: [
      { name: 'title', type: 'text', label: 'Task Title', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'assign_to', type: 'select', label: 'Assign To', options: [] },
      { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'] }
    ]
  }
} as const;