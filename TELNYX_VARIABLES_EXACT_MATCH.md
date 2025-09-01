# TELNYX VARIABLES - EXACT MATCH GUIDE

## ✅ WEBHOOK RETURNS THESE VARIABLES:
Our webhook (`ai-assistant-webhook`) returns these exact variable names that Telnyx can use with double brackets:

### GREETING VARIABLE (USE IN GREETING FIELD):
```
{{greeting}}
```
**Returns**: "Thank you for calling Nicks appliance repair. I'm Sarah. Which appliance needs our attention today?"

### ALL AVAILABLE VARIABLES FOR INSTRUCTIONS:

| Variable in Webhook | Use in Telnyx | Current Value |
|-------------------|--------------|---------------|
| `greeting` | `{{greeting}}` | "Thank you for calling Nicks appliance repair. I'm Sarah. Which appliance needs our attention today?" |
| `company_name` | `{{company_name}}` | "Nicks appliance repair" |
| `agent_name` | `{{agent_name}}` | "Sarah" |
| `business_niche` | `{{business_niche}}` | "Appliance Repair" |
| `services_offered` | `{{services_offered}}` | "Refrigerator, Washer, Dryer, Dishwasher, and Oven repair" |
| `hours_of_operation` | `{{hours_of_operation}}` | "Monday-Friday 9am-6pm" |
| `additional_info` | `{{additional_info}}` | "Service call $129 • Emergency+$50 • 90-day warranty • Senior discount 10% • Same-day service available" |
| `ai_capabilities` | `{{ai_capabilities}}` | "I can schedule appointments, answer questions..." |
| `agent_personality` | `{{agent_personality}}` | "Be helpful with troubleshooting..." |
| `is_existing_customer` | `{{is_existing_customer}}` | true/false (boolean) |
| `customer_name` | `{{customer_name}}` | "John Smith" (if existing customer) |
| `customer_history` | `{{customer_history}}` | "LG Washer Repair (in_progress)..." |
| `outstanding_balance` | `{{outstanding_balance}}` | 275 (number) |
| `call_transfer_message` | `{{call_transfer_message}}` | "Let me transfer you to a specialist..." |

## 📝 CORRECT TELNYX CONFIGURATION:

### 1. GREETING FIELD:
```
{{greeting}}
```

### 2. INSTRUCTIONS FIELD EXAMPLE:
```
You are {{agent_name}} for {{company_name}}, a {{business_niche}} specialist.

## SERVICES WE OFFER:
{{services_offered}}

## BUSINESS HOURS:
{{hours_of_operation}}

## PRICING & INFORMATION:
{{additional_info}}

## YOUR CAPABILITIES:
{{ai_capabilities}}

## YOUR PERSONALITY:
{{agent_personality}}

## FOR EXISTING CUSTOMERS:
- If {{is_existing_customer}} is true, call them {{customer_name}}
- History: {{customer_history}}
- Balance: ${{outstanding_balance}}

## IF TRANSFER NEEDED:
Say: "{{call_transfer_message}}"
```

## ⚠️ IMPORTANT NOTES:

1. **Use DOUBLE BRACKETS**: Always use `{{variable_name}}` with double brackets in Telnyx
2. **EXACT NAMES**: Use the exact variable names as shown above (case-sensitive)
3. **NO SPACES**: Don't add spaces inside brackets: `{{greeting}}` ✅ not `{{ greeting }}` ❌
4. **WEBHOOK URL**: Must be complete: 
   ```
   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
   ```

## 🧪 TEST THE WEBHOOK:
```powershell
# PowerShell test command
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg"
}
$body = '{
    "data": {
        "event_type": "assistant.initialization",
        "payload": {
            "telnyx_agent_target": "+14375249932",
            "telnyx_end_user_target": "+14165551234"
        }
    }
}'
Invoke-WebRequest -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook" -Method POST -Headers $headers -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

## ✅ WEBHOOK RETURNS ALL THESE VARIABLES CORRECTLY!
