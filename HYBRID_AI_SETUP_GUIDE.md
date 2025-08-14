# 🚀 Fixlify Hybrid AI Voice System Setup

## Overview
You're implementing the **BEST** approach: AI Assistant for voice handling + MCP Server for integrations + Supabase for data.

## Your Current Setup ✅
- **AI Assistant**: `assistant-6f3d8e8f-2351-4946-9...` (Appointment Scheduler)
- **MCP Server**: `c646fbf5-a768-49eb-b8d2-f2faeb116154` (Fixlify AI Voice Assistant)
- **Edge Functions**: Ready for webhooks and MCP handling

## 📋 Step-by-Step Hybrid Configuration

### Step 1: Deploy the AI Assistant Webhook
```bash
cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
supabase functions deploy ai-assistant-webhook
```

### Step 2: Configure AI Assistant in Telnyx

1. **Go to your AI Assistant** (Appointment Scheduler)
2. **Edit the Assistant** and configure:

#### Basic Settings:
```yaml
Name: Fixlify AI Dispatcher
Model: Qwen/Qwen3-235B-A22B (or your preferred)
```

#### Instructions (with dynamic variables):
```
You are {{agent_name}} for {{business_name}}, a professional repair shop assistant.

Business Hours: {{hours_of_operation}}
Services: {{services_offered}}
Current Date/Time: {{current_date}} {{current_time}}

Your capabilities:
1. Check repair status (ask for ticket number)
2. Book appointments
3. Provide quotes for common repairs
4. Answer questions about our services

Always be professional, helpful, and friendly. If unsure, offer to transfer to a human.

For repair status: Ask for ticket number, then use check_repair_status tool.
For appointments: Check availability, then use book_appointment tool.
For quotes: Provide estimates based on device and issue.
```

#### Greeting:
```
{{greeting}}
```

#### Dynamic Variables Webhook URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

### Step 3: Connect MCP Server to AI Assistant

In your AI Assistant settings:

1. **Go to MCP Servers tab**
2. **Add MCP Server**
3. **Select your MCP Server**: `Fixlify AI Voice Assistant`
4. **Configure Available Tools**:
   - `check_repair_status`
   - `book_appointment`
   - `create_ticket`
   - `update_customer_info`
   - `send_sms_confirmation`

### Step 4: Add Supabase MCP Server

1. **Install Supabase MCP locally** (one-time setup):
```bash
npm install -g @supabase/mcp-server-supabase
```

2. **Run Supabase MCP Server**:
```bash
npx @supabase/mcp-server-supabase \
  --supabase-url https://mqppvcrlvsgrsqelglod.supabase.co \
  --supabase-service-role-key YOUR_SERVICE_ROLE_KEY \
  --port 3001
```

3. **Expose it via ngrok** (for testing):
```bash
ngrok http 3001
```

4. **Add to AI Assistant**:
   - Go to MCP Servers tab
   - Add the ngrok URL as external MCP server
   - Select tools: `fetch_data`, `run_sql`, `insert_data`

### Step 5: Create MCP Tools Handler

Create edge function for custom tools:
```typescript
// supabase/functions/mcp-tools-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { tool, parameters, metadata } = await req.json();
  const conversationId = metadata?.telnyx_conversation_id;
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  switch(tool) {
    case 'check_repair_status':
      return await checkRepairStatus(supabase, parameters);
    case 'book_appointment':
      return await bookAppointment(supabase, parameters);
    case 'create_ticket':
      return await createTicket(supabase, parameters);
    default:
      return new Response(JSON.stringify({ error: 'Unknown tool' }), { status: 400 });
  }
});

async function checkRepairStatus(supabase: any, params: any) {
  const { ticket_number } = params;
  
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', ticket_number)
    .single();
  
  if (!job) {
    return new Response(JSON.stringify({
      result: 'No repair found with that ticket number.'
    }));
  }
  
  return new Response(JSON.stringify({
    result: `Repair ${job.id}: ${job.device_brand} ${job.device_type}. Status: ${job.status}. ${job.notes || ''}`
  }));
}

async function bookAppointment(supabase: any, params: any) {
  const { customer_name, phone, date, time, issue } = params;
  
  const { data: appointment } = await supabase
    .from('appointments')
    .insert({
      customer_name,
      phone,
      appointment_date: date,
      appointment_time: time,
      issue_description: issue,
      status: 'scheduled'
    })
    .select()
    .single();
  
  return new Response(JSON.stringify({
    result: `Appointment booked for ${date} at ${time}. Confirmation #${appointment.id}`
  }));
}
```

### Step 6: Configure Phone Number Routing

```javascript
// Run in browser console on Fixlify
async function configurePhoneForHybrid() {
  const { data, error } = await window.supabase
    .from('phone_numbers')
    .update({
      ai_dispatcher_enabled: true,
      ai_assistant_id: 'assistant-6f3d8e8f-2351-4946-9...',
      mcp_server_id: 'c646fbf5-a768-49eb-b8d2-f2faeb116154',
      mcp_enabled: true,
      webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook'
    })
    .eq('phone_number', '+14375249932');
  
  console.log(error ? 'Error:' + error.message : '✅ Phone configured for hybrid AI!');
}

