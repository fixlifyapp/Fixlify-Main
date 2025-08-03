// Automation System Configuration
// Defines all available triggers and actions for the automation system

export const AUTOMATION_TRIGGERS = {
  // Job triggers
  job_created: {
    name: 'Job Created',
    description: 'When a new job is created',
    icon: 'Plus',
    category: 'jobs'
  },
  job_status_changed: {
    name: 'Job Status Changed',
    description: 'When job status changes',
    icon: 'RefreshCw',
    category: 'jobs',
    conditions: ['status']
  },
  job_scheduled: {
    name: 'Job Scheduled',
    description: 'When a job is scheduled',
    icon: 'Calendar',
    category: 'jobs'
  },
  
  // Client triggers
  client_created: {
    name: 'Client Created',
    description: 'When a new client is added',
    icon: 'UserPlus',
    category: 'clients'
  },
  client_updated: {
    name: 'Client Updated',
    description: 'When client information is updated',
    icon: 'UserCheck',
    category: 'clients'
  },
  client_tags_changed: {
    name: 'Client Tags Changed',
    description: 'When client tags are modified',
    icon: 'Tag',
    category: 'clients'
  },
  
  // Estimate triggers
  estimate_sent: {
    name: 'Estimate Sent',
    description: 'When an estimate is sent to client',
    icon: 'FileText',
    category: 'estimates'
  },
  estimate_accepted: {
    name: 'Estimate Accepted',
    description: 'When client accepts an estimate',
    icon: 'CheckCircle',
    category: 'estimates'
  },
  estimate_declined: {
    name: 'Estimate Declined',
    description: 'When client declines an estimate',
    icon: 'XCircle',
    category: 'estimates'
  },
  
  // Invoice triggers
  invoice_sent: {
    name: 'Invoice Sent',
    description: 'When an invoice is sent',
    icon: 'Receipt',
    category: 'invoices'
  },
  invoice_paid: {
    name: 'Invoice Paid',
    description: 'When an invoice is paid',
    icon: 'DollarSign',
    category: 'invoices'
  },
  invoice_overdue: {
    name: 'Invoice Overdue',
    description: 'When an invoice becomes overdue',
    icon: 'AlertCircle',
    category: 'invoices'
  },
  
  // Payment triggers
  payment_received: {
    name: 'Payment Received',
    description: 'When a payment is received',
    icon: 'CreditCard',
    category: 'payments'
  },
  
  // Time-based triggers
  appointment_reminder: {
    name: 'Appointment Reminder',
    description: 'Before scheduled appointment',
    icon: 'Clock',
    category: 'scheduling',
    timing: true
  },
  follow_up_due: {
    name: 'Follow-up Due',
    description: 'When follow-up is scheduled',
    icon: 'MessageCircle',
    category: 'scheduling',
    timing: true
  }
} as const;

export const AUTOMATION_ACTIONS = {
  // Communication actions
  email: {
    name: 'Send Email',
    description: 'Send an email to client or team',
    icon: 'Mail',
    category: 'communication',
    config: {
      to: { type: 'select', options: ['client', 'team', 'custom'] },
      subject: { type: 'text', required: true },
      body: { type: 'richtext', required: true },
      attachments: { type: 'files', multiple: true }
    }
  },
  sms: {
    name: 'Send SMS',
    description: 'Send SMS message',
    icon: 'MessageSquare',
    category: 'communication',
    config: {
      to: { type: 'phone', required: true },
      message: { type: 'textarea', required: true, maxLength: 160 }
    }
  },
  
  // Task actions
  task: {
    name: 'Create Task',
    description: 'Create a task for team member',
    icon: 'CheckSquare',
    category: 'workflow',
    config: {
      title: { type: 'text', required: true },
      description: { type: 'textarea' },
      assignTo: { type: 'user_select' },
      dueDate: { type: 'date' },
      priority: { type: 'select', options: ['low', 'medium', 'high'] }
    }
  },
  
  // Timing actions
  wait: {
    name: 'Wait',
    description: 'Wait before next action',
    icon: 'Clock',
    category: 'timing',
    config: {
      duration: { type: 'number', required: true },
      unit: { type: 'select', options: ['minutes', 'hours', 'days'], required: true }
    }
  },
  
  // Logic actions
  conditional: {
    name: 'Conditional',
    description: 'Execute actions based on conditions',
    icon: 'GitBranch',
    category: 'logic',
    config: {
      conditions: { type: 'conditions' },
      trueActions: { type: 'actions' },
      falseActions: { type: 'actions' }
    }
  },
  
  // AI actions
  ai_generate: {
    name: 'AI Generate',
    description: 'Generate content with AI',
    icon: 'Sparkles',
    category: 'ai',
    config: {
      prompt: { type: 'textarea', required: true },
      model: { type: 'select', options: ['gpt-3.5-turbo', 'gpt-4'], default: 'gpt-3.5-turbo' },
      temperature: { type: 'number', min: 0, max: 1, default: 0.7 }
    }
  },
  
  // Data actions
  update_field: {
    name: 'Update Field',
    description: 'Update a field value',
    icon: 'Edit',
    category: 'data',
    config: {
      entity: { type: 'select', options: ['job', 'client', 'invoice'], required: true },
      field: { type: 'text', required: true },
      value: { type: 'text', required: true }
    }
  },
  tag_client: {
    name: 'Tag Client',
    description: 'Add or remove client tags',
    icon: 'Tag',
    category: 'data',
    config: {
      action: { type: 'select', options: ['add', 'remove'], required: true },
      tags: { type: 'tags', required: true }
    }
  },
  
  // Business actions
  create_invoice: {
    name: 'Create Invoice',
    description: 'Create an invoice',
    icon: 'FileText',
    category: 'business',
    config: {
      template: { type: 'template_select' },
      items: { type: 'invoice_items' },
      dueDate: { type: 'number', default: 30, suffix: 'days' }
    }
  },
  schedule_job: {
    name: 'Schedule Job',
    description: 'Schedule a follow-up job',
    icon: 'Calendar',
    category: 'business',
    config: {
      jobType: { type: 'job_type_select', required: true },
      scheduleDays: { type: 'number', default: 7 },
      description: { type: 'textarea' }
    }
  }
} as const;

export const CONDITION_OPERATORS = {
  equals: { name: 'Equals', symbol: '=' },
  not_equals: { name: 'Not Equals', symbol: '≠' },
  contains: { name: 'Contains', symbol: '∋' },
  greater_than: { name: 'Greater Than', symbol: '>' },
  less_than: { name: 'Less Than', symbol: '<' },
  is_empty: { name: 'Is Empty', symbol: '∅' },
  is_not_empty: { name: 'Is Not Empty', symbol: '∄' },
  in_list: { name: 'In List', symbol: '∈' },
  not_in_list: { name: 'Not In List', symbol: '∉' }
} as const;

export const WORKFLOW_CATEGORIES = {
  jobs: { name: 'Jobs', color: 'blue' },
  clients: { name: 'Clients', color: 'green' },
  estimates: { name: 'Estimates', color: 'purple' },
  invoices: { name: 'Invoices', color: 'orange' },
  payments: { name: 'Payments', color: 'yellow' },
  scheduling: { name: 'Scheduling', color: 'pink' },
  communication: { name: 'Communication', color: 'cyan' },
  workflow: { name: 'Workflow', color: 'indigo' },
  timing: { name: 'Timing', color: 'gray' },
  logic: { name: 'Logic', color: 'violet' },
  ai: { name: 'AI', color: 'emerald' },
  data: { name: 'Data', color: 'amber' },
  business: { name: 'Business', color: 'rose' }
} as const;
