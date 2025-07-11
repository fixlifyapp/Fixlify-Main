export const MESSAGE_TEMPLATES = {
  // Appointment Reminders
  appointment_24h: {
    sms: "Hi {{client_first_name}}, reminder: You have an appointment tomorrow at {{appointment_time}}. Reply YES to confirm or call {{company_phone}} to reschedule. - {{company_name}}",
    email: {
      subject: "Appointment Reminder - {{appointment_date}} at {{appointment_time}}",
      body: `Dear {{client_name}},

This is a friendly reminder about your upcoming appointment:

📅 Date: {{appointment_date}}
⏰ Time: {{appointment_time}}
📍 Location: {{address}}
🔧 Service: {{service_type}}

Please ensure someone is available at the property during the scheduled time. If you need to reschedule, please call us at {{company_phone}} or reply to this email.

Best regards,
{{company_name}}
{{company_phone}}
{{company_email}}`
    }
  },
  
  // Job Completion
  job_completed: {
    sms: "Hi {{client_first_name}}, we've completed the {{service_type}} at your property. Invoice #{{invoice_number}} sent. Thank you for choosing {{company_name}}!",
    email: {
      subject: "Service Completed - {{service_type}} - Invoice #{{invoice_number}}",
      body: `Dear {{client_name}},

We're pleased to inform you that we've successfully completed the service at your property.

Service Details:
• Service Type: {{service_type}}
• Completion Date: {{completion_date}}
• Technician: {{technician_name}}
• Job ID: #{{job_id}}

Your invoice #{{invoice_number}} for ${{amount}} has been sent separately.

If you have any questions or concerns about the work performed, please don't hesitate to contact us.

Thank you for choosing {{company_name}}!

Best regards,
{{company_name}}
{{company_phone}}
{{company_email}}`
    }
  },
  
  // Payment Reminders  
  payment_overdue_3days: {
    sms: "Hi {{client_first_name}}, friendly reminder: Invoice #{{invoice_number}} (${{amount}}) was due {{due_date}}. Please pay at your earliest convenience. - {{company_name}}",
    email: {
      subject: "Payment Reminder - Invoice #{{invoice_number}}",
      body: `Dear {{client_name}},

This is a friendly reminder that payment for invoice #{{invoice_number}} was due on {{due_date}}.

Invoice Details:
• Invoice Number: #{{invoice_number}}
• Amount Due: ${{amount}}
• Due Date: {{due_date}}
• Service Date: {{service_date}}

To make a payment:
• Online: [Payment Portal]
• Phone: {{company_phone}}
• Mail: {{company_address}}

If you've already sent payment, please disregard this notice.

Thank you,
{{company_name}}`
    }
  },

  payment_overdue_7days: {
    sms: "{{client_first_name}}, Invoice #{{invoice_number}} (${{amount}}) is now 7 days overdue. Please contact us at {{company_phone}} to avoid service interruption. - {{company_name}}",
    email: {
      subject: "Important: Invoice #{{invoice_number}} - 7 Days Past Due",
      body: `Dear {{client_name}},

We haven't received payment for invoice #{{invoice_number}}, which is now 7 days past due.

Invoice Details:
• Invoice Number: #{{invoice_number}}
• Amount Due: ${{amount}}
• Due Date: {{due_date}}
• Days Overdue: 7

To avoid any service interruptions, please remit payment immediately.

Payment Options:
• Online: [Payment Portal]
• Phone: {{company_phone}} 
• Mail: {{company_address}}

If you're experiencing difficulties or need to discuss payment arrangements, please contact us immediately.

Best regards,
{{company_name}}`
    }
  },

  payment_overdue_14days: {
    sms: "URGENT: Invoice #{{invoice_number}} (${{amount}}) is 14 days overdue. Service may be affected. Call {{company_phone}} immediately. - {{company_name}}",
    email: {
      subject: "URGENT: Invoice #{{invoice_number}} - 14 Days Past Due - Action Required",
      body: `Dear {{client_name}},

This is an urgent notice regarding your overdue invoice.

Invoice Details:
• Invoice Number: #{{invoice_number}}
• Amount Due: ${{amount}}
• Due Date: {{due_date}}
• Days Overdue: 14

IMPORTANT: Your account may be subject to service suspension or additional fees if payment is not received within the next 48 hours.

Please take immediate action:
• Call us now: {{company_phone}}
• Pay online: [Payment Portal]
• Email us: {{company_email}}

We value your business and want to help resolve this matter quickly.

Sincerely,
{{company_name}}`
    }
  },

  // New Customer Welcome
  new_customer: {
    sms: "Welcome to {{company_name}}, {{client_first_name}}! Save this number for 24/7 service. Get 10% off your next service. We're here when you need us!",
    email: {
      subject: "Welcome to {{company_name}} - Your Trusted Service Partner",
      body: `Dear {{client_name}},

Welcome to the {{company_name}} family!

We're thrilled to have you as our newest customer and look forward to providing you with exceptional service.

🎁 New Customer Benefits:
• 10% off your next service
• Priority scheduling
• 24/7 emergency support
• Annual maintenance reminders

📱 Save Our Contact Info:
• Phone: {{company_phone}}
• Email: {{company_email}}
• Website: {{company_website}}
• Emergency Line: {{company_phone}}

🔧 Our Services:
• HVAC Installation & Repair
• Plumbing Services
• Electrical Work
• Preventive Maintenance Plans

We're here whenever you need us. Don't hesitate to reach out with any questions!

Welcome aboard!
{{company_name}} Team`
    }
  },

  // Estimate Follow-up
  estimate_followup_3days: {
    sms: "Hi {{client_first_name}}, following up on your estimate for {{service_type}}. Any questions? Ready to schedule? Call {{company_phone}} - {{company_name}}",
    email: {
      subject: "Your {{service_type}} Estimate - Any Questions?",
      body: `Dear {{client_name}},

I wanted to follow up on the estimate we sent for {{service_type}}.

Estimate Details:
• Estimate #: {{estimate_number}}
• Service: {{service_type}}
• Total: ${{amount}}
• Valid Until: {{expiry_date}}

We understand you may be comparing options or have questions. I'm here to help!

📞 Questions? Call me directly: {{company_phone}}
📅 Ready to schedule? We have openings this week

Don't forget: Our estimate includes:
✓ Quality parts warranty
✓ Labor guarantee
✓ No hidden fees
✓ Licensed & insured technicians

Best regards,
{{company_name}}`
    }
  },

  // Win-back Campaign
  win_back_6months: {
    sms: "Hi {{client_first_name}}, we miss you! It's been 6 months since your last service. Enjoy 15% off your next visit. Call {{company_phone}} - {{company_name}}",
    email: {
      subject: "We Miss You! Special Offer Inside 🎁",
      body: `Dear {{client_name}},

We noticed it's been a while since your last service, and we wanted to check in!

🎁 Welcome Back Offer: 15% OFF Your Next Service

Has your {{last_service_type}} been running smoothly? Regular maintenance can:
• Prevent costly breakdowns
• Extend equipment life
• Improve efficiency
• Maintain warranties

📞 Schedule Your Discounted Service:
Call: {{company_phone}}
Email: {{company_email}}

This offer expires in 30 days - don't miss out!

We value your business and would love to serve you again.

Best regards,
{{company_name}}`
    }
  },

  // Referral Request
  referral_request: {
    sms: "Hi {{client_first_name}}, thanks for the 5-star review! Know anyone who needs {{service_type}}? They'll get 10% off & you'll get a $25 credit! - {{company_name}}",
    email: {
      subject: "Thank You for Your 5-Star Review! 🌟",
      body: `Dear {{client_name}},

Thank you so much for your wonderful 5-star review! It means the world to us.

💝 Share the Love - Referral Program:

When you refer friends or family:
• They get 10% off their first service
• You get a $25 credit on your account
• No limit on referrals!

How to Refer:
1. Share this email with friends
2. Have them mention your name when calling
3. Or reply with their contact info

Thank you for trusting us with your home comfort needs!

Best regards,
{{company_name}}
{{company_phone}}
{{company_email}}`
    }
  },

  // Seasonal Maintenance
  seasonal_spring_ac: {
    sms: "🌸 Spring AC Tune-Up Special! Beat the heat - schedule now & save $50. Limited spots available. Call {{company_phone}} - {{company_name}}",
    email: {
      subject: "🌸 Spring AC Tune-Up Special - Save $50!",
      body: `Dear {{client_name}},

Spring is here! Time to prepare your AC for the hot months ahead.

🎯 Spring AC Tune-Up Special: Save $50!
Regular Price: $149
Your Price: $99

What's Included:
✓ 21-point inspection
✓ Clean condenser coils
✓ Check refrigerant levels
✓ Test all components
✓ Replace air filter
✓ Priority summer service

⏰ Limited Time Offer - Expires {{expiry_date}}

📞 Schedule Now: {{company_phone}}
📧 Email: {{company_email}}

Beat the rush and ensure your comfort all summer long!

Best regards,
{{company_name}}`
    }
  },

  seasonal_fall_heating: {
    sms: "🍂 Fall Heating Tune-Up Special! Stay warm this winter - schedule now & save $50. Don't wait! Call {{company_phone}} - {{company_name}}",
    email: {
      subject: "🍂 Fall Heating Tune-Up Special - Prepare for Winter!",
      body: `Dear {{client_name}},

Fall is the perfect time to ensure your heating system is ready for winter.

🎯 Fall Heating Tune-Up Special: Save $50!
Regular Price: $149
Your Price: $99

What's Included:
✓ Complete system inspection
✓ Clean burners & heat exchanger
✓ Test safety controls
✓ Check carbon monoxide levels
✓ Replace furnace filter
✓ Priority winter service

⏰ Limited Time Offer - Expires {{expiry_date}}

📞 Schedule Now: {{company_phone}}
📧 Email: {{company_email}}

Stay warm and safe this winter!

Best regards,
{{company_name}}`
    }
  },

  // Service Anniversary
  service_anniversary_1year: {
    sms: "🎉 Happy 1-Year Anniversary {{client_first_name}}! Thanks for trusting {{company_name}}. Enjoy 20% off your next service as our thank you!",
    email: {
      subject: "🎉 Happy 1-Year Anniversary with {{company_name}}!",
      body: `Dear {{client_name}},

It's been exactly one year since you became part of our {{company_name}} family!

🎁 Anniversary Gift: 20% OFF Your Next Service

Thank you for trusting us with your home comfort needs. Your loyalty means everything to us.

Over the past year:
• Services completed: {{services_count}}
• Money saved on repairs: ${{savings_amount}}
• Emergency calls avoided: {{preventive_services}}

📞 Use Your Anniversary Discount:
Call: {{company_phone}}
Email: {{company_email}}
Mention code: ANNIVERSARY20

Here's to many more years together!

Warmly,
{{company_name}} Team`
    }
  },

  // Emergency Follow-up
  emergency_followup: {
    sms: "Hi {{client_first_name}}, hope the emergency repair is working well! We're here if you need anything. Save on prevention plan: {{company_phone}} - {{company_name}}",
    email: {
      subject: "Following Up on Your Emergency Service",
      body: `Dear {{client_name}},

We hope everything has been running smoothly since our emergency visit on {{service_date}}.

Emergency Service Summary:
• Issue: {{emergency_issue}}
• Solution: {{repair_performed}}
• Technician: {{technician_name}}

🛡️ Prevent Future Emergencies
Consider our Preventive Maintenance Plan:
• Regular tune-ups
• Priority service
• No overtime charges
• 15% parts discount
• Extended warranties

Starting at just $19/month!

📞 Questions or concerns? Call: {{company_phone}}
📧 Email: {{company_email}}

Thank you for trusting us in your time of need.

Best regards,
{{company_name}}`
    }
  },

  // Payment Thank You
  payment_received: {
    sms: "Thank you {{client_first_name}}! Payment received for invoice #{{invoice_number}}. We appreciate your prompt payment! - {{company_name}}",
    email: {
      subject: "Payment Received - Thank You!",
      body: `Dear {{client_name}},

Thank you for your payment!

Payment Details:
• Invoice #: {{invoice_number}}
• Amount: ${{amount}}
• Payment Date: {{payment_date}}

We appreciate your prompt payment and your continued trust in {{company_name}}.

Need anything else? We're just a call away!

Best regards,
{{company_name}}
{{company_phone}}
{{company_email}}`
    }
  }
};

