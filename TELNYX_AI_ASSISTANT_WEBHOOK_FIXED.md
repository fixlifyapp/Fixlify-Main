# AI Assistant Webhook - Multi-Tenant Dynamic Variables

## ✅ FIXED & WORKING

### Edge Function: `ai-assistant-webhook`
**URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook`
**Status**: ✅ Active (No JWT verification required)

## 🎯 Purpose
Provides dynamic variables to Telnyx AI Assistants for personalized greetings and conversations. Each phone number gets its own configuration from the database.

## 🏢 Multi-Tenancy Support
- ✅ **Fully Multi-Tenant**: Each user account has their own configuration
- ✅ **Phone-based Lookup**: Configuration is retrieved based on the called phone number
- ✅ **User Isolation**: Each user's data is completely separate

## 📋 How It Works

### 1. Telnyx Calls Webhook
When a call comes in, Telnyx sends:
```json
{
  "data": {
    "payload": {
      "to": "+14375249932",
      "from": "+1234567890",
      "assistant_id": "assistant-xxx"
    }
  }
}
```

### 2. Webhook Looks Up Configuration
```sql
-- Finds phone number owner
SELECT * FROM phone_numbers WHERE phone_number = '+14375249932'
-- Gets their AI configuration
SELECT * FROM ai_dispatcher_configs WHERE phone_number_id = 'xxx'
```

### 3. Returns Personalized Variables
```json
{
  "dynamic_variables": {
    "agent_name": "Sarah",
    "company_name": "kyky",
    "hours_of_operation": "Monday-Friday 9am-6pm",
    "services_offered": "appliancerepair",
    "greeting": "Thank you for calling kyky. How can I help you today?"
  }
}
```

## 🔧 Configuration

### In Telnyx AI Assistant:
1. **Dynamic Variables Webhook URL**: 
   ```
   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
   ```

2. **Greeting Field**:
   ```
   {{greeting}}
   ```

3. **Instructions**:
   ```
   You are {{agent_name}} for {{company_name}}, a professional dispatcher AI assistant.
   ## Business Information
   - Hours: {{hours_of_operation}}
   - Services: {{services_offered}}
   - Phone: {{business_phone}}
   ```

### In Database (per user):
Each user configures through Phone Numbers settings:
- Agent Name
- Company Name
- Hours of Operation
- Services Offered
- Greeting Message
- Agent Personality

## 🔍 Debugging

### Check Webhook Logs:
```sql
SELECT * FROM webhook_logs 
WHERE webhook_name = 'ai-assistant-webhook'
ORDER BY created_at DESC
LIMIT 10;
```

### Test Webhook:
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook \
  -H "Content-Type: application/json" \
  -d '{"data":{"payload":{"to":"+14375249932","from":"+1234567890"}}}'
```

## 📊 Database Schema

### phone_numbers table:
- `id` (uuid) - Primary key
- `phone_number` (text) - The phone number
- `user_id` (uuid) - Owner of the phone number
- `ai_dispatcher_enabled` (boolean)

### ai_dispatcher_configs table:
- `id` (uuid) - Primary key
- `phone_number_id` (uuid) - Foreign key to phone_numbers
- `agent_name` (text)
- `company_name` (text)
- `hours_of_operation` (text)
- `services_offered` (jsonb/text)
- `greeting_message` (text)
- `agent_personality` (text)

## ⚠️ Important Notes

1. **No JWT Required**: The webhook is public (no authentication) so Telnyx can call it
2. **Response Format**: Must wrap variables in `dynamic_variables` object
3. **Timeout**: Must respond within 1 second
4. **Multi-Tenant**: Each phone number gets its own configuration automatically

## 🚀 Deployment

```bash
# Deploy edge function
npx supabase functions deploy ai-assistant-webhook \
  --no-verify-jwt \
  --project-ref mqppvcrlvsgrsqelglod
```

## ✅ Status: PRODUCTION READY
- Working for all users
- Each user gets their own personalized AI assistant
- Tested and verified with Telnyx
