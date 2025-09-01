# FIXLIFY PROJECT KNOWLEDGE

## PROJECT STRUCTURE
- **Location**: C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
- **Framework**: Next.js + Supabase
- **Database**: Supabase PostgreSQL
- **Edge Functions**: Multiple for AI, telephony, and automation

## AI DISPATCHER SYSTEM ✅ COMPLETE

### WEBHOOK URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

### FEATURES IMPLEMENTED:
1. **Dynamic Variables** - All company settings returned as variables
2. **Customer Lookup** - Automatically identifies existing customers by phone
3. **Job History** - Shows customer's recent repair history
4. **Outstanding Balance** - Calculates unpaid invoices
5. **Multi-tenant Support** - Each phone number has its own configuration

### VARIABLES SUPPORTED:

#### Company Variables:
- `{{company_name}}` - Business name
- `{{agent_name}}` - AI agent name
- `{{business_niche}}` - Type of business
- `{{services_offered}}` - List of services
- `{{hours_of_operation}}` - Business hours
- `{{additional_info}}` - Pricing and policies
- `{{ai_capabilities}}` - What AI can do
- `{{agent_personality}}` - Personality traits
- `{{greeting_message}}` / `{{greeting}}` - Initial greeting

#### Customer Variables:
- `{{is_existing_customer}}` - Boolean (true/false)
- `{{customer_name}}` - Customer's full name
- `{{customer_history}}` - Recent jobs/repairs
- `{{outstanding_balance}}` - Unpaid invoice total
- `{{call_transfer_message}}` - Transfer message

### TELNYX INSTRUCTIONS TEMPLATE:
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
- Balance: {{outstanding_balance}}
## IF TRANSFER NEEDED:
Say: "{{call_transfer_message}}"
```

### DATABASE TABLES

#### ai_dispatcher_configs
- Stores AI configuration for each phone number
- Key fields: company_name, agent_name, greeting_message, services_offered, additional_info
- Linked to phone_numbers table via phone_number_id

#### phone_numbers
- Stores purchased phone numbers
- Links to ai_dispatcher_configs via phone_number_id

#### clients
- Customer database with phone numbers
- Used for existing customer lookup

#### jobs
- Customer job history
- Used to show repair history

#### invoices
- Customer invoices
- Used to calculate outstanding balance

#### webhook_logs
- Stores all webhook calls and responses
- Useful for debugging

## EDGE FUNCTIONS

### ai-assistant-webhook (MAIN WEBHOOK) ✅
- URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
- Returns ALL variables including customer data
- Performs customer lookup by phone
- Calculates outstanding balances
- Logs all webhook calls

### Other Edge Functions:
- generate-with-ai
- automation-executor
- reports-run
- intelligent-ai-assistant
- send-sms
- mailgun-email

## TEST DATA
- **Test Customer**: John Smith - (416) 555-1234
- **Test Jobs**: Samsung Refrigerator (completed), LG Washer (in_progress)
- **Test Invoice**: $275 unpaid

## TEST WEBHOOK COMMAND:
```powershell
$headers = @{"Content-Type" = "application/json"; "Authorization" = "Bearer YOUR_ANON_KEY"}
$body = '{"data":{"event_type":"assistant.initialization","payload":{"telnyx_agent_target":"+14375249932","telnyx_end_user_target":"+14165551234"}}}'
$response = Invoke-WebRequest -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook" -Method POST -Headers $headers -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## KEY FILES
- `/src/components/AIDispatcherConfiguration.tsx` - UI for AI config
- Edge Function: `ai-assistant-webhook` - Main webhook handler

## PHONE NUMBER
- Main: +1 (437) 524-9932
- Configured for Telnyx AI Dispatcher

## LAST UPDATED
- Date: 2025-08-22
- Status: ✅ FULLY FUNCTIONAL
- Features:
  - ✅ Dynamic variables working
  - ✅ Customer lookup working
  - ✅ Job history working
  - ✅ Outstanding balance calculation working
  - ✅ Multi-tenant support
  - ✅ Rate limiting + validation + logging
- **Note**: JWT verification enabled (use Authorization header)


## PHONE CALL CONVERSATIONS IN JOB HISTORY ✅

### FEATURES:
- **Conversation Storage** - All phone calls are saved with summaries
- **Job History Integration** - Conversations appear in job history
- **Filter Support** - New "Conversations" filter in history dropdown
- **Rich Details** - Shows call duration, sentiment, action items
- **Real-time Updates** - Auto-refreshes when new calls complete

### DATABASE:
- **Table**: `call_conversations`
- **Fields**: 
  - Call details (duration, direction, status)
  - AI-generated summary and transcript
  - Sentiment analysis
  - Topics and action items
  - Links to job/client

### WEBHOOK:
- **URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/call-summary-webhook`
- **Purpose**: Receives call summaries from Telnyx
- **Events**: `call.ended`, `assistant.call_ended`, `assistant.transcription`

### UI COMPONENTS:
- **JobHistory Component** - Updated to show conversations
- **Filter Options**: All Items, Payments, Documents, Status Changes, **Conversations**
- **Display**: Shows summary, action items, duration, sentiment

### SERVICE:
- **File**: `/src/services/callConversationService.ts`
- **Methods**:
  - createConversation
  - getJobConversations
  - getClientConversations
  - searchConversations
  - getConversationStats

### TEST DATA:
- Two test conversations added for John Smith
- Shows in job history with phone icon
- Includes full transcript and action items

### TELNYX INTEGRATION:
Configure Telnyx to send webhooks to:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/call-summary-webhook
```
Events to enable:
- `assistant.call_ended`
- `assistant.transcription`
- `call.ended`

