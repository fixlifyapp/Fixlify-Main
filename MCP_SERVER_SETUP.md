# Fixlify MCP Server Setup for Telnyx AI Assistant

## 🚀 MCP Server Created!

Your MCP server is now live at:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server
```

## Features Available

The MCP server provides 10 powerful tools for your AI assistant:

### 📅 Appointment Management
1. **check_availability** - Check available time slots
2. **book_appointment** - Book new appointments
3. **reschedule_appointment** - Change appointment times
4. **cancel_appointment** - Cancel appointments
5. **get_todays_schedule** - View today's appointments

### 👥 Customer Management
6. **find_customer** - Search for existing customers
7. **get_customer_history** - View customer service history
8. **create_service_ticket** - Create service tickets

### 🔧 Operations
9. **check_technician_availability** - See available technicians
10. **get_service_pricing** - Get pricing information

## 🔧 Telnyx Configuration

### Step 1: Add MCP Server to Telnyx

In your Telnyx AI Assistant settings, add the MCP server:

```yaml
Name: Fixlify MCP Server
URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server
Protocol: MCP
Method: POST
```

### Step 2: Update AI Instructions

Add this to your AI Assistant instructions:

```
## MCP TOOLS AVAILABLE

You have access to the following tools via MCP:

1. **check_availability** - Use when customer asks about scheduling
2. **book_appointment** - Use to book appointments
3. **find_customer** - Use to look up existing customers
4. **get_customer_history** - Use to check past services
5. **reschedule_appointment** - Use to change appointments
6. **cancel_appointment** - Use to cancel appointments
7. **get_todays_schedule** - Use to check today's schedule
8. **check_technician_availability** - Use to find available technicians
9. **create_service_ticket** - Use for non-scheduled service requests
10. **get_service_pricing** - Use to quote prices

IMPORTANT RULES:
- When customer mentions "appointment" or "schedule" → IMMEDIATELY use check_availability
- Always confirm details before booking
- Use find_customer first for returning customers
- Provide confirmation numbers after booking

CONVERSATION FLOW:
1. Customer: "I need to schedule an appointment"
   → Use: check_availability(date: "tomorrow")
   
2. Customer: "10am works for me"
   → Use: book_appointment(time: "10:00", ...)
   
3. Customer: "What's my history?"
   → Use: get_customer_history(customer_phone: "{{telnyx_end_user_target}}")
```

## 🧪 Testing the MCP Server

### Browser Console Test:
```javascript
// Test MCP server directly
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'check_availability',
    date: new Date().toISOString().split('T')[0]
  })
}).then(r => r.json()).then(console.log)
```

### Test All Tools:
```javascript
// Test each tool
const mcp = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server'

// 1. Check availability
fetch(mcp, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'check_availability',
    date: '2025-08-19'
  })
}).then(r => r.json()).then(data => {
  console.log('Available slots:', data)
  
  // 2. Book appointment
  if (data.available_slots && data.available_slots.length > 0) {
    return fetch(mcp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'book_appointment',
        customer_phone: '+14375621308',
        customer_name: 'Test Customer',
        date: '2025-08-19',
        time: data.available_slots[0].time,
        service_type: 'Appliance Repair',
        description: 'Refrigerator not cooling'
      })
    })
  }
}).then(r => r.json()).then(console.log)
```

## 📊 Monitoring

Check if appointments are being created:
```sql
SELECT * FROM jobs 
WHERE booked_via = 'mcp_ai' 
ORDER BY created_at DESC;
```

## 🎯 MCP Protocol Support

The server supports both:
1. **Direct tool calls** (simpler, what Telnyx uses)
2. **Full MCP protocol** (JSON-RPC 2.0)

Example MCP protocol call:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/execute",
  "params": {
    "name": "check_availability",
    "arguments": {
      "date": "2025-08-19"
    }
  },
  "id": 1
}
```

## 🔑 Key Advantages of MCP Server

1. **Rich Context** - Access to full customer history
2. **Complex Operations** - Can handle multi-step processes
3. **Real-time Data** - Direct database access
4. **Intelligent Routing** - Can assign to specific technicians
5. **Business Logic** - Enforces your business rules

## 🚨 Troubleshooting

If not working:
1. Check Telnyx logs for MCP calls
2. Check Supabase edge function logs
3. Verify URL is exactly: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server`
4. Make sure no authentication headers are set
5. Test directly in browser console first

## 📝 Example Conversations

**Customer**: "I need to schedule a repair"
**AI**: [Uses check_availability] "I can help with that. I have slots available tomorrow at 9am, 10am, 2pm, and 3pm. Which works best?"

**Customer**: "10am please"
**AI**: [Uses book_appointment] "Perfect! I've booked your appointment for tomorrow at 10am. Your confirmation number is ABC12345."

**Customer**: "Actually, can we make it 2pm instead?"
**AI**: [Uses reschedule_appointment] "No problem! I've rescheduled your appointment to 2pm. Same confirmation number."

## Status: ✅ READY TO USE

The MCP server is deployed and ready. Just add it to Telnyx!
