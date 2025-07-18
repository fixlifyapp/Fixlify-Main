export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  popularity: number;
  trigger: {
    type: string;
    name: string;
    config?: any;
  };
  steps: Array<{
    type: string;
    name: string;
    config: any;
    deliveryWindow?: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      weekdays: number[];
    };
  }>;
  estimatedTime?: string;
  benefits?: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'appointment_reminder_24h',
    name: '24-Hour Appointment Reminder',
    description: 'Automatically remind customers 24 hours before their scheduled appointment via SMS and email',
    category: 'scheduling',
    icon: 'Calendar',
    tags: ['appointment', 'reminder', 'scheduling', 'no-show reduction'],
    popularity: 95,
    trigger: {
      type: 'job_scheduled',
      name: 'Job Scheduled',
      config: {
        timingType: 'before',
        timeValue: 24,
        timeUnit: 'hours'
      }
    },
    steps: [
      {
        type: 'send_sms',
        name: 'Send SMS Reminder',
        config: {
          recipient: 'client',
          message: 'Hi {{client_first_name}}, this is a reminder about your {{job_type}} appointment tomorrow at {{appointment_time}}. Reply CONFIRM to confirm or RESCHEDULE to change. - {{company_name}}'
        },
        deliveryWindow: {
          enabled: true,
          startTime: '09:00',
          endTime: '20:00',
          weekdays: [1, 2, 3, 4, 5, 6, 0]
        }
      },
      {
        type: 'send_email',
        name: 'Send Email Reminder',
        config: {
          recipient: 'client',
          subject: 'Appointment Reminder - {{appointment_date}}',
          message: 'Dear {{client_name}},\\n\\nThis is a friendly reminder about your upcoming {{job_type}} appointment scheduled for {{appointment_date}} at {{appointment_time}}.\\n\\nOur technician {{technician_name}} will arrive at:\\n{{client_address}}\\n\\nIf you need to reschedule, please call us at {{company_phone}}.\\n\\nThank you,\\n{{company_name}}'
        }
      }
    ],
    estimatedTime: 'Saves 2-3 hours/week',
    benefits: ['Reduces no-shows by 40%', 'Improves customer satisfaction', 'Saves staff time']
  },
  {
    id: 'review_request_sequence',
    name: 'Review Request Campaign',
    description: 'Multi-step campaign to collect customer reviews after job completion',
    category: 'reputation',
    icon: 'Star',
    tags: ['review', 'feedback', 'reputation', 'google reviews'],
    popularity: 88,
    trigger: {
      type: 'job_completed',
      name: 'Job Completed',
      config: {
        completionStatus: 'success'
      }
    },
    steps: [
      {
        type: 'delay',
        name: 'Wait 2 Days',
        config: {
          delayValue: 2,
          delayUnit: 'days'
        }
      },
      {
        type: 'send_sms',
        name: 'Initial Review Request',
        config: {
          recipient: 'client',
          message: 'Hi {{client_first_name}}, we hope you\'re enjoying your recent {{job_type}} service! We\'d love your feedback. Rate us here: {{review_link}} - {{company_name}}'
        }
      },
      {
        type: 'delay',
        name: 'Wait 5 Days',
        config: {
          delayValue: 5,
          delayUnit: 'days'
        }
      },
      {
        type: 'condition',
        name: 'Check If Review Submitted',
        config: {
          field: 'review_submitted',
          operator: 'equals',
          value: false
        }
      },
      {
        type: 'send_email',
        name: 'Follow-up Review Request',
        config: {
          recipient: 'client',
          subject: 'We value your feedback, {{client_first_name}}',
          message: 'Your opinion matters! Please take 30 seconds to share your experience with our {{job_type}} service. Leave a review: {{review_link}}'
        }
      }
    ],
    estimatedTime: 'Generates 5-10 reviews/month',
    benefits: ['Increases online reviews by 300%', 'Improves SEO ranking', 'Builds social proof']
  },
  {
    id: 'invoice_follow_up',
    name: 'Invoice Payment Follow-up',
    description: 'Automated payment reminders for overdue invoices with escalating messages',
    category: 'financial',
    icon: 'DollarSign',
    tags: ['invoice', 'payment', 'collections', 'cash flow'],
    popularity: 92,
    trigger: {
      type: 'payment_overdue',
      name: 'Payment Overdue',
      config: {
        daysOverdue: 3
      }
    },
    steps: [
      {
        type: 'send_email',
        name: 'Friendly Reminder',
        config: {
          recipient: 'client',
          subject: 'Invoice {{invoice_number}} - Payment Reminder',
          message: 'Hi {{client_name}},\\n\\nThis is a friendly reminder that invoice {{invoice_number}} for ${{amount}} is now past due.\\n\\nPlease pay online: {{payment_link}}\\n\\nIf you have any questions, please contact us at {{company_phone}}.\\n\\nThank you!'
        }
      },
      {
        type: 'delay',
        name: 'Wait 3 Days',
        config: {
          delayValue: 3,
          delayUnit: 'days'
        }
      },
      {
        type: 'condition',
        name: 'Check Payment Status',
        config: {
          field: 'invoice_paid',
          operator: 'equals',
          value: false
        }
      },
      {
        type: 'send_sms',
        name: 'SMS Reminder',
        config: {
          recipient: 'client',
          message: 'Hi {{client_first_name}}, invoice {{invoice_number}} (${{amount}}) is overdue. Pay now: {{payment_link}} or call {{company_phone}}'
        }
      },
      {
        type: 'create_task',
        name: 'Create Follow-up Task',
        config: {
          assignee: 'account_manager',
          description: 'Call {{client_name}} regarding overdue invoice {{invoice_number}} (${{amount}})',
          priority: 'high',
          dueDate: '+1 day'
        }
      }
    ],
    estimatedTime: 'Reduces collection time by 50%',
    benefits: ['Improves cash flow', 'Reduces manual follow-ups', 'Professional collection process']
  },
  {
    id: 'new_customer_welcome',
    name: 'New Customer Welcome Series',
    description: 'Multi-touch welcome campaign for new customers to build engagement',
    category: 'onboarding',
    icon: 'UserPlus',
    tags: ['welcome', 'onboarding', 'new customer', 'engagement'],
    popularity: 85,
    trigger: {
      type: 'client_created',
      name: 'New Client Added',
      config: {
        clientType: 'all'
      }
    },
    steps: [
      {
        type: 'send_email',
        name: 'Welcome Email',
        config: {
          recipient: 'client',
          subject: 'Welcome to {{company_name}}!',
          message: 'Dear {{client_name}},\\n\\nWelcome to the {{company_name}} family! We\'re thrilled to have you as our customer.\\n\\nHere\'s what you can expect:\\n• Professional service from certified technicians\\n• Transparent pricing with no hidden fees\\n• 100% satisfaction guarantee\\n\\nSave this number: {{company_phone}}\\n\\nWe look forward to serving you!\\n\\nBest regards,\\n{{company_name}} Team'
        }
      },
      {
        type: 'delay',
        name: 'Wait 3 Days',
        config: {
          delayValue: 3,
          delayUnit: 'days'
        }
      },
      {
        type: 'send_sms',
        name: 'SMS Introduction',
        config: {
          recipient: 'client',
          message: 'Hi {{client_first_name}}! Quick tip: Book services anytime at {{booking_link}} or call {{company_phone}}. Save 10% on your first service! - {{company_name}}'
        }
      }
    ],
    estimatedTime: 'Increases retention by 25%',
    benefits: ['Builds customer loyalty', 'Increases first-time bookings', 'Professional first impression']
  },
  {
    id: 'seasonal_maintenance_reminder',
    name: 'Seasonal Maintenance Campaign',
    description: 'Proactive maintenance reminders based on season and service history',
    category: 'maintenance',
    icon: 'Sun',
    tags: ['maintenance', 'seasonal', 'hvac', 'proactive'],
    popularity: 78,
    trigger: {
      type: 'schedule_time',
      name: 'Scheduled Time',
      config: {
        scheduleType: 'recurring',
        frequency: 'quarterly',
        months: [3, 6, 9, 12]
      }
    },
    steps: [
      {
        type: 'filter',
        name: 'Filter by Service History',
        config: {
          conditions: {
            last_service_days: '>90',
            service_type: ['hvac', 'plumbing', 'electrical']
          }
        }
      },
      {
        type: 'send_email',
        name: 'Maintenance Reminder',
        config: {
          recipient: 'client',
          subject: '🌟 Time for Your Seasonal {{service_type}} Check-up',
          message: 'Hi {{client_name}},\\n\\nSpring is here! It\'s the perfect time for your seasonal {{service_type}} maintenance.\\n\\nRegular maintenance:\\n✓ Prevents costly breakdowns\\n✓ Extends equipment life\\n✓ Improves efficiency\\n\\nSchedule now and save $25: {{booking_link}}\\n\\nOr call us at {{company_phone}}'
        }
      },
      {
        type: 'delay',
        name: 'Wait 7 Days',
        config: {
          delayValue: 7,
          delayUnit: 'days'
        }
      },
      {
        type: 'condition',
        name: 'Check Booking Status',
        config: {
          field: 'job_scheduled',
          operator: 'equals',
          value: false
        }
      },
      {
        type: 'send_sms',
        name: 'SMS Follow-up',
        config: {
          recipient: 'client',
          message: 'Last chance! Save $25 on {{service_type}} maintenance. Book now: {{booking_link}} - {{company_name}}'
        }
      }
    ],
    estimatedTime: 'Generates 15-20 jobs/month',
    benefits: ['Increases recurring revenue', 'Prevents emergency calls', 'Builds maintenance contracts']
  },
  {
    id: 'estimate_follow_up',
    name: 'Estimate Follow-up Sequence',
    description: 'Convert more estimates to jobs with strategic follow-ups',
    category: 'sales',
    icon: 'FileText',
    tags: ['estimate', 'quote', 'sales', 'conversion'],
    popularity: 90,
    trigger: {
      type: 'estimate_sent',
      name: 'Estimate Sent',
      config: {}
    },
    steps: [
      {
        type: 'delay',
        name: 'Wait 2 Days',
        config: {
          delayValue: 2,
          delayUnit: 'days'
        }
      },
      {
        type: 'send_email',
        name: 'First Follow-up',
        config: {
          recipient: 'client',
          subject: 'Questions about your {{service_type}} estimate?',
          message: 'Hi {{client_name}},\\n\\nI wanted to follow up on the estimate we sent for your {{service_type}} project.\\n\\nDo you have any questions? I\'m here to help!\\n\\nReady to move forward? Simply reply "APPROVED" or click here: {{approval_link}}\\n\\nBest regards,\\n{{technician_name}}'
        }
      },
      {
        type: 'delay',
        name: 'Wait 5 Days',
        config: {
          delayValue: 5,
          delayUnit: 'days'
        }
      },
      {
        type: 'condition',
        name: 'Check Approval Status',
        config: {
          field: 'estimate_status',
          operator: 'not_equals',
          value: 'approved'
        }
      },
      {
        type: 'send_sms',
        name: 'Limited Time Offer',
        config: {
          recipient: 'client',
          message: 'Hi {{client_first_name}}! Your {{service_type}} estimate expires in 3 days. Approve now and save 5%: {{approval_link}} - {{company_name}}'
        }
      }
    ],
    estimatedTime: 'Increases conversion by 35%',
    benefits: ['Higher estimate conversion', 'Faster decision making', 'Reduced manual follow-up']
  },
  {
    id: 'technician_dispatch_notification',
    name: 'Technician Dispatch Updates',
    description: 'Keep customers informed when technician is on the way',
    category: 'service',
    icon: 'Truck',
    tags: ['dispatch', 'on-the-way', 'real-time', 'communication'],
    popularity: 93,
    trigger: {
      type: 'job_status_change',
      name: 'Job Status Changed',
      config: {
        status: 'dispatched'
      }
    },
    steps: [
      {
        type: 'send_sms',
        name: 'Dispatch Notification',
        config: {
          recipient: 'client',
          message: 'Great news! {{technician_name}} is on the way to your location. Estimated arrival: {{eta}}. Track live: {{tracking_link}} - {{company_name}}'
        }
      },
      {
        type: 'delay',
        name: 'Wait 30 Minutes',
        config: {
          delayValue: 30,
          delayUnit: 'minutes'
        }
      },
      {
        type: 'condition',
        name: 'Check Arrival Status',
        config: {
          field: 'job_status',
          operator: 'not_equals',
          value: 'arrived'
        }
      },
      {
        type: 'send_sms',
        name: 'ETA Update',
        config: {
          recipient: 'client',
          message: '{{technician_name}} is about {{minutes_away}} minutes away. Please ensure someone is available to let them in. - {{company_name}}'
        }
      }
    ],
    estimatedTime: 'Reduces calls by 60%',
    benefits: ['Improves customer experience', 'Reduces no-access issues', 'Professional communication']
  }
];

// Helper function to get template by ID
export const getWorkflowTemplate = (id: string): WorkflowTemplate | undefined => {
  return WORKFLOW_TEMPLATES.find(template => template.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): WorkflowTemplate[] => {
  return WORKFLOW_TEMPLATES.filter(template => template.category === category);
};

// Get all unique categories
export const getTemplateCategories = (): string[] => {
  return Array.from(new Set(WORKFLOW_TEMPLATES.map(template => template.category)));
};

// Get most popular templates
export const getPopularTemplates = (limit: number = 5): WorkflowTemplate[] => {
  return [...WORKFLOW_TEMPLATES]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, Math.min(limit, WORKFLOW_TEMPLATES.length));
};