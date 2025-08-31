# AI Dispatcher Appointment System - Implementation Plan

## Architecture Overview
```
Call → Telnyx AI → Webhook Tools → Supabase → Database Actions
```

## Phase 1: Core Functions (Week 1)

### 1.1 Database Setup
```sql
-- Add appointment fields to jobs table
ALTER TABLE jobs ADD COLUMN scheduled_date DATE;
ALTER TABLE jobs ADD COLUMN scheduled_time TIME;
ALTER TABLE jobs ADD COLUMN appointment_status VARCHAR(50);
ALTER TABLE jobs ADD COLUMN booked_via VARCHAR(50);

-- Create availability table
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY,
  date DATE,
  time TIME,
  technician_id UUID,
  is_available BOOLEAN,
  service_type VARCHAR(100)
);
```

### 1.2 Edge Functions
- `ai-appointment-handler` - Main appointment management
- `ai-check-availability` - Real-time slot checking
- `ai-customer-lookup` - Find existing appointments

## Phase 2: Telnyx AI Tools Configuration

### Tool 1: Check Availability
```json
{
  "name": "check_availability",
  "description": "Check available appointment slots",
  "url": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-handler",
  "method": "POST",
  "body": {
    "action": "check_availability",
    "date": "{{requested_date}}",
    "service_type": "{{service_type}}"
  }
}
```

### Tool 2: Book Appointment
```json
{
  "name": "book_appointment",
  "description": "Book a new appointment",
  "url": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-handler",
  "method": "POST",
  "body": {
    "action": "book_appointment",
    "client_phone": "{{caller_phone}}",
    "client_name": "{{customer_name}}",
    "date": "{{appointment_date}}",
    "time": "{{appointment_time}}",
    "service_type": "{{service_type}}",
    "issue_description": "{{issue_description}}"
  }
}
```

### Tool 3: Cancel/Modify
```json
{
  "name": "manage_appointment",
  "description": "Cancel or reschedule appointment",
  "url": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-handler",
  "method": "POST",
  "body": {
    "action": "{{action_type}}",
    "phone_or_booking_id": "{{identifier}}",
    "new_date": "{{new_date}}",
    "new_time": "{{new_time}}"
  }
}
```

## Phase 3: AI Instructions Update

Add to Telnyx AI Assistant instructions:

```
## Appointment Booking Process
1. When customer wants to schedule:
   - Use check_availability tool for requested date
   - Offer available slots (morning/afternoon preference)
   - Confirm service type and issue
   
2. For booking:
   - Use book_appointment tool
   - Provide confirmation number
   - Send SMS confirmation (optional)
   
3. For existing appointments:
   - Ask for phone or booking ID
   - Use manage_appointment tool
   - Confirm changes

## Natural Language Examples:
Customer: "I need someone to fix my washing machine tomorrow"
AI: "Let me check tomorrow's availability... I have 10 AM or 2 PM available. Which works better?"

Customer: "I need to cancel my appointment"
AI: "I can help with that. Can you provide your phone number or booking ID?"
```

## Phase 4: Business Logic

### Availability Rules
- Business hours: 9 AM - 6 PM
- Slot duration: 2 hours default
- Buffer time: 30 minutes between appointments
- Emergency slots: Keep 20% open daily

### Smart Scheduling
```javascript
// Priority logic
1. Existing customers → Priority slots
2. Emergency repairs → Same day
3. New customers → Next available
4. Preventive maintenance → Off-peak hours
```

## Phase 5: Conversation Flow

### New Customer Booking
```
AI: "I can help schedule your repair. What appliance needs service?"
Customer: "My refrigerator isn't cooling"
AI: [check_availability] "I have a technician available today at 3 PM or tomorrow at 10 AM"
Customer: "Today please"
AI: [book_appointment] "Perfect! I've scheduled John for 3 PM today. Your booking ID is ABC123"
```

### Existing Customer
```
AI: "Hi John! I see you had your washer serviced last month. How can I help?"
Customer: "Need to reschedule tomorrow's appointment"
AI: [manage_appointment] "No problem. When would work better for you?"
```

## Phase 6: Testing Scenarios

1. **Happy Path**: Book → Confirm → Complete
2. **Cancellation**: Book → Cancel → Refund
3. **Reschedule**: Book → Modify → Confirm
4. **Double Booking**: Prevent conflicts
5. **No Show**: Auto-followup

## Implementation Timeline

**Week 1**: Database + Edge Functions
**Week 2**: Telnyx Tool Integration
**Week 3**: Testing + Refinement
**Week 4**: Production Launch

## Success Metrics
- Booking conversion rate: >60%
- Cancellation rate: <10%
- AI handling rate: >80%
- Customer satisfaction: >4.5/5