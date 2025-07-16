# 🚀 Fixlify Clean API Implementation Plan

## Overview
Complete removal of Supabase Edge Functions and implementation of a clean, modern API architecture.

## Current State (After Cleanup)
- ✅ All local edge functions removed
- ✅ No SMS/Email edge functions
- ✅ Clean slate for new implementation

## New Architecture Plan

### 1. **API Structure Options**

#### Option A: Node.js/Express Backend
```
fixlify-api/
├── src/
│   ├── controllers/
│   │   ├── sms.controller.ts
│   │   ├── email.controller.ts
│   │   ├── automation.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── telnyx.service.ts
│   │   ├── mailgun.service.ts
│   │   └── openai.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── routes/
│   │   └── index.ts
│   └── server.ts
├── .env
└── package.json
```

#### Option B: Next.js API Routes
```
fixlify-main/
├── app/
│   └── api/
│       ├── sms/
│       │   └── route.ts
│       ├── email/
│       │   └── route.ts
│       ├── automation/
│       │   └── route.ts
│       └── ai/
│           └── route.ts
```

#### Option C: Serverless Functions (Vercel/Netlify)
```
fixlify-main/
├── api/
│   ├── sms.ts
│   ├── email.ts
│   ├── automation.ts
│   └── ai.ts
```

### 2. **Core API Endpoints**

#### SMS Service
```typescript
POST /api/sms/send
{
  "to": "+1234567890",
  "message": "Your message here",
  "clientId": "uuid",
  "jobId": "uuid"
}

GET /api/sms/history
GET /api/sms/status/:messageId
```

#### Email Service
```typescript
POST /api/email/send
{
  "to": "client@example.com",
  "subject": "Subject",
  "html": "<html>content</html>",
  "text": "plain text",
  "type": "invoice" | "estimate" | "general"
}

POST /api/email/send-invoice
{
  "invoiceId": "uuid",
  "recipientEmail": "client@example.com"
}

POST /api/email/send-estimate
{
  "estimateId": "uuid",
  "recipientEmail": "client@example.com"
}
```

#### Automation Service
```typescript
POST /api/automation/trigger
{
  "workflowId": "uuid",
  "entityId": "uuid",
  "entityType": "job" | "client",
  "context": {}
}

GET /api/automation/workflows
POST /api/automation/workflows
PUT /api/automation/workflows/:id
DELETE /api/automation/workflows/:id
```

### 3. **Implementation Steps**

#### Phase 1: Basic Setup (Week 1)
1. Choose architecture (A, B, or C)
2. Set up project structure
3. Configure environment variables
4. Set up authentication middleware
5. Create base service classes

#### Phase 2: Core Services (Week 2)
1. Implement Telnyx SMS service
2. Implement Mailgun email service
3. Add error handling and logging
4. Create unit tests

#### Phase 3: Business Logic (Week 3)
1. Invoice/Estimate email templates
2. SMS formatting and validation
3. Portal link generation
4. Communication logging

#### Phase 4: Automation & AI (Week 4)
1. Automation workflow engine
2. OpenAI integration
3. Scheduled tasks
4. Event triggers

### 4. **Technology Stack**

#### Backend
- **Runtime**: Node.js 20+ or Deno
- **Framework**: Express.js, Fastify, or Next.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT

#### External Services
- **SMS**: Telnyx API
- **Email**: Mailgun API
- **AI**: OpenAI API
- **Hosting**: Vercel, Railway, or Render

### 5. **Environment Variables**

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Telnyx
TELNYX_API_KEY=your_telnyx_key
TELNYX_PUBLIC_KEY=your_public_key
TELNYX_MESSAGING_PROFILE_ID=your_profile_id

# Mailgun
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=fixlify.app

# OpenAI
OPENAI_API_KEY=your_openai_key

# App
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8080
```

### 6. **Migration Strategy**

1. **Update Frontend Services**
   - Replace edge function calls with API calls
   - Update authentication headers
   - Handle new response formats

2. **Database Updates**
   - Keep existing tables
   - Add API request logging
   - Update webhooks to point to new API

3. **Testing Plan**
   - Unit tests for each service
   - Integration tests for workflows
   - End-to-end testing

### 7. **Benefits of New Architecture**

✅ **Better Developer Experience**
- Local development without Supabase CLI
- Standard debugging tools
- Faster iteration

✅ **More Control**
- Custom error handling
- Advanced logging
- Performance optimization

✅ **Scalability**
- Horizontal scaling
- Load balancing
- Caching strategies

✅ **Flexibility**
- Easy to add new services
- Version control
- CI/CD integration

## Next Steps

1. **Choose Architecture** (A, B, or C)
2. **Create Repository** for API
3. **Set Up Development Environment**
4. **Start with SMS Service** (simplest)
5. **Add Email Service**
6. **Migrate Frontend** gradually

## Questions to Answer

1. Which architecture option do you prefer?
2. Do you want a separate API repository or integrate with existing?
3. What's your preferred hosting platform?
4. Any specific requirements for the API?

---

This plan provides a clean, modern approach to replace edge functions with a proper API that you have full control over.