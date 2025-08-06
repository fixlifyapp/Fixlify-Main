import { supabase } from '@/integrations/supabase/client';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  steps: any[];
  category: string;
}

export const automationTemplates: AutomationTemplate[] = [
  {
    id: 'job-completed-notification',
    name: 'Job Completed Notification',
    description: 'Send email and SMS when a job is completed',
    category: 'Job Status',
    trigger_type: 'job_status_changed',
    trigger_config: {
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'completed'
        }
      ]
    },
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Send Email',
        config: {
          actionType: 'email',
          subject: 'Job Completed - {{job.title}}',
          message: `Dear {{client.firstName}},

We're pleased to inform you that your job "{{job.title}}" has been completed successfully.

Job Details:
- Job ID: {{job.id}}
- Address: {{job.address}}
- Completed on: {{job.updatedAt}}

Thank you for choosing our services!

Best regards,
{{company.name}}`,
          sendTime: 'immediately'
        }
      },
      {
        id: 'step-2',
        type: 'action',
        name: 'Send SMS',
        config: {
          actionType: 'sms',
          message: 'Great news! Your job "{{job.title}}" at {{job.address}} has been completed. Thank you for choosing {{company.name}}!',
          sendTime: 'immediately'
        }
      }
    ]
  },
  {
    id: 'job-scheduled-reminder',
    name: 'Job Scheduled Reminder',
    description: 'Send notification when a job is scheduled',
    category: 'Job Status',
    trigger_type: 'job_status_changed',
    trigger_config: {
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'scheduled'
        }
      ]
    },
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Send Email',
        config: {
          actionType: 'email',
          subject: 'Job Scheduled - {{job.title}}',
          message: `Dear {{client.firstName}},

Your job has been scheduled and we're ready to get started!

Job Details:
- Job ID: {{job.id}}
- Service: {{job.title}}
- Address: {{job.address}}
- Scheduled Date: {{job.scheduledDate}}
- Estimated Time: {{job.scheduledTime}}

We'll send you another notification when our technician is on the way.

Best regards,
{{company.name}}`,
          sendTime: 'immediately'
        }
      },
      {
        id: 'step-2',
        type: 'action',
        name: 'Send SMS',
        config: {
          actionType: 'sms',
          message: 'Your job "{{job.title}}" has been scheduled for {{job.scheduledDate}} at {{job.scheduledTime}}. We\'ll be there! - {{company.name}}',
          sendTime: 'immediately'
        }
      }
    ]
  },
  {
    id: 'job-in-progress-update',
    name: 'Job In Progress Update',
    description: 'Notify client when work begins',
    category: 'Job Status',
    trigger_type: 'job_status_changed',
    trigger_config: {
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'in progress'
        }
      ]
    },
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Send SMS',
        config: {
          actionType: 'sms',
          message: 'Good news! Our technician has arrived and work on "{{job.title}}" has begun. We\'ll update you when complete. - {{company.name}}',
          sendTime: 'immediately'
        }
      }
    ]
  },
  {
    id: 'job-on-hold-notification',
    name: 'Job On Hold Notification',
    description: 'Notify when a job is put on hold',
    category: 'Job Status',
    trigger_type: 'job_status_changed',
    trigger_config: {
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'on hold'
        }
      ]
    },
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Send Email',
        config: {
          actionType: 'email',
          subject: 'Job Status Update - {{job.title}}',
          message: `Dear {{client.firstName}},

We wanted to inform you that your job "{{job.title}}" has been temporarily put on hold.

This could be due to:
- Waiting for parts or materials
- Weather conditions
- Scheduling adjustments

We'll contact you as soon as we're ready to proceed. Thank you for your patience.

Best regards,
{{company.name}}`,
          sendTime: 'immediately'
        }
      }
    ]
  },
  {
    id: 'job-cancelled-notification',
    name: 'Job Cancelled Notification',
    description: 'Send notification when a job is cancelled',
    category: 'Job Status',
    trigger_type: 'job_status_changed',
    trigger_config: {
      conditions: [
        {
          field: 'status',
          operator: 'equals',
          value: 'cancelled'
        }
      ]
    },
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Send Email',
        config: {
          actionType: 'email',
          subject: 'Job Cancellation - {{job.title}}',
          message: `Dear {{client.firstName}},

We're writing to confirm that your job "{{job.title}}" has been cancelled as requested.

If this was not requested or if you have any questions, please contact us immediately.

Thank you,
{{company.name}}`,
          sendTime: 'immediately'
        }
      }
    ]
  },
  {
    id: 'new-job-created',
    name: 'New Job Created',
    description: 'Internal notification when a new job is created',
    category: 'Job Management',
    trigger_type: 'job_created',
    trigger_config: {},
    steps: [
      {
        id: 'step-1',
        type: 'action',
        name: 'Internal Email',
        config: {
          actionType: 'email',
          subject: 'New Job Created - {{job.title}}',
          message: `A new job has been created in the system:

Job Details:
- Job ID: {{job.id}}
- Client: {{client.firstName}} {{client.lastName}}
- Service: {{job.title}}
- Address: {{job.address}}
- Contact: {{client.email}} / {{client.phone}}
- Created: {{job.createdAt}}

Please review and schedule accordingly.`,
          sendTime: 'immediately',
          sendToClient: false
        }
      }
    ]
  }
];

export async function createAutomationFromTemplate(
  templateId: string,
  customName?: string,
  userId?: string
): Promise<string | null> {
  const template = automationTemplates.find(t => t.id === templateId);
  if (!template) {
    console.error('Template not found:', templateId);
    return null;
  }

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }
    userId = user.id;
  }

  try {
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        name: customName || template.name,
        description: template.description,
        trigger_type: template.trigger_type,
        trigger_config: template.trigger_config,
        steps: template.steps,
        user_id: userId,
        organization_id: '00000000-0000-0000-0000-000000000001',
        is_active: true,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating automation from template:', error);
      return null;
    }

    console.log('✅ Automation created from template:', data);
    return data.id;
  } catch (error) {
    console.error('Error creating automation from template:', error);
    return null;
  }
}

export async function initializeDefaultAutomations(userId: string) {
  console.log('🚀 Initializing default automations for user:', userId);

  // Check if user already has automations
  const { data: existing } = await supabase
    .from('automation_workflows')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('User already has automations, skipping initialization');
    return;
  }

  // Create essential automations
  const essentialTemplates = [
    'job-completed-notification',
    'job-scheduled-reminder',
    'job-in-progress-update'
  ];

  for (const templateId of essentialTemplates) {
    try {
      await createAutomationFromTemplate(templateId, undefined, userId);
      console.log(`✅ Created automation: ${templateId}`);
    } catch (error) {
      console.error(`❌ Failed to create automation: ${templateId}`, error);
    }
  }

  console.log('✅ Default automations initialized');
}