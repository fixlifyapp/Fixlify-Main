-- Insert sample automation templates for testing
INSERT INTO automation_templates (name, description, category, template_config, required_integrations, tags, is_featured)
VALUES 
(
  'Welcome Email Series',
  'Automatically send a series of welcome emails to new clients',
  'marketing',
  '{
    "triggers": [{
      "type": "client_created",
      "name": "New Client Added"
    }],
    "actions": [{
      "type": "send_email",
      "delay": "0",
      "template": "welcome_email_1"
    }, {
      "type": "send_email",
      "delay": "3d",
      "template": "welcome_email_2"
    }, {
      "type": "send_email",
      "delay": "7d",
      "template": "welcome_email_3"
    }]
  }',
  ARRAY['mailgun'],
  ARRAY['email', 'onboarding', 'marketing'],
  true
),
(
  'Appointment Reminder SMS',
  'Send SMS reminders 24 hours before scheduled appointments',
  'reminders',
  '{
    "triggers": [{
      "type": "scheduled",
      "timing": "24h_before_appointment"
    }],
    "actions": [{
      "type": "send_sms",
      "template": "appointment_reminder"
    }]
  }',
  ARRAY['telnyx'],
  ARRAY['sms', 'appointments', 'reminders'],
  true
),
(
  'Follow-up After Service',
  'Automatically follow up with clients after job completion',
  'follow-ups',
  '{
    "triggers": [{
      "type": "job_completed",
      "name": "Job Marked Complete"
    }],
    "actions": [{
      "type": "wait",
      "duration": "1d"
    }, {
      "type": "send_email",
      "template": "service_followup"
    }, {
      "type": "send_sms",
      "template": "review_request",
      "delay": "3d"
    }]
  }',
  ARRAY['mailgun', 'telnyx'],
  ARRAY['followup', 'reviews', 'customer-satisfaction'],
  true
),
(
  'Missed Call Auto-Response',
  'Automatically text back when you miss a call from a client',
  'calls',
  '{
    "triggers": [{
      "type": "missed_call",
      "source": "telnyx"
    }],
    "actions": [{
      "type": "send_sms",
      "template": "missed_call_response",
      "immediate": true
    }]
  }',
  ARRAY['telnyx'],
  ARRAY['calls', 'sms', 'response'],
  false
),
(
  'Invoice Payment Reminder',
  'Send payment reminders for overdue invoices',
  'follow-ups',
  '{
    "triggers": [{
      "type": "invoice_overdue",
      "days": 3
    }],
    "actions": [{
      "type": "send_email",
      "template": "payment_reminder"
    }, {
      "type": "send_sms",
      "template": "payment_reminder_sms",
      "delay": "2d"
    }]
  }',
  ARRAY['mailgun', 'telnyx'],
  ARRAY['invoicing', 'payments', 'reminders'],
  false
);

-- Create a sample workflow for testing
INSERT INTO automation_workflows (
  organization_id,
  name,
  description,
  status,
  category,
  visual_config,
  execution_count,
  success_count
)
SELECT 
  p.organization_id,
  'Welcome New Clients',
  'Automatically send welcome emails to new clients when they are added to the system',
  'active',
  'marketing',
  '{
    "nodes": [
      {
        "id": "trigger-1",
        "type": "trigger",
        "data": {
          "type": "client_created",
          "label": "New Client Added"
        },
        "position": {"x": 100, "y": 100}
      },
      {
        "id": "action-1",
        "type": "action",
        "data": {
          "type": "send_email",
          "label": "Send Welcome Email",
          "template": "welcome_email"
        },
        "position": {"x": 300, "y": 100}
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "trigger-1",
        "target": "action-1"
      }
    ]
  }',
  0,
  0
FROM profiles p
WHERE p.user_id = auth.uid()
LIMIT 1;