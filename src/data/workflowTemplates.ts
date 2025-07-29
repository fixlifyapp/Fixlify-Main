import { WorkflowTemplate, EnhancedWorkflowStep } from '@/types/automationFramework';

// Enhanced Workflow Templates based on FIXLIFY_AUTOMATION_SYSTEM_PLAN.md
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'new-client-welcome',
    name: 'New Client Welcome Series',
    description: 'Automated welcome sequence for new clients with service info and engagement',
    category: 'customer_lifecycle',
    trigger_type: 'client_created',
    tags: ['welcome', 'onboarding', 'client-lifecycle'],
    estimated_setup_time: 10,
    business_impact: {
      time_saved_hours: 2,
      client_satisfaction_improvement: 25,
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'New Client Created',
        config: { trigger_type: 'client_created' },
        position: { x: 100, y: 100 },
        connections: ['action-1']
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Send Welcome SMS',
        config: {
          action_type: 'send_sms',
          to: 'client',
          message: 'Welcome to {company.name}! We\'re excited to serve you. Your client ID is {client.id}.'
        },
        position: { x: 100, y: 200 },
        connections: ['delay-1']
      },
      {
        id: 'delay-1',
        type: 'delay',
        name: 'Wait 1 Hour',
        config: { delay_hours: 1 },
        position: { x: 100, y: 300 },
        connections: ['action-2']
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Send Welcome Email',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: 'Welcome to {company.name} - Your Service Information',
          body: 'Dear {client.firstName},\n\nWelcome to our family! We specialize in professional service and look forward to helping you.\n\nOur service areas include: [Service Areas]\n\nBest regards,\n{company.name} Team'
        },
        position: { x: 100, y: 400 },
        connections: ['delay-2']
      },
      {
        id: 'delay-2',
        type: 'delay',
        name: 'Wait 3 Days',
        config: { delay_hours: 72 },
        position: { x: 100, y: 500 },
        connections: ['action-3']
      },
      {
        id: 'action-3',
        type: 'action',
        name: 'Send Service Capabilities',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: 'Our Complete Service Offerings',
          body: 'Hi {client.firstName},\n\nHere\'s what we can help you with:\n\n• Emergency Services\n• Scheduled Maintenance\n• Installations\n• Repairs\n\nReady to schedule? Just reply to this email!'
        },
        position: { x: 100, y: 600 }
      }
    ]
  },
  {
    id: 'job-completion-followup',
    name: 'Service Completion Follow-up',
    description: 'Comprehensive follow-up sequence after job completion with satisfaction survey and review requests',
    category: 'customer_lifecycle',
    trigger_type: 'job_completed',
    tags: ['completion', 'satisfaction', 'reviews', 'follow-up'],
    estimated_setup_time: 15,
    business_impact: {
      time_saved_hours: 1.5,
      revenue_impact: 200,
      client_satisfaction_improvement: 30,
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Job Completed',
        config: { trigger_type: 'job_completed' },
        position: { x: 100, y: 100 },
        connections: ['action-1']
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Send Completion SMS',
        config: {
          action_type: 'send_sms',
          to: 'client',
          message: 'Great news! Your job #{job.number} has been completed. Thank you for choosing {company.name}!'
        },
        position: { x: 100, y: 200 },
        connections: ['delay-1']
      },
      {
        id: 'delay-1',
        type: 'delay',
        name: 'Wait 2 Hours',
        config: { delay_hours: 2 },
        position: { x: 100, y: 300 },
        connections: ['condition-1']
      },
      {
        id: 'condition-1',
        type: 'condition',
        name: 'Invoice Sent?',
        config: {
          condition_type: 'field_comparison',
          field: 'job.invoice_sent',
          operator: 'equals',
          value: false
        },
        position: { x: 100, y: 400 },
        connections: ['action-2', 'delay-2']
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Send Invoice',
        config: {
          action_type: 'create_invoice',
          auto_send: true
        },
        position: { x: 50, y: 500 },
        connections: ['delay-2']
      },
      {
        id: 'delay-2',
        type: 'delay',
        name: 'Wait 24 Hours',
        config: { delay_hours: 24 },
        position: { x: 100, y: 600 },
        connections: ['action-3']
      },
      {
        id: 'action-3',
        type: 'action',
        name: 'Send Satisfaction Survey',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: 'How did we do? - {job.title}',
          body: 'Hi {client.firstName},\n\nWe hope you\'re happy with the work we completed. Please take a moment to rate our service:\n\n[Survey Link]\n\nYour feedback helps us improve!'
        },
        position: { x: 100, y: 700 },
        connections: ['delay-3']
      },
      {
        id: 'delay-3',
        type: 'delay',
        name: 'Wait 7 Days',
        config: { delay_hours: 168 },
        position: { x: 100, y: 800 },
        connections: ['action-4']
      },
      {
        id: 'action-4',
        type: 'action',
        name: 'Request Review',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: 'Share Your Experience',
          body: 'Hi {client.firstName},\n\nIf you were happy with our service, would you mind sharing a quick review?\n\n[Review Links]\n\nThanks for your business!'
        },
        position: { x: 100, y: 900 }
      }
    ]
  },
  {
    id: 'payment-collection',
    name: 'Smart Payment Collection',
    description: 'Intelligent payment collection sequence that adapts based on amount and client history',
    category: 'revenue_optimization',
    trigger_type: 'invoice_overdue',
    tags: ['payments', 'collections', 'revenue'],
    estimated_setup_time: 20,
    business_impact: {
      time_saved_hours: 3,
      revenue_impact: 1000,
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Invoice Overdue',
        config: { 
          trigger_type: 'invoice_overdue',
          days_overdue: 1
        },
        position: { x: 100, y: 100 },
        connections: ['condition-1']
      },
      {
        id: 'condition-1',
        type: 'condition',
        name: 'High Value Invoice?',
        config: {
          condition_type: 'field_comparison',
          field: 'invoice.total',
          operator: 'greater_than',
          value: 500
        },
        position: { x: 100, y: 200 },
        connections: ['action-1', 'action-2']
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Friendly Reminder SMS',
        config: {
          action_type: 'send_sms',
          to: 'client',
          message: 'Hi {client.firstName}, just a friendly reminder that invoice #{invoice.number} is now due. You can pay online at [payment link].'
        },
        position: { x: 50, y: 300 }
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Urgent Payment Notice',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: 'URGENT: Payment Required - Invoice #{invoice.number}',
          body: 'Dear {client.firstName},\n\nYour invoice #{invoice.number} for ${invoice.total} is now overdue. Please submit payment immediately to avoid service interruption.'
        },
        position: { x: 150, y: 300 }
      }
    ]
  },
  {
    id: 'appointment-confirmation',
    name: 'Smart Appointment Confirmations',
    description: 'Automated appointment confirmations with client preferences and weather considerations',
    category: 'operational_efficiency',
    trigger_type: 'job_scheduled',
    tags: ['appointments', 'confirmations', 'scheduling'],
    estimated_setup_time: 10,
    business_impact: {
      time_saved_hours: 2,
      client_satisfaction_improvement: 20,
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Job Scheduled',
        config: { 
          trigger_type: 'job_scheduled',
          hours_before: 24
        },
        position: { x: 100, y: 100 },
        connections: ['action-1']
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Send Confirmation SMS',
        config: {
          action_type: 'send_sms',
          to: 'client',
          message: 'Appointment confirmed for {job.scheduled_date} at {job.scheduled_time}. Our technician {technician.name} will arrive between {time_window}. Reply CONFIRM to acknowledge.'
        },
        position: { x: 100, y: 200 },
        connections: ['delay-1']
      },
      {
        id: 'delay-1',
        type: 'delay',
        name: 'Wait 2 Hours Before',
        config: { delay_until: 'relative', relative_hours: -2 },
        position: { x: 100, y: 300 },
        connections: ['action-2']
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Send Arrival SMS',
        config: {
          action_type: 'send_sms',
          to: 'client',
          message: 'Hi {client.firstName}! {technician.name} is on the way and will arrive in approximately 2 hours for your {job.type} service.'
        },
        position: { x: 100, y: 400 }
      }
    ]
  },
  {
    id: 'preventive-maintenance',
    name: 'Preventive Maintenance Campaign',
    description: 'Seasonal maintenance reminders based on service history and equipment age',
    category: 'customer_retention',
    trigger_type: 'scheduled_time',
    tags: ['maintenance', 'seasonal', 'retention'],
    estimated_setup_time: 25,
    business_impact: {
      time_saved_hours: 4,
      revenue_impact: 1500,
      client_satisfaction_improvement: 15,
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Quarterly Schedule',
        config: { 
          trigger_type: 'scheduled_time',
          frequency: 'quarterly',
          time: '09:00'
        },
        position: { x: 100, y: 100 },
        connections: ['condition-1']
      },
      {
        id: 'condition-1',
        type: 'condition',
        name: 'Had Service 12+ Months Ago?',
        config: {
          condition_type: 'historical',
          client_last_service: { days_ago: 365 }
        },
        position: { x: 100, y: 200 },
        connections: ['action-1']
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Send Maintenance Reminder',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: 'Time for Your Seasonal Maintenance Check',
          body: 'Hi {client.firstName},\n\nIt\'s been over a year since your last service. Schedule your maintenance check today to keep everything running smoothly!\n\n[Scheduling Link]'
        },
        position: { x: 100, y: 300 },
        connections: ['delay-1']
      },
      {
        id: 'delay-1',
        type: 'delay',
        name: 'Wait 14 Days',
        config: { delay_hours: 336 },
        position: { x: 100, y: 400 },
        connections: ['condition-2']
      },
      {
        id: 'condition-2',
        type: 'condition',
        name: 'No Response?',
        config: {
          condition_type: 'field_comparison',
          field: 'client.responded',
          operator: 'equals',
          value: false
        },
        position: { x: 100, y: 500 },
        connections: ['action-2']
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Send Discount Offer',
        config: {
          action_type: 'send_email',
          to: 'client',
          subject: '15% Off Maintenance Service - Limited Time',
          body: 'Don\'t miss out! Book your maintenance service this week and save 15%. Use code MAINT15.\n\n[Book Now]'
        },
        position: { x: 100, y: 600 }
      }
    ]
  },
  {
    id: 'technician-dispatch',
    name: 'Smart Technician Dispatch',
    description: 'AI-optimized technician assignment based on skills, location, and availability',
    category: 'operational_efficiency',
    trigger_type: 'job_created',
    tags: ['dispatch', 'optimization', 'technicians'],
    estimated_setup_time: 30,
    business_impact: {
      time_saved_hours: 5,
      revenue_impact: 500,
    },
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'New Job Created',
        config: { trigger_type: 'job_created' },
        position: { x: 100, y: 100 },
        connections: ['action-1']
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'AI Optimize Assignment',
        config: {
          action_type: 'ai_schedule_optimization',
          consider_traffic: true,
          prefer_technician: []
        },
        position: { x: 100, y: 200 },
        connections: ['action-2']
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Assign Technician',
        config: {
          action_type: 'assign_technician',
          notify_technician: true,
          include_details: true
        },
        position: { x: 100, y: 300 },
        connections: ['action-3']
      },
      {
        id: 'action-3',
        type: 'action',
        name: 'Notify Client',
        config: {
          action_type: 'send_sms',
          to: 'client',
          message: 'Your job #{job.number} has been assigned to {technician.name}. They will contact you to schedule within 24 hours.'
        },
        position: { x: 100, y: 400 }
      }
    ]
  }
];