configurePhoneForHybrid();
```

### Step 7: Test Your Hybrid System

1. **Test Dynamic Variables**:
```javascript
// Simulate webhook call
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      payload: {
        telnyx_agent_target: '+14375249932',
        telnyx_end_user_target: '+1234567890',
        call_control_id: 'test-123'
      }
    }
  })
}).then(r => r.json()).then(console.log);
```

2. **Make Test Call**:
   - Call `+14375249932`
   - Should hear personalized greeting
   - Test "Check repair status"
   - Test "Book appointment"

## 🎯 What This Hybrid Setup Gives You:

### Immediate Benefits:
1. **Personalized greetings** per company
2. **Real-time data access** during calls
3. **Automated appointment booking**
4. **Repair status checks**
5. **SMS confirmations** after calls

### Architecture:
```
Customer Call
    ↓
Telnyx AI Assistant (Voice Layer)
    ↓
Dynamic Variables Webhook (Personalization)
    ↓
MCP Tools (Actions during call)
    ↓
Supabase (Database operations)
```

### Advanced Features You Can Add:

1. **Multi-language Support**:
```javascript
// In dynamic variables webhook
const language = await detectCustomerLanguage(callerNumber);
dynamicVariables.language = language; // 'es-US', 'fr-FR', etc.
```

2. **Smart Call Routing**:
```javascript
// Route to human if VIP customer
if (customer?.vip_status) {
  dynamicVariables.transfer_to_human = 'true';
}
```

3. **Real-time Queue Position**:
```javascript
// Tell customer their position
const queuePosition = await getQueuePosition(supabase);
dynamicVariables.queue_position = queuePosition;
```

## 📊 Monitoring & Analytics

Create dashboard to track:
- Calls per day/hour
- AI resolution rate
- Common questions
- Appointment bookings
- Customer satisfaction

```sql
-- Create view for analytics
CREATE VIEW ai_call_analytics AS
SELECT 
  DATE(started_at) as call_date,
  COUNT(*) as total_calls,
  AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls
FROM ai_dispatcher_call_logs
GROUP BY DATE(started_at);
```

## 🚀 Production Checklist:

- [ ] Deploy ai-assistant-webhook function
- [ ] Configure AI Assistant with webhook URL
- [ ] Add MCP Server to Assistant
- [ ] Set up Supabase MCP (optional)
- [ ] Test with real phone calls
- [ ] Monitor logs and adjust prompts
- [ ] Add error handling
- [ ] Set up analytics dashboard

## 💡 Pro Tips:

1. **Start Simple**: Get basic greeting working first
2. **Add Tools Gradually**: Don't enable all tools at once
3. **Test Edge Cases**: Wrong ticket numbers, invalid dates
4. **Monitor Costs**: Track usage in Telnyx dashboard
5. **Iterate on Prompts**: Refine based on real calls

## 🎉 You're Ready!

Your hybrid system combines:
- **Telnyx AI Assistant** (managed voice)
- **Dynamic Variables** (personalization)
- **MCP Servers** (integrations)
- **Supabase** (database)

This is the most powerful and flexible approach available today!