### HOW IT WORKS:
1. Call ends on Telnyx
2. Telnyx sends summary to webhook
3. Webhook saves to `call_conversations` table
4. Appears in job history automatically
5. Users can filter to see only conversations

### LAST UPDATED: 2025-08-22
- ✅ Conversations table created
- ✅ JobHistory component updated
- ✅ Filter dropdown includes Conversations
- ✅ Webhook deployed
- ✅ Test data added
- ✅ Service created

## TELNYX AI ASSISTANT WEBHOOK - DYNAMIC VARIABLES
### FIXED: 2025-08-22

### WEBHOOK URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

### WITH API KEY (for Telnyx):
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg
```

### THE FIX:
Telnyx requires the webhook response to be wrapped in `dynamic_variables` object:

**CORRECT FORMAT (what we return now):**
```json
{
  "dynamic_variables": {
    "greeting": "Thank you for calling...",
    "company_name": "Nicks appliance repair",
    "agent_name": "Sarah",
    ...
  }
}
```

**WRONG FORMAT (what we returned before):**
```json
{
  "greeting": "Thank you for calling...",
  "company_name": "Nicks appliance repair",
  ...
}
```

### WEBHOOK FEATURES:
- Returns personalized greeting based on phone number
- Looks up company config from database
- Checks if caller is existing customer
- Gets customer history and outstanding balance
- All variables properly wrapped in `dynamic_variables` object

### VARIABLES AVAILABLE:
- `{{greeting}}` - Full personalized greeting
- `{{company_name}}` - Company name from config
- `{{agent_name}}` - AI agent name
- `{{business_niche}}` - Type of business
- `{{services_offered}}` - List of services
- `{{hours_of_operation}}` - Business hours
- `{{additional_info}}` - Pricing and other info
- `{{ai_capabilities}}` - What the AI can do
- `{{agent_personality}}` - How the AI should behave
- `{{is_existing_customer}}` - true/false
- `{{customer_name}}` - Name if existing customer
- `{{customer_history}}` - Recent jobs/services
- `{{outstanding_balance}}` - Amount owed
- `{{call_transfer_message}}` - Message for transfers

### HOW IT WORKS:
1. Telnyx calls webhook at start of call
2. Webhook receives phone numbers
3. Looks up config in database
4. Returns variables wrapped in `dynamic_variables`
5. Telnyx replaces {{variables}} with actual values

### TEST COMMAND:
```powershell
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
Invoke-WebRequest -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook" -Method POST -Headers $headers -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### FIXED ISSUES:
- ✅ Webhook now returns correct format for Telnyx
- ✅ Variables properly wrapped in `dynamic_variables` object
- ✅ All variables are strings (not booleans/numbers)
- ✅ Handles existing customer lookup
- ✅ Processes greeting template with variable replacement

## AI DISPATCHER CUSTOMER RECOGNITION FIX - 2025-01-29

### ISSUE FIXED:
- AI voice dispatcher was not recognizing existing customers by phone number
- Customer name was not being used in greetings  
- Conversation history and payment balance were not being retrieved

### SOLUTION IMPLEMENTED:
- Enhanced phone number matching with multiple format variants
- Improved customer lookup logic to handle different phone formats
- Added personalized greetings for existing customers
- Integrated conversation history from call_conversations table
- Added outstanding balance calculation from invoices
- Enhanced logging for debugging

### KEY IMPROVEMENTS:
1. **Phone Number Matching**:
   - Cleans phone numbers (removes non-digits)
   - Searches multiple formats: full number, last 10 digits, with/without country code
   - Handles formats like +14165551234, 14165551234, 4165551234, 5551234

2. **Customer Recognition**:
   - Searches clients table by phone number variants
   - Builds customer name from name, first_name, last_name fields
   - Falls back to "Valued Customer" if name not available

3. **Personalized Greeting**:
   - For existing customers: "Thank you for calling [Company], [Name]! I'm [Agent], and it's great to have you back."
   - Mentions service history if available
   - Includes outstanding balance reminder if applicable

4. **Data Retrieved**:
   - Recent jobs/services (last 5)
   - Outstanding invoices (pending, overdue, partially_paid)
   - Previous call conversations (last 3)
   - Customer details (name, email, phone, status)

### VARIABLES RETURNED:
```javascript
{
  dynamic_variables: {
    // Customer-specific
    is_existing_customer: "true" or "false",
    customer_name: "John Smith",
    customer_history: "Recent services: Refrigerator repair - completed (1/15/2025)",
    outstanding_balance: "$275.00",
    conversation_history: "Previous calls summary",
    
    // Company info
    company_name: "Nicks appliance repair",
    agent_name: "Sarah",
    // ... other config variables
  }
}
```

### TESTING:
- Existing customers should be greeted by name
- Service history should be mentioned if available
- Outstanding balances should be mentioned
- New customers get standard greeting

### WEBHOOK URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

### LAST UPDATED: 2025-01-29
- ✅ Customer recognition working
- ✅ Personalized greetings active
- ✅ Service history integration
- ✅ Payment balance tracking
- ✅ Conversation history support
