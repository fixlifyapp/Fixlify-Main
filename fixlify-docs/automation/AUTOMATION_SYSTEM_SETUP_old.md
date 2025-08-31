# Fixlify Automation System - Complete Setup Guide

## Overview
The Fixlify Automation System provides powerful workflow automation capabilities with integrated SMS and Email communication channels. This guide covers the complete setup and deployment process.

## 🚀 Deployment Summary

### Edge Functions Deployed
1. **telnyx-sms** - SMS messaging via Telnyx
2. **mailgun-email** - Email messaging via Mailgun
3. **automation-executor** - Workflow execution engine

### Database Updates
- Updated `automation_communication_logs` table with proper fields
- Added indexes for performance optimization
- Enabled Row Level Security (RLS) with appropriate policies

### Frontend Updates
- Updated `automation-execution-service.ts` to use new edge function parameters
- Created `TestAutomationPage.tsx` for testing the automation system
- Added route `/test-automation` to the application

## 📋 Environment Variables Required

### Supabase Edge Functions
Set these in your Supabase dashboard under Project Settings > Edge Functions:

```bash
# Telnyx Configuration (for SMS)
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_MESSAGING_PROFILE_ID=your_profile_id (optional)

# Mailgun Configuration (for Email)
MAILGUN_API_KEY=your_mailgun_api_key
# Note: Domain is hardcoded as 'fixlify.app' in the edge function

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

## 🔧 Feature Capabilities

### SMS Automation
- Send automated SMS messages via Telnyx
- Phone number formatting for international support
- Full tracking and logging
- Integration with automation workflows

### Email Automation
- Send HTML/Text emails via Mailgun
- Automatic company branding
- Open and click tracking
- Reply-to configuration

### Workflow Automation
- Multi-step workflows
- Conditional logic
- Delay actions
- Status updates
- Task creation
- Webhook integration
- AI content generation

### Communication Logging
- All communications logged to `communication_logs` table
- Automation-specific logging to `automation_communication_logs`
- Full metadata tracking
- Provider response storage

## 🧪 Testing the System

### 1. Access the Test Page
Navigate to: `http://localhost:8080/test-automation`

### 2. Test SMS Messaging
- Enter a valid phone number (will be auto-formatted)
- Type a test message
- Optionally associate with a client
- Click "Send Test SMS"

### 3. Test Email Messaging
- Enter recipient email
- Add subject and message (HTML supported)
- Optionally associate with a client
- Click "Send Test Email"

### 4. Test Complete Workflow
- Select an active workflow
- Choose a client for testing
- Click "Execute Test Workflow"
- The system will execute all workflow steps

### 5. Monitor Logs
- View recent communication logs at the bottom
- Check status of sent messages
- Debug any failures

## 🔍 Troubleshooting

### SMS Not Sending
1. Check Telnyx API key is set correctly
2. Verify phone number format (+1 for US numbers)
3. Check Telnyx account has SMS enabled
4. Review edge function logs in Supabase dashboard

### Email Not Sending
1. Verify Mailgun API key is correct
2. Ensure fixlify.app domain is configured in Mailgun
3. Check recipient email is valid
4. Review edge function logs

### Workflow Execution Fails
1. Ensure workflow is marked as "active"
2. Verify all required context data is provided
3. Check edge function has proper permissions
4. Review automation_execution_logs table

## 📊 Database Schema

### automation_communication_logs
```sql
- id (UUID)
- user_id (UUID)
- automation_id (UUID) 
- workflow_id (UUID)
- communication_type (VARCHAR)
- recipient (VARCHAR)
- subject (VARCHAR)
- content (TEXT)
- status (VARCHAR)
- provider (VARCHAR)
- provider_response (JSONB)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### communication_logs
```sql
- id (UUID)
- type (VARCHAR) - 'sms' or 'email'
- direction (VARCHAR) - 'inbound' or 'outbound'
- recipient (VARCHAR)
- sender (VARCHAR)
- subject (VARCHAR)
- content (TEXT)
- status (VARCHAR)
- provider (VARCHAR)
- provider_message_id (VARCHAR)
- client_id (TEXT)
- job_id (TEXT)
- user_id (UUID)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

## 🎯 Usage Examples

### Creating a Simple SMS Automation
```javascript
// Example workflow configuration
{
  name: "Appointment Reminder",
  trigger: {
    type: "scheduled",
    config: {
      timing: "24_hours_before",
      event: "appointment"
    }
  },
  steps: [
    {
      type: "send_sms",
      config: {
        message: "Hi {{clientName}}, this is a reminder about your appointment tomorrow at {{appointmentTime}}. Reply CONFIRM to confirm or CANCEL to cancel."
      }
    }
  ]
}
```

### Creating an Email Follow-up
```javascript
{
  name: "Job Completion Follow-up",
  trigger: {
    type: "job_status_change",
    config: {
      from_status: "in_progress",
      to_status: "completed"
    }
  },
  steps: [
    {
      type: "delay",
      config: {
        delay_value: 1,
        delay_unit: "hours"
      }
    },
    {
      type: "send_email",
      config: {
        subject: "Thank you for choosing {{companyName}}!",
        message: "<h2>Job Completed</h2><p>We've completed the work at your property. Please let us know if you have any questions!</p>"
      }
    }
  ]
}
```

## 🚀 Next Steps

1. **Configure Providers**: Set up your Telnyx and Mailgun accounts
2. **Add Environment Variables**: Configure all required API keys
3. **Test Communications**: Use the test page to verify setup
4. **Create Workflows**: Build automation workflows for your business
5. **Monitor Performance**: Track execution logs and success rates

## 📞 Support

For issues or questions:
- Check edge function logs in Supabase dashboard
- Review browser console for frontend errors
- Check network tab for API responses
- Contact support with error messages and logs

---

**Last Updated**: January 2025
**Version**: 1.0.0