// Template categories for organization
export const TEMPLATE_CATEGORIES = {
  customer_lifecycle: {
    name: 'Customer Lifecycle',
    description: 'Automate customer journey from onboarding to retention',
    icon: 'user-plus',
    color: 'blue'
  },
  revenue_optimization: {
    name: 'Revenue Optimization',
    description: 'Maximize revenue through smart collections and upselling',
    icon: 'dollar-sign',
    color: 'green'
  },
  operational_efficiency: {
    name: 'Operational Efficiency',
    description: 'Streamline operations and reduce manual work',
    icon: 'settings',
    color: 'purple'
  },
  customer_retention: {
    name: 'Customer Retention',
    description: 'Keep customers engaged and coming back',
    icon: 'heart',
    color: 'red'
  }
};

// Helper functions for template management
export const getTemplatesByCategory = (category: keyof typeof TEMPLATE_CATEGORIES) => {
  return WORKFLOW_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return WORKFLOW_TEMPLATES.find(template => template.id === id);
};

export const getPopularTemplates = (limit: number = 4) => {
  // Return templates with highest business impact
  return WORKFLOW_TEMPLATES
    .sort((a, b) => {
      const aImpact = (a.business_impact.revenue_impact || 0) + 
                     (a.business_impact.time_saved_hours || 0) * 50;
      const bImpact = (b.business_impact.revenue_impact || 0) + 
                     (b.business_impact.time_saved_hours || 0) * 50;
      return bImpact - aImpact;
    })
    .slice(0, limit);
};