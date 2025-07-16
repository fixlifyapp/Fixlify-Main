-- Seed data for Fixlify automation templates
INSERT INTO automation_templates (name, description, category, template_config, usage_count, success_rate, average_revenue, estimated_time_saved, required_integrations, tags, is_featured) VALUES
-- Missed Call Templates
('Missed Call Text Back', 
 'Automatically text customers who call when you''re unavailable', 
 'missed_call',
 '{
   "triggers": [{
     "type": "missed_call",
     "label": "When a call is missed",
     "conditions": {
       "business_hours": "any",
       "customer_type": "any"
     }
   }],
   "actions": [{
     "type": "send_sms",
     "label": "Send text message immediately",
     "config": {
       "message": "Hi {{customer_name}}, sorry we missed your call! How can we help you today? Reply to this text or call us back at {{business_phone}}.",
       "delay_minutes": 0
     }
   }]
 }'::jsonb,
 15420,
 89.5,
 350.00,
 '2 hours/week',
 ARRAY['telnyx'],
 ARRAY['hvac', 'plumbing', 'electrical', 'universal'],
 true),

('Missed Call with Booking Link', 
 'Send SMS with direct booking link for missed calls', 
 'missed_call',
 '{
   "triggers": [{
     "type": "missed_call",
     "label": "When a call is missed"
   }],
   "actions": [{
     "type": "send_sms",
     "label": "Send booking link",
     "config": {
       "message": "Hi {{customer_name}}, we missed your call but we''re here to help! Book your appointment instantly: {{booking_link}}",
       "delay_minutes": 0
     }
   }]
 }'::jsonb,
 8750,
 91.2,
 425.00,
 '3 hours/week',
 ARRAY['telnyx'],
 ARRAY['universal'],
 true);

-- Appointment Reminder Templates
INSERT INTO automation_templates (name, description, category, template_config, usage_count, success_rate, average_revenue, estimated_time_saved, required_integrations, tags, is_featured) VALUES
('24-Hour Appointment Reminder', 
 'Send SMS and email reminders 24 hours before appointments', 
 'appointment',
 '{
   "triggers": [{
     "type": "time_based",
     "label": "24 hours before appointment",
     "config": {
       "time_before": "24_hours",
       "check_frequency": "hourly"
     }
   }],
   "actions": [
     {
       "type": "send_sms",
       "label": "Send SMS reminder",
       "config": {
         "message": "Hi {{customer_name}}, reminder: You have a {{service_type}} appointment tomorrow at {{appointment_time}}. Reply C to confirm or R to reschedule.",
         "delay_minutes": 0
       }
     },
     {
       "type": "send_email",
       "label": "Send email reminder",
       "config": {
         "subject": "Appointment Reminder - {{service_type}} Tomorrow",
         "template": "appointment_reminder",
         "delay_minutes": 5
       }
     }
   ]
 }'::jsonb,
 28350,
 94.2,
 NULL,
 '5 hours/week',
 ARRAY['telnyx', 'mailgun'],
 ARRAY['universal'],
 true);
