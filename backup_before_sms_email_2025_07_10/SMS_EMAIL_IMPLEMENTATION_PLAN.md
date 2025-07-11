# 📋 COMPLETE SMS/EMAIL IMPLEMENTATION PLAN
## For Fixlify Application - July 2025

## 🎯 OVERVIEW
Complete implementation of SMS (Telnyx) and Email (Mailgun) functionality with proper architecture, error handling, and scalability.

## 📊 WHAT I NEED FROM YOU:

### 1. **API Keys & Credentials**
- [ ] **Telnyx API Key** (from https://portal.telnyx.com)
- [ ] **Telnyx Phone Number ID** (your purchased number)
- [ ] **Telnyx Messaging Profile ID** (optional but recommended)
- [ ] **Mailgun API Key** (from https://app.mailgun.com)
- [ ] **Mailgun Domain** (e.g., mg.yourdomain.com)
- [ ] **Your Profile/User ID** (for testing)

### 2. **Business Information**
- [ ] Company name for emails
- [ ] Default "from" email address
- [ ] Default "from" name
- [ ] Support email address
- [ ] Business phone number (for SMS replies)

---

## 🏗️ IMPLEMENTATION PHASES

### PHASE 1: Database Schema Setup
**Priority: CRITICAL - Do this first!**

#### 1.1 Create Core Tables
```sql
-- Communication logs table (unified for both SMS/Email)
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  client_id TEXT REFERENCES clients(id),
  job_id TEXT REFERENCES jobs(id),
  type TEXT CHECK (type IN ('sms', 'email')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'pending',
  recipient TEXT NOT NULL,
  sender TEXT,
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Message templates
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('sms', 'email')),
  category TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email-specific tables
CREATE TABLE email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  mailgun_domain TEXT,
  from_email TEXT,
  from_name TEXT,
  reply_to_email TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS-specific tables
CREATE TABLE sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  telnyx_phone_number TEXT,
  telnyx_messaging_profile_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE communication_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT CHECK (provider IN ('telnyx', 'mailgun')),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.2 Create RLS Policies
```sql
-- Enable RLS
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can view own communication logs" ON communication_logs
  FOR SELECT USING (auth.uid() = user_id);
  
-- Add more policies as needed...
```

---

### PHASE 2: Edge Functions Implementation
**Create these one by one, test each before moving to next**

#### 2.1 Core Email Function (mailgun-send)
```typescript
// Simple, focused function for sending emails via Mailgun
// Handles authentication, validation, and error handling
// Returns clear success/error responses
```

#### 2.2 Core SMS Function (telnyx-send)
```typescript
// Simple, focused function for sending SMS via Telnyx
// Handles phone number formatting, validation
// Returns clear success/error responses
```

#### 2.3 Webhook Handlers
- `mailgun-webhook` - Handle delivery status, opens, clicks
- `telnyx-webhook` - Handle SMS status updates

#### 2.4 Document Send Functions
- `send-estimate` - Orchestrates estimate sending
- `send-invoice` - Orchestrates invoice sending

---

### PHASE 3: Frontend Services & Hooks

#### 3.1 Core Services
```typescript
// src/services/communication-service.ts
export class CommunicationService {
  async sendEmail(data: EmailData)
  async sendSMS(data: SMSData)
  async getHistory(filters: Filters)
}
```

#### 3.2 React Hooks
```typescript
// src/hooks/useDocumentSending.ts
export const useDocumentSending = () => {
  const sendDocument = async (type, documentId, method, recipient)
  const isLoading
  const error
  return { sendDocument, isLoading, error }
}
```

#### 3.3 UI Components
- SendButton component (handles both SMS/Email)
- CommunicationHistory component
- MessageTemplates component

---

### PHASE 4: Integration Points

#### 4.1 Estimate/Invoice Pages
- Add send buttons with method selection
- Show communication history
- Handle loading/error states

#### 4.2 Client Communication
- Unified messaging interface
- Template selection
- Delivery tracking

---

## 🚀 DEPLOYMENT SEQUENCE

### Step 1: Environment Setup
```bash
# Add to Supabase secrets
TELNYX_API_KEY=your_key
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_MESSAGING_PROFILE_ID=your_profile_id
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
MAILGUN_FROM_NAME="Your Company"
```

### Step 2: Database Migration
1. Run schema creation SQL
2. Create RLS policies
3. Add initial templates

### Step 3: Deploy Edge Functions (in order)
1. `mailgun-send` - Test with simple email
2. `telnyx-send` - Test with simple SMS
3. `mailgun-webhook` - Set up webhook URL in Mailgun
4. `telnyx-webhook` - Set up webhook URL in Telnyx
5. `send-estimate` - Test full estimate flow
6. `send-invoice` - Test full invoice flow

### Step 4: Frontend Deployment
1. Update services
2. Update hooks
3. Update components
4. Test end-to-end

---

## 🧪 TESTING CHECKLIST

### Email Testing
- [ ] Send test email
- [ ] Verify delivery
- [ ] Check webhook updates
- [ ] Test templates
- [ ] Test attachments (PDFs)

### SMS Testing
- [ ] Send test SMS
- [ ] Verify delivery
- [ ] Check webhook updates
- [ ] Test templates
- [ ] Test phone formatting

### Integration Testing
- [ ] Send estimate via email
- [ ] Send estimate via SMS
- [ ] Send invoice via email
- [ ] Send invoice via SMS
- [ ] Check history displays correctly

---

## 🔧 ERROR HANDLING

### Common Issues to Handle:
1. Invalid API credentials
2. Rate limiting
3. Invalid phone numbers
4. Invalid email addresses
5. Network timeouts
6. Webhook failures
7. PDF generation errors

### Monitoring Setup:
1. Log all communications
2. Track delivery rates
3. Monitor webhook health
4. Alert on failures

---

## 📈 OPTIMIZATION OPPORTUNITIES

### Future Enhancements:
1. Bulk sending
2. Scheduled sending
3. Email tracking pixels
4. SMS link tracking
5. A/B testing
6. Analytics dashboard
7. Multi-language templates

---

## 🎯 SUCCESS CRITERIA

### The implementation is complete when:
1. ✅ Users can send estimates/invoices via email
2. ✅ Users can send estimates/invoices via SMS
3. ✅ All sends are logged with status
4. ✅ Webhooks update delivery status
5. ✅ Error handling shows user-friendly messages
6. ✅ Templates can be customized
7. ✅ History is viewable and searchable

---

## 📝 NOTES

- Start with email (simpler to test)
- Use development/sandbox environments first
- Keep functions small and focused
- Log everything for debugging
- Test error scenarios thoroughly
- Document API responses
