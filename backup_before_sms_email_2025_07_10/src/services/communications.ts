// Communication service for automations
export const communicationService = {
  // Available triggers for automations
  triggers: [
    {
      id: 'client_created',
      name: 'New Client Added',
      icon: '👤',
      description: 'Triggered when a new client is added to the system',
      category: 'clients'
    },
    {
      id: 'job_completed',
      name: 'Job Completed',
      icon: '✅',
      description: 'Triggered when a job status changes to completed',
      category: 'jobs'
    },
    {
      id: 'appointment_scheduled',
      name: 'Appointment Scheduled',
      icon: '📅',
      description: 'Triggered when an appointment is scheduled',
      category: 'appointments'
    },
    {
      id: 'invoice_overdue',
      name: 'Invoice Overdue',
      icon: '💰',
      description: 'Triggered when an invoice becomes overdue',
      category: 'finance'
    },
    {
      id: 'missed_call',
      name: 'Missed Call',
      icon: '📞',
      description: 'Triggered when a call is missed',
      category: 'calls'
    },
    {
      id: 'form_submitted',
      name: 'Form Submitted',
      icon: '📝',
      description: 'Triggered when a form is submitted',
      category: 'forms'
    }
  ],

  // Available actions for automations
  actions: [
    {
      id: 'send_email',
      name: 'Send Email',
      icon: '📧',
      description: 'Send an email to a client or team member',
      category: 'communication',
      provider: 'mailgun'
    },
    {
      id: 'send_sms',
      name: 'Send SMS',
      icon: '💬',
      description: 'Send a text message',
      category: 'communication',
      provider: 'telnyx'
    },
    {
      id: 'make_call',
      name: 'Make Call',
      icon: '📞',
      description: 'Make an automated call',
      category: 'communication',
      provider: 'telnyx'
    },
    {
      id: 'create_task',
      name: 'Create Task',
      icon: '✅',
      description: 'Create a new task or job',
      category: 'tasks'
    },
    {
      id: 'update_status',
      name: 'Update Status',
      icon: '🔄',
      description: 'Update the status of a job or client',
      category: 'system'
    },
    {
      id: 'wait',
      name: 'Wait',
      icon: '⏰',
      description: 'Wait for a specified duration',
      category: 'control'
    },
    {
      id: 'add_tag',
      name: 'Add Tag',
      icon: '🏷️',
      description: 'Add a tag to a client or job',
      category: 'organization'
    }
  ],

  // Email templates
  emailTemplates: [
    {
      id: 'welcome_email',
      name: 'Welcome Email',
      subject: 'Welcome to {{company_name}}!',
      body: 'Hi {{client_name}},\n\nWelcome to {{company_name}}! We\'re excited to work with you.'
    },
    {
      id: 'appointment_reminder',
      name: 'Appointment Reminder',
      subject: 'Appointment Reminder - {{date}}',
      body: 'Hi {{client_name}},\n\nThis is a reminder about your appointment on {{date}} at {{time}}.'
    },
    {
      id: 'service_followup',
      name: 'Service Follow-up',
      subject: 'How was your recent service?',
      body: 'Hi {{client_name}},\n\nThank you for choosing {{company_name}}. How was your recent service?'
    },
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      subject: 'Invoice {{invoice_number}} - Payment Reminder',
      body: 'Hi {{client_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} is due.'
    }
  ],

  // SMS templates
  smsTemplates: [
    {
      id: 'appointment_reminder_sms',
      name: 'Appointment Reminder SMS',
      body: 'Hi {{client_name}}, reminder: Your appointment is on {{date}} at {{time}}. Reply CONFIRM to confirm.'
    },
    {
      id: 'missed_call_response',
      name: 'Missed Call Response',
      body: 'Hi, we missed your call. We\'ll get back to you shortly or you can text us back with your needs.'
    },
    {
      id: 'review_request',
      name: 'Review Request',
      body: 'Hi {{client_name}}, thank you for choosing us! We\'d love your feedback: {{review_link}}'
    }
  ]
};
