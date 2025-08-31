# Fixlify Workflow Builder Documentation

## Overview

The enhanced Workflow Builder (previously called "Builder" tab, now renamed to "Workflows") provides a powerful visual interface for creating multi-step automation workflows with advanced trigger conditions.

## Key Improvements

### 1. Enhanced Templates Tab
- **More functional template creation**: Templates now include advanced trigger configurations
- **Trigger conditions**: Each trigger type has specific configuration options (e.g., amount thresholds, time delays, weather conditions)
- **Smart defaults**: Pre-configured templates with industry best practices

### 2. Workflows Tab (Renamed from Builder)
- **Multi-step workflows**: Create complex automations with 2+ steps
- **Visual workflow builder**: Drag-and-drop interface for building workflows
- **Advanced trigger configuration**: Detailed settings for each trigger type
- **Conditional logic**: Support for branching workflows based on conditions

### 3. Advanced Trigger Types

#### Job-Related Triggers
- **Job Completed**: Filter by job type, service category, include/exclude weekends
- **Job Scheduled**: Set reminder timing, filter by priority level

#### Financial Triggers
- **Invoice Paid**: Set minimum amount threshold, filter by payment method
- **Invoice Above Threshold**: Define threshold amount, optionally include estimates
- **Payment Overdue**: Configure days overdue, minimum amount, exclude disputed invoices

#### Customer Triggers
- **New Customer**: Filter by source (website, phone, referral), require contact info
- **Rating Below Threshold**: Set rating threshold, include/exclude comments
- **Days Since Last Service**: Configure day range, filter by service type and customer segment

#### Time-Based Triggers
- **Time-Based Schedule**: Daily/weekly/monthly schedules with custom timing
- **Weather Forecast**: Trigger based on weather conditions and temperature thresholds
- **Membership Expiring**: Set days before expiry, filter by membership type

### 4. Step Types

#### Communication Steps
- **Email**: Rich text editor with variable support, AI-powered content generation
- **SMS**: Character-limited messages with variable insertion
- **Push Notification**: In-app notifications

#### Action Steps
- **Delay**: Wait for minutes/hours/days/weeks before next step
- **Gift Card**: Send automated gift cards with custom amounts
- **Conditional Branch**: Split workflow based on conditions

### 5. Smart Features

#### AI-Powered Content
- Generate email and SMS content with AI
- Context-aware suggestions based on trigger type
- Maintains brand voice and tone

#### Variable System
- System variables: `{{client_name}}`, `{{company_name}}`, `{{appointment_time}}`, etc.
- Click to copy functionality
- Real-time variable preview

#### Smart Timing
- Business hours enforcement (don't send at 2 AM)
- Quiet hours respect (9 PM - 8 AM)
- Customer timezone awareness

## Example Workflows

### 1. Smart Review Request Workflow
**Trigger**: Job Completed (for jobs > $500)
**Steps**:
1. Wait 1 day
2. Send personalized SMS asking for review
3. If no response, wait 3 days
4. Send follow-up email with review link

### 2. VIP Customer Thank You
**Trigger**: Invoice Paid (amount > $1000)
**Steps**:
1. Send $50 gift card immediately
2. Send thank you email
3. Wait 30 days
4. Send maintenance reminder

### 3. Weather-Based HVAC Campaign
**Trigger**: Weather Forecast (temperature > 90°F in next 3 days)
**Steps**:
1. Send SMS to customers without recent AC service
2. Include special discount code
3. Wait 1 day
4. Send follow-up email to non-responders

## Best Practices

1. **Test Before Activating**: Use the test mode to simulate workflow execution
2. **Start Simple**: Begin with single-step workflows and add complexity gradually
3. **Use Variables**: Personalize messages with customer and job details
4. **Monitor Performance**: Check execution and success rates regularly
5. **Respect Timing**: Enable business hours and quiet hours for better customer experience

## Technical Implementation

The workflow system uses:
- **Database**: PostgreSQL with JSONB columns for flexible configuration
- **Real-time Updates**: Supabase subscriptions for live status updates
- **Queue System**: Background job processing for reliable execution
- **Error Handling**: Automatic retries with exponential backoff

## Migration from Old System

Existing automations are automatically converted to the new workflow format:
- Simple automations become single-step workflows
- Trigger conditions are preserved and enhanced
- Message templates are migrated with variables intact
