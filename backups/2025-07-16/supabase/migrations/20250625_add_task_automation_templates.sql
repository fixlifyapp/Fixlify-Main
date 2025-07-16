-- Add task automation templates
INSERT INTO automation_templates (
  id, 
  name, 
  description, 
  category, 
  trigger_type, 
  action_type,
  is_active, 
  is_system,
  config,
  template_config,
  icon,
  badge,
  estimated_time,
  usage_count
)
VALUES 
-- Task Created Template
(
  gen_random_uuid(),
  'New Task Assignment',
  'Notify team member when a new task is assigned to them',
  'Task Management',
  'task_created',
  'multi_channel',
  true,
  false,
  '{
    "delay_minutes": 0,
    "conditions": {
      "assigned_to": "not_empty"
    }
  }'::jsonb,
  '{
    "actions": [
      {
        "type": "send_sms",
        "settings": {
          "to": "{{technician_phone}}",
          "message": "New task assigned: {{task_description}}\n\nClient: {{client_name}}\nDue: {{due_date}} at {{due_time}}\nPriority: {{task_priority}}\n\nView details in the app."
        }
      },
      {
        "type": "send_email",
        "settings": {
          "to": "{{technician_email}}",
          "subject": "New Task Assignment - {{client_name}}",
          "body": "Hello {{technician_name}},\n\nYou have been assigned a new task:\n\nTask: {{task_description}}\nClient: {{client_name}}\nAddress: {{client_address}}\nDue Date: {{due_date}} at {{due_time}}\nPriority: {{task_priority}}\n\n{{#if job_id}}Related Job: {{job_title}} ({{job_id}}){{/if}}\n\n{{#if task_notes}}Notes: {{task_notes}}{{/if}}\n\nPlease log in to view full details and update the task status.\n\nBest regards,\n{{company_name}}"
        }
      }
    ],
    "variables": [
      {"key": "task_id", "label": "Task ID", "type": "string"},
      {"key": "task_description", "label": "Task Description", "type": "string"},
      {"key": "task_priority", "label": "Task Priority", "type": "string"},
      {"key": "technician_name", "label": "Technician Name", "type": "string"},
      {"key": "technician_email", "label": "Technician Email", "type": "string"},
      {"key": "technician_phone", "label": "Technician Phone", "type": "string"}
    ]
  }'::jsonb,
  'CheckSquare',
  'New',
  '2 mins',
  0
),

-- Task Completed Template
(
  gen_random_uuid(),
  'Task Completion Notification',
  'Notify managers when high-priority tasks are completed',
  'Task Management',
  'task_completed',
  'email',
  true,
  false,
  '{
    "conditions": {
      "priority": "high"
    }
  }'::jsonb,
  '{
    "actions": [
      {
        "type": "send_email",
        "settings": {
          "to": "{{manager_email}}",
          "subject": "Task Completed - {{task_description}}",
          "body": "A high-priority task has been completed:\n\nTask: {{task_description}}\nCompleted by: {{technician_name}}\nClient: {{client_name}}\nCompletion Time: {{completed_at}}\n\n{{#if job_id}}Related Job: {{job_title}}{{/if}}\n\nThe task was marked as complete in the system."
        }
      },
      {
        "type": "update_job_status",
        "settings": {
          "status": "check_if_all_tasks_complete"
        }
      }
    ]
  }'::jsonb,
  'CheckCircle',
  'Efficient',
  '1 min',
  0
),

-- Task Overdue Template
(
  gen_random_uuid(),
  'Task Overdue Alert',
  'Alert team members and managers about overdue tasks',
  'Task Management',
  'task_overdue',
  'multi_channel',
  true,
  false,
  '{
    "check_frequency": "daily",
    "overdue_threshold_hours": 24
  }'::jsonb,
  '{
    "actions": [
      {
        "type": "send_sms",
        "settings": {
          "to": "{{technician_phone}}",
          "message": "OVERDUE TASK: {{task_description}} for {{client_name}} was due on {{due_date}}. Please update the status ASAP."
        }
      },
      {
        "type": "send_email",
        "settings": {
          "to": ["{{technician_email}}", "{{manager_email}}"],
          "subject": "⚠️ Overdue Task Alert - {{client_name}}",
          "body": "The following task is now overdue:\n\nTask: {{task_description}}\nClient: {{client_name}}\nDue Date: {{due_date}} at {{due_time}}\nAssigned to: {{technician_name}}\nPriority: {{task_priority}}\n\n{{#if job_id}}Related Job: {{job_title}}{{/if}}\n\nPlease take immediate action to complete this task or update its status.\n\nThis is an automated alert from {{company_name}}"
        }
      },
      {
        "type": "create_internal_note",
        "settings": {
          "entity_type": "task",
          "entity_id": "{{task_id}}",
          "note": "Task overdue alert sent to {{technician_name}} and management"
        }
      }
    ]
  }'::jsonb,
  'AlertTriangle',
  'Urgent',
  '3 mins',
  0
),

-- Task Status Changed Template
(
  gen_random_uuid(),
  'Task Progress Update',
  'Notify relevant parties when task status changes',
  'Task Management',
  'task_status_changed',
  'conditional',
  true,
  false,
  '{
    "track_all_changes": false,
    "notify_on_statuses": ["in_progress", "blocked", "completed"]
  }'::jsonb,
  '{
    "actions": [
      {
        "type": "conditional",
        "conditions": {
          "new_status": "in_progress"
        },
        "actions": [
          {
            "type": "send_sms",
            "settings": {
              "to": "{{client_phone}}",
              "message": "Update: Your service task \"{{task_description}}\" is now in progress. Our technician {{technician_name}} is working on it."
            }
          }
        ]
      },
      {
        "type": "conditional",
        "conditions": {
          "new_status": "blocked"
        },
        "actions": [
          {
            "type": "send_email",
            "settings": {
              "to": "{{manager_email}}",
              "subject": "Task Blocked - {{task_description}}",
              "body": "A task has been blocked and needs attention:\n\nTask: {{task_description}}\nClient: {{client_name}}\nTechnician: {{technician_name}}\nPrevious Status: {{old_status}}\n\nPlease review and take necessary action to unblock this task."
            }
          }
        ]
      }
    ]
  }'::jsonb,
  'Activity',
  'Smart',
  '2 mins',
  0
);

-- Also add a task reminder template
INSERT INTO automation_templates (
  id, 
  name, 
  description, 
  category, 
  trigger_type, 
  action_type,
  is_active, 
  is_system,
  config,
  template_config,
  icon,
  badge,
  estimated_time,
  usage_count
)
VALUES 
(
  gen_random_uuid(),
  'Task Due Soon Reminder',
  'Remind team members about tasks due within 24 hours',
  'Task Management',
  'time_based',
  'sms',
  true,
  false,
  '{
    "schedule": {
      "type": "daily",
      "time": "09:00",
      "timezone": "America/New_York"
    },
    "conditions": {
      "due_within_hours": 24,
      "status": ["pending", "in_progress"]
    }
  }'::jsonb,
  '{
    "actions": [
      {
        "type": "send_sms",
        "settings": {
          "to": "{{technician_phone}}",
          "message": "Reminder: Task \"{{task_description}}\" for {{client_name}} is due {{due_date}} at {{due_time}}. Priority: {{task_priority}}"
        }
      }
    ]
  }'::jsonb,
  'Clock',
  'Proactive',
  '1 min',
  0
);
