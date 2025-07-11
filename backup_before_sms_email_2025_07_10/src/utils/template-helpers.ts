export const getDefaultMessageTemplate = (templateId: string, type: string) => {
    const templates: Record<string, any> = {
      appointment_24h: {
        sms: 'Hi {{client_name}}, reminder: You have an appointment tomorrow at {{appointment_time}}. Reply C to confirm or R to reschedule.',
        emailSubject: 'Appointment Reminder - {{appointment_date}}',
        emailBody: 'Dear {{client_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nService: {{service_type}}\n\nIf you need to reschedule, please call us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      },
      job_complete: {
        sms: 'Thank you for choosing {{company_name}}! How was your experience? Please rate us: {{review_link}}',
        emailSubject: 'Thank you for your business!',
        emailBody: 'Dear {{client_name}},\n\nThank you for choosing {{company_name}} for your {{service_type}} needs.\n\nWe would love to hear about your experience. Please take a moment to leave us a review: {{review_link}}\n\nBest regards,\n{{company_name}}'
      },
      payment_reminder: {
        sms: 'Hi {{client_name}}, this is a reminder that your invoice {{invoice_number}} is due. Amount: {{amount}}. Pay online: {{payment_link}}',
        emailSubject: 'Payment Reminder - Invoice {{invoice_number}}',
        emailBody: 'Dear {{client_name}},\n\nThis is a friendly reminder that your invoice {{invoice_number}} for {{amount}} is now due.\n\nYou can pay online at: {{payment_link}}\n\nIf you have any questions, please contact us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      },
      review_request: {
        sms: 'Hi {{client_name}}, thanks for choosing {{company_name}}! We\'d love your feedback: {{review_link}}',
        emailSubject: 'How was your experience with {{company_name}}?',
        emailBody: 'Dear {{client_name}},\n\nThank you for choosing {{company_name}} for your recent {{service_type}} service.\n\nYour feedback is important to us. Please take a moment to share your experience:\n\n{{review_link}}\n\nThank you for your time!\n\n{{company_name}}'
      },
      estimate_follow_up: {
        sms: 'Hi {{client_name}}, following up on your estimate for {{service_type}}. Any questions? Call {{company_phone}}',
        emailSubject: 'Following up on your estimate',
        emailBody: 'Dear {{client_name}},\n\nI wanted to follow up on the estimate we sent for your {{service_type}} project.\n\nEstimate: {{estimate_number}}\nAmount: {{amount}}\n\nDo you have any questions or would you like to move forward?\n\nPlease let us know how we can help.\n\nBest regards,\n{{company_name}}'
      },
      maintenance_reminder: {
        sms: 'Hi {{client_name}}, it\'s time for your maintenance check! Book online: {{booking_link}} or call {{company_phone}}',
        emailSubject: 'Time for your scheduled maintenance',
        emailBody: 'Dear {{client_name}},\n\nIt\'s been {{months_since_service}} months since your last service.\n\nRegular maintenance helps:\n• Prevent costly repairs\n• Maintain efficiency\n• Extend equipment life\n\nSchedule your appointment:\n{{booking_link}}\n\nOr call us at {{company_phone}}\n\nBest regards,\n{{company_name}}'
      }
    };
    
    return templates[templateId]?.[type] || '';
  };