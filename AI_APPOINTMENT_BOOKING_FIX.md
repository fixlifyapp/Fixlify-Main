# AI DISPATCHER APPOINTMENT BOOKING FIX

## Problem Identified
The AI dispatcher is not booking appointments because:
1. The Telnyx AI Assistant needs proper tool configuration
2. The tools/MCP server connection is not set up correctly
3. The appointment handler endpoint needs to be configured in Telnyx

## Solution Implemented

### 1. Created New Edge Function: `ai-appointment-bridge`
URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-bridge`

This bridge handles:
- ✅ Checking appointment availability
- ✅ Booking appointments
- ✅ Canceling appointments

### 2. Telnyx Configuration Required

Go to Telnyx Portal → AI Assistants → Your Assistant → Tools section

#### Add Tool 1: Check Availability
```
Name: check_availability
Description: Check available appointment slots for a specific date
URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-bridge
Method: POST
Body Parameters:
{
  "action": "check_availability",
  "date": "{{date}}"
}
```

#### Add Tool 2: Book Appointment
```
Name: book_appointment  
Description: Book an appointment for the customer
URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-bridge
Method: POST
Body Parameters:
{
  "action": "book_appointment",
  "customer_phone": "{{telnyx_end_user_target}}",
  "customer_name": "{{customer_name}}",
  "date": "{{date}}",
  "time": "{{time}}",
  "service_type": "{{service_type}}",
  "description": "{{issue_description}}"
}
```

#### Add Tool 3: Cancel Appointment
```
Name: cancel_appointment
Description: Cancel an existing appointment
URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-bridge
Method: POST
Body Parameters:
{
  "action": "cancel_appointment",
  "booking_id": "{{booking_id}}"
}
```

### 3. Update AI Instructions in Telnyx

Add this to your AI Assistant instructions:

```
## APPOINTMENT BOOKING TOOLS

When customer mentions scheduling, appointment, or booking:
1. IMMEDIATELY use check_availability tool for the requested date
2. Show available slots to customer
3. When customer selects a time, use book_appointment tool
4. Confirm the booking details

TOOL TRIGGERS:
- "schedule", "appointment", "book" → use check_availability
- Customer selects time → use book_appointment
- "cancel" → use cancel_appointment

IMPORTANT: 
- Always use tools, don't just say you will
- Execute tools immediately when triggered
- Confirm successful bookings with confirmation number
```

### 4. Test Instructions

1. **Test via Browser Console:**
```javascript
// Paste this in browser console (F12)
const testUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-bridge'

// Test availability
fetch(testUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'check_availability',
    date: new Date().toISOString().split('T')[0]
  })
}).then(r => r.json()).then(console.log)
```

2. **Test via Phone Call:**
- Call your AI number: +14375249932
- Say: "I need to schedule an appointment for tomorrow"
- AI should use the check_availability tool
- Select a time when offered
- AI should book the appointment

### 5. Verify in Database

Check if appointments are being created:
```sql
SELECT * FROM jobs 
WHERE booked_via = 'ai_dispatcher' 
ORDER BY created_at DESC;
```

### 6. Common Issues & Solutions

**Issue: AI says "I'll check availability" but hangs up**
- Solution: Tools not configured in Telnyx
- Fix: Add the tools exactly as shown above

**Issue: Tools return 404 error**
- Solution: URL is incorrect
- Fix: Use exactly: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-bridge

**Issue: No parameters passed**
- Solution: Variables not mapped
- Fix: Use {{variable_name}} format in Telnyx

**Issue: Authentication error**
- Solution: Remove authentication headers
- Fix: Don't add any auth headers in Telnyx tool config

### 7. Monitoring

To monitor appointment bookings:
1. Check webhook logs
2. Check jobs table for booked_via = 'ai_dispatcher'
3. Check Telnyx logs for tool execution

## Next Steps

1. ✅ Edge function deployed and ready
2. ⏳ Configure tools in Telnyx portal (you need to do this)
3. ⏳ Update AI instructions in Telnyx
4. ⏳ Test with a phone call
5. ⏳ Verify appointments appear in system

## Support Scripts

- Test script: `test-ai-appointment-bridge.js`
- Diagnosis script: `diagnose-ai-tools.js`

The system is now ready - you just need to configure the tools in Telnyx!