// Helper function to get template by ID
export function getMessageTemplate(templateId: string, messageType: 'sms' | 'email') {
  const template = MESSAGE_TEMPLATES[templateId];
  if (!template) return null;
  
  return messageType === 'sms' ? template.sms : template.email;
}

// Get all template categories
export function getTemplateCategories() {
  return {
    appointments: ['appointment_24h'],
    jobs: ['job_completed', 'emergency_followup'],
    payments: ['payment_overdue_3days', 'payment_overdue_7days', 'payment_overdue_14days', 'payment_received'],
    marketing: ['new_customer', 'estimate_followup_3days', 'win_back_6months', 'referral_request'],
    seasonal: ['seasonal_spring_ac', 'seasonal_fall_heating'],
    loyalty: ['service_anniversary_1year']
  };
}

// Get template info for UI display
export function getTemplateInfo(templateId: string) {
  const categories = getTemplateCategories();
  const categoryEntry = Object.entries(categories).find(([_, templates]) => 
    templates.includes(templateId)
  );
  
  return {
    id: templateId,
    category: categoryEntry?.[0] || 'general',
    name: templateId.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    hasEmail: !!MESSAGE_TEMPLATES[templateId]?.email,
    hasSms: !!MESSAGE_TEMPLATES[templateId]?.sms
  };
}