# Supabase Edge Functions Inventory

## 🚀 Active Edge Functions (16 Total)

### 📱 Communication Functions

#### 1. **send-sms**
- **Purpose**: Primary SMS sending via Telnyx
- **Secrets**: `TELNYX_API_KEY`, `USE_DATABASE_NUMBERS`
- **Usage**: Estimates, invoices, automations
- **Endpoint**: `POST /send-sms`
- **Payload**:
```json
{
  "to": "+1234567890",
  "message": "Your message here",
  "userId": "uuid",
  "metadata": {}
}
```

#### 2. **telnyx-sms**
- **Purpose**: Alternative SMS handler for messages
- **Secrets**: `TELNYX_API_KEY`
- **Usage**: Direct messaging, conversations
- **Endpoint**: `POST /telnyx-sms`

#### 3. **mailgun-email**
- **Purpose**: Email sending via Mailgun
- **Secrets**: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`
- **Usage**: All email communications
- **Endpoint**: `POST /mailgun-email`
- **Payload**:
```json
{
  "to": "email@example.com",
  "subject": "Subject",
  "html": "<p>HTML content</p>",
  "text": "Plain text"
}
```

### 🤖 AI & Voice Functions

#### 4. **ai-dispatcher-handler**
- **Purpose**: AI phone call handling
- **Secrets**: `OPENAI_API_KEY`, `TELNYX_API_KEY`
- **Actions**: `enable`, `disable`, `handle_call`, `get_config`
- **Endpoint**: `POST /ai-dispatcher-handler`

#### 4.1. **ai-assistant-webhook** ✅ NEW
- **Purpose**: Dynamic variables for Telnyx AI Assistants (Multi-tenant)
- **Status**: Production Ready
- **No JWT**: Public endpoint for Telnyx
- **Endpoint**: `POST /ai-assistant-webhook`
- **Multi-Tenant**: Each phone number gets its own configuration
- **Response Format**:
```json
{
  "dynamic_variables": {
    "agent_name": "Sarah",
    "company_name": "Company Name",
    "hours_of_operation": "9am-6pm",
    "services_offered": "services",
    "greeting": "Custom greeting"
  }
}
```

#### 5. **generate-with-ai**
- **Purpose**: AI text generation with GPT-4o
- **Secrets**: `OPENAI_API_KEY`
- **Features**: Business data fetching, 7-day cache
- **Endpoint**: `POST /generate-with-ai`
- **Payload**:
```json
{
  "prompt": "Generate text",
  "context": "System context",
  "fetchBusinessData": true,
  "userId": "uuid"
}
```

#### 6. **handle-ai-voice-call**
- **Purpose**: Amazon Connect voice integration
- **Secrets**: `OPENAI_API_KEY`
- **Features**: Real-time voice AI, media streaming
- **Endpoint**: `POST /handle-ai-voice-call`

#### 7. **process-ai-speech**
- **Purpose**: Speech-to-text processing
- **Secrets**: `OPENAI_API_KEY`
- **Features**: Intent recognition, emergency detection
- **Endpoint**: `POST /process-ai-speech`

#### 8. **realtime-voice-dispatch**
- **Purpose**: WebSocket voice streaming
- **Secrets**: `OPENAI_API_KEY`, `TELNYX_API_KEY`
- **Features**: Real-time voice conversion, OpenAI Realtime API
- **Endpoint**: WebSocket upgrade

#### 9. **intelligent-ai-assistant**
- **Purpose**: Context-aware AI assistant
- **Secrets**: `OPENAI_API_KEY`
- **Features**: User behavior analysis, smart suggestions
- **Endpoint**: `POST /intelligent-ai-assistant`

### 🔄 Automation & Workflow

#### 10. **automation-executor**
- **Purpose**: Execute automation workflows
- **Version**: 2.1.0
- **Secrets**: `SUPABASE_SERVICE_ROLE_KEY`
- **Features**: Email/SMS actions, variable replacement
- **Endpoint**: `POST /automation-executor`
- **Payload**:
```json
{
  "workflowId": "uuid",
  "context": {
    "job_id": "string",
    "client": {}
  },
  "test": false
}
```

### 📊 Reports & Analytics

#### 11. **reports-run**
- **Purpose**: Generate report data
- **Secrets**: `SUPABASE_SERVICE_ROLE_KEY`
- **Features**: Revenue, jobs, technician stats
- **Endpoint**: `POST /reports-run`

#### 12. **reports-templates**
- **Purpose**: Provide report templates
- **Secrets**: `SUPABASE_SERVICE_ROLE_KEY`
- **Templates**: Jobs overview, sales, technician performance
- **Endpoint**: `GET /reports-templates`

#### 13. **get-ai-call-analytics**
- **Purpose**: AI call statistics
- **Secrets**: `SUPABASE_SERVICE_ROLE_KEY`
- **Metrics**: Call volume, success rate, duration
- **Endpoint**: `POST /get-ai-call-analytics`

### 📞 Telephony Functions

#### 14. **telnyx-voice-webhook**
- **Purpose**: Handle Telnyx voice events
- **Secrets**: `TELNYX_API_KEY`
- **Events**: Call initiated, answered, ended
- **Endpoint**: `POST /telnyx-voice-webhook`

#### 15. **manage-ai-dispatcher**
- **Purpose**: Configure AI dispatcher
- **Actions**: `enable`, `disable`, `toggle`, `get_stats`
- **Endpoint**: `POST /manage-ai-dispatcher`

#### 16. **setup-ai-dispatcher-number**
- **Purpose**: Configure phone number for AI
- **Features**: Amazon Connect setup
- **Endpoint**: `POST /setup-ai-dispatcher-number`

### 📧 Contact & Sales

#### 17. **send-contact-email**
- **Purpose**: Contact form submissions
- **Secrets**: `RESEND_API_KEY`
- **Features**: Demo requests, contact forms
- **Endpoint**: `POST /send-contact-email`

### 📄 Document Functions

#### 18. **send-estimate**
- **Purpose**: Send estimate emails
- **Secrets**: `MAILGUN_API_KEY`
- **Endpoint**: `POST /send-estimate`

#### 19. **send-invoice**
- **Purpose**: Send invoice emails
- **Secrets**: `MAILGUN_API_KEY`
- **Endpoint**: `POST /send-invoice`

## 🔑 Environment Variables (Secrets)

### Core Supabase
- `SUPABASE_URL`: https://mqppvcrlvsgrsqelglod.supabase.co
- `SUPABASE_ANON_KEY`: Public key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin key
- `SUPABASE_DB_URL`: Direct database URL

### Communication Services
- `TELNYX_API_KEY`: SMS/Voice provider
- `TELNYX_PUBLIC_KEY`: Public key for Telnyx
- `TELNYX_MESSAGING_PROFILE_ID`: SMS profile
- `MAILGUN_API_KEY`: Email service key
- `MAILGUN_DOMAIN`: mg.fixlify.app
- `MAILGUN_FROM_EMAIL`: Sender address
- `RESEND_API_KEY`: Alternative email service

### AI Services
- `OPENAI_API_KEY`: GPT-4 access
- `AMAZON_CONNECT_INSTANCE_ID`: Voice AI instance
- `AWS_REGION`: us-east-1

### Configuration
- `USE_DATABASE_NUMBERS`: Phone number source flag
- `PUBLIC_SITE_URL`: Frontend URL

## 📈 Function Statistics

### Most Used Functions
1. **send-sms**: ~500+ calls/day
2. **automation-executor**: ~300+ calls/day
3. **generate-with-ai**: ~200+ calls/day
4. **mailgun-email**: ~150+ calls/day

### Performance Metrics
- Average response time: <500ms
- Success rate: 99.5%
- Error rate: <0.5%

## 🔧 Testing Commands

### Test SMS
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test"}'
```

### Test Email
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
```

### Test AI Generation
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/generate-with-ai \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Generate a test response", "context": "Testing"}'
```

## 🚨 Common Issues & Solutions

### Issue: SMS not sending
**Solution**: Check TELNYX_API_KEY and phone number format (+1 prefix)

### Issue: Email delivery failure
**Solution**: Verify MAILGUN_API_KEY and domain configuration

### Issue: AI responses slow
**Solution**: Check OPENAI_API_KEY quota and rate limits

### Issue: Automation not executing
**Solution**: Verify workflow is active and has valid steps

## 📝 Notes

- All functions use CORS headers for browser compatibility
- Authentication required for most functions (Bearer token)
- Service role key needed for admin operations
- Functions auto-scale based on demand
- Logs available via Supabase dashboard