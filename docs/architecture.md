# Fixlify - Technical Architecture

## System Architecture

### High-Level Overview

```
                           ┌──────────────────────────────┐
                           │      Vercel (Frontend)       │
                           │    React SPA + PWA Assets    │
                           └──────────────┬───────────────┘
                                          │
                                    HTTPS/WSS
                                          │
                           ┌──────────────▼───────────────┐
                           │     Supabase Platform        │
    ┌──────────────────────┴──────────────────────────────┴─────────────────────┐
    │                                                                            │
    │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │
    │  │   PostgreSQL   │  │ Edge Functions │  │   Realtime     │               │
    │  │   Database     │◄─┤    (Deno)      │  │   WebSockets   │               │
    │  │   + RLS        │  │   47 APIs      │  │                │               │
    │  └────────────────┘  └───────┬────────┘  └────────────────┘               │
    │                              │                                             │
    │  ┌────────────────┐  ┌───────▼────────┐  ┌────────────────┐               │
    │  │  Supabase Auth │  │    Storage     │  │  Database      │               │
    │  │  + OAuth       │  │    Buckets     │  │  Triggers      │               │
    │  └────────────────┘  └────────────────┘  └────────────────┘               │
    │                                                                            │
    └────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
           ┌────────▼────────┐  ┌─────────▼────────┐  ┌────────▼────────┐
           │     Telnyx      │  │     Mailgun      │  │     OpenAI      │
           │  VoIP/SMS/Voice │  │    Email API     │  │    GPT-4 API    │
           └─────────────────┘  └──────────────────┘  └─────────────────┘
```

## Frontend Architecture

### React Application Structure

```
src/
├── App.tsx                    # Main routing & providers
├── main.tsx                   # Application entry point
├── providers.tsx              # Re-exported AppProviders
│
├── pages/                     # 51 Page Components
│   ├── Dashboard.tsx          # Main dashboard
│   ├── JobsPageOptimized.tsx  # Jobs management
│   ├── ClientDetailPageV2.tsx # Client details
│   ├── SchedulePage.tsx       # Calendar/scheduling
│   ├── ConnectPage.tsx        # Communications hub
│   ├── AiCenterPage.tsx       # AI features
│   ├── AutomationsPage.tsx    # Workflow automation
│   └── ...                    # Other pages
│
├── components/                # Reusable UI Components
│   ├── ui/                    # shadcn/ui primitives
│   ├── jobs/                  # Job-specific components
│   ├── clients/               # Client management
│   ├── automations/           # Automation builder
│   ├── connect/               # Communications
│   ├── calling/               # VoIP/calling
│   ├── analytics/             # Charts/metrics
│   └── layout/                # App layout
│
├── hooks/                     # 68+ Custom React Hooks
│   ├── use-auth.tsx           # Authentication
│   ├── useJobsOptimized.ts    # Job data fetching
│   ├── useClientsOptimized.ts # Client data
│   ├── useRealtime.ts         # WebSocket subscriptions
│   └── ...
│
├── services/                  # Business Logic Layer
│   ├── automationService.ts   # Automation engine
│   └── communications/        # SMS/Email services
│
├── integrations/              # External API Clients
│   └── supabase/              # Supabase client + types
│
├── types/                     # TypeScript Definitions
└── utils/                     # Helper Functions
```

### State Management Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Query (TanStack)                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  Server State │  │  Cache Layer  │  │  Background   │       │
│  │   Fetching    │  │  (staleTime)  │  │  Refetching   │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                     React Context Providers                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  AuthProvider │  │  AppProviders │  │ TooltipProvider│       │
│  │  (Auth State) │  │(Multi-context)│  │   (UI State)  │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                     Supabase Realtime                           │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  WebSocket Subscriptions → Automatic Cache Invalidation│     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Page Component
    │
    ├── Layout Components (AppSidebar, Header)
    │
    ├── Feature Components
    │   ├── Data Fetching (useQuery hooks)
    │   ├── Business Logic (services)
    │   └── UI Presentation (shadcn/ui)
    │
    └── Shared UI Components
        ├── Button, Card, Dialog
        ├── Form, Input, Select
        └── Table, Badge, Toast
```

## Backend Architecture

### Edge Functions (47 APIs)

| Category | Functions | Description |
|----------|-----------|-------------|
| **AI/LLM** | ai-actions, ai-client-lookup, ai-dispatcher-handler, ai-workflow-assistant, generate-ai-message, create-ai-assistant | AI-powered features |
| **Automation** | automation-executor, automation-scheduler, process-automation-queue, process-scheduled-automations, automation-ai-assistant | Workflow automation |
| **SMS** | telnyx-sms, sms-webhook, send-estimate-sms, send-invoice-sms | SMS messaging |
| **Email** | mailgun-email, email-webhook, send-email, send-estimate, send-invoice | Email delivery |
| **Voice/Calls** | telnyx-make-call, telnyx-call-control, telnyx-call-recording, telnyx-voice-webhook, telnyx-webrtc-call | VoIP functionality |
| **Phone Management** | telnyx-phone-search, telnyx-phone-purchase, telnyx-phone-numbers, manage-phone-numbers | Phone number provisioning |
| **Utilities** | check-api-keys, check-email-config, get-telnyx-token | Configuration/health |

### Database Schema (Key Tables)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │     clients     │       │      jobs       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (FK→auth)    │       │ id              │       │ id              │
│ business_id     │◄──────┤ business_id     │◄──────┤ business_id     │
│ role            │       │ name            │       │ client_id (FK)  │
│ full_name       │       │ email           │       │ status          │
│ permissions     │       │ phone           │       │ scheduled_date  │
└─────────────────┘       │ type            │       │ description     │
                          └─────────────────┘       │ revenue         │
                                   │                └─────────────────┘
                                   │
                          ┌────────▼────────┐
                          │client_properties│
                          ├─────────────────┤
                          │ id              │
                          │ client_id (FK)  │
                          │ address         │
                          │ is_primary      │
                          │ tenant_name     │
                          │ tenant_phone    │
                          └─────────────────┘
```

### Security Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     Row Level Security (RLS)                   │
├───────────────────────────────────────────────────────────────┤
│  All tables protected by business_id scoping                  │
│  Users can only access data within their organization         │
│  RBAC policies enforce role-based permissions                 │
└───────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                     Supabase Auth                              │
├───────────────────────────────────────────────────────────────┤
│  • Email/Password authentication                               │
│  • Google OAuth integration                                    │
│  • JWT tokens with refresh                                     │
│  • Session management                                          │
└───────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                     Edge Function Auth                         │
├───────────────────────────────────────────────────────────────┤
│  • Bearer token validation                                     │
│  • API key authentication for external services                │
│  • CORS configuration                                          │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### Job Creation Flow

```
1. User creates job in UI
   │
2. ├─► React Hook Form validates with Zod
   │
3. ├─► useMutation calls Supabase
   │
4. ├─► RLS validates business_id
   │
5. ├─► Database trigger fires
   │     ├─► Creates job history entry
   │     └─► Queues automation check
   │
6. ├─► Realtime broadcasts INSERT
   │
7. └─► React Query cache invalidates
       └─► UI updates automatically
```

### Automation Execution Flow

```
Trigger Event (job status change)
         │
         ▼
┌─────────────────────────────────┐
│   automation-executor (Edge)    │
├─────────────────────────────────┤
│ 1. Match trigger conditions      │
│ 2. Evaluate timing rules         │
│ 3. Execute action chain          │
└───────────────┬─────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌───────┐  ┌───────┐  ┌───────┐
│ SMS   │  │ Email │  │  AI   │
│Action │  │Action │  │Action │
└───────┘  └───────┘  └───────┘
```

### Real-time Communication Flow

```
┌─────────────┐    WebSocket    ┌─────────────┐
│   Browser   │◄───────────────►│  Supabase   │
│   Client    │                 │  Realtime   │
└─────────────┘                 └─────────────┘
      │                               │
      │ Subscribe to channels:        │
      │ • jobs:business_id           │
      │ • clients:business_id        │
      │ • messages:*                 │
      │                               │
      └───────────────────────────────┘
```

## Integration Architecture

### Telnyx Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                        Telnyx Services                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   SMS API    │  │  Voice API   │  │  WebRTC API  │           │
│  │  (Messaging) │  │  (AI Voice)  │  │(Browser Calls)│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  Features:                                                       │
│  • Phone number provisioning (+14375249932)                     │
│  • Inbound/outbound SMS                                          │
│  • AI Voice Dispatcher                                           │
│  • Call recording & transcription                               │
│  • Conference calling                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mailgun Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                       Mailgun Services                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Domain: mg.fixlify.app                                         │
│                                                                  │
│  Features:                                                       │
│  • Transactional emails (invoices, estimates)                   │
│  • Template-based messaging                                      │
│  • Webhook delivery tracking                                     │
│  • Email analytics                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel                                  │
├─────────────────────────────────────────────────────────────────┤
│  • Automatic deployments from main branch                       │
│  • Preview deployments for PRs                                  │
│  • Edge network CDN                                             │
│  • Environment variables management                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                             │
├─────────────────────────────────────────────────────────────────┤
│  Project: mqppvcrlvsgrsqelglod                                  │
│  Region: (Configured region)                                    │
│                                                                  │
│  • PostgreSQL 15 database                                       │
│  • Edge Functions (Deno runtime)                                │
│  • Realtime server                                              │
│  • Storage buckets                                              │
│  • Auth service                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

| Variable | Purpose | Location |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase API endpoint | `.env` |
| `VITE_SUPABASE_ANON_KEY` | Public API key | `.env` |
| `TELNYX_API_KEY` | Telnyx authentication | Supabase Secrets |
| `MAILGUN_API_KEY` | Mailgun authentication | Supabase Secrets |
| `OPENAI_API_KEY` | OpenAI API access | Supabase Secrets |

## Performance Considerations

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Query Cache                            │
├─────────────────────────────────────────────────────────────────┤
│  staleTime: 10 minutes (data considered fresh)                  │
│  gcTime: 20 minutes (cache garbage collection)                  │
│  refetchOnWindowFocus: disabled                                 │
│  refetchOnReconnect: disabled                                   │
│  Background refetch: disabled (Realtime handles updates)        │
└─────────────────────────────────────────────────────────────────┘
```

### Optimization Techniques

1. **Code Splitting**: Route-based lazy loading
2. **Component Optimization**: React.memo for expensive renders
3. **Query Optimization**: Selective column fetching
4. **Image Optimization**: Supabase Storage with transformations
5. **PWA**: Service worker caching for offline support

## Related Documentation

- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide.md)
