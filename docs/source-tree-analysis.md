# Fixlify - Source Tree Analysis

## Directory Structure Overview

```
Fixlify MAIN WEB/
│
├── .bmad/                      # BMAD Method configuration
│   ├── bmm/                    # BMad Method Module
│   │   ├── agents/             # AI agent personas
│   │   ├── docs/               # BMAD documentation
│   │   ├── knowledge/          # Knowledge base
│   │   ├── tasks/              # Reusable tasks
│   │   ├── templates/          # Document templates
│   │   └── workflows/          # Development workflows
│   └── core/                   # BMAD Core engine
│
├── docs/                       # Project documentation
│   ├── project-overview.md     # Executive summary
│   ├── architecture.md         # Technical architecture
│   ├── source-tree-analysis.md # This file
│   └── development-guide.md    # Setup instructions
│
├── public/                     # Static assets
│   ├── lovable-uploads/        # Uploaded images
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
│
├── src/                        # Application source code
│   ├── components/             # React components (100+)
│   ├── pages/                  # Page components (51)
│   ├── hooks/                  # Custom hooks (68+)
│   ├── services/               # Business logic
│   ├── integrations/           # External APIs
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Helper functions
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utility libraries
│   └── templates/              # Email/document templates
│
├── supabase/                   # Backend configuration
│   ├── functions/              # Edge Functions (47)
│   └── migrations/             # Database migrations
│
└── Configuration Files
    ├── package.json            # Dependencies
    ├── vite.config.ts          # Vite configuration
    ├── tailwind.config.ts      # Tailwind CSS
    ├── tsconfig.json           # TypeScript config
    └── .env                    # Environment variables
```

## Source Code Analysis

### `/src/pages/` - Page Components (51 files)

| File | Route | Description |
|------|-------|-------------|
| `Dashboard.tsx` | `/dashboard` | Main business dashboard |
| `JobsPageOptimized.tsx` | `/jobs` | Job management with filtering |
| `JobDetailsPage.tsx` | `/jobs/:jobId` | Individual job details |
| `ClientsPage.tsx` | `/clients` | Client listing and management |
| `ClientDetailPageV2.tsx` | `/clients/:clientId` | Client profile with properties |
| `SchedulePage.tsx` | `/schedule` | Calendar and scheduling |
| `FinancePage.tsx` | `/finance` | Financial overview |
| `EstimatesPage.tsx` | `/estimates` | Estimate management |
| `InvoicesPage.tsx` | `/invoices` | Invoice management |
| `ConnectPage.tsx` | `/connect` | Communications hub |
| `AiCenterPage.tsx` | `/ai-center` | AI features center |
| `AutomationsPage.tsx` | `/automations` | Workflow automation |
| `AnalyticsPage.tsx` | `/analytics` | Business analytics |
| `ReportsPage.tsx` | `/reports` | Report generation |
| `TeamManagementPage.tsx` | `/team` | Team member management |
| `TasksPage.tsx` | `/tasks` | Task tracking |
| `SettingsPage.tsx` | `/settings` | Application settings |
| `AuthPage.tsx` | `/auth` | Authentication |
| `UniversalPortal.tsx` | `/portal/:token` | Client-facing portal |

### `/src/components/` - Component Categories

```
components/
├── ui/                         # shadcn/ui primitives (50+)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── toast.tsx
│   └── ...
│
├── jobs/                       # Job management (20+)
│   ├── JobDetailsHeader.tsx
│   ├── JobInfoSection.tsx
│   ├── JobsList.tsx
│   ├── context/
│   │   └── JobDetailsContext.tsx
│   └── overview/
│       ├── JobBasicInfoCard.tsx
│       └── JobScheduleCard.tsx
│
├── clients/                    # Client management (15+)
│   ├── ClientForm.tsx
│   ├── ClientsList.tsx
│   ├── ClientsFilters.tsx
│   ├── client-form/
│   │   ├── PropertyCreateDialog.tsx
│   │   └── hooks/
│   │       └── useClientProperties.tsx
│   └── detail-v2/
│       └── PropertiesCard.tsx
│
├── automations/                # Automation system (20+)
│   ├── AIWorkflowAssistant.tsx
│   ├── AdvancedWorkflowBuilder.tsx
│   ├── AutomationEngineStatus.tsx
│   ├── SmartTriggerSelector.tsx
│   ├── SmartActionSelector.tsx
│   └── VisualWorkflowCanvas.tsx
│
├── connect/                    # Communications (15+)
│   ├── AIAgentDashboard.tsx
│   ├── CallMonitoring.tsx
│   ├── EmailComposer.tsx
│   └── SMSComposer.tsx
│
├── calling/                    # VoIP functionality (10+)
│   ├── CallButton.tsx
│   ├── ActiveCallInterface.tsx
│   ├── InboundCallNotification.tsx
│   └── OutboundCallDialog.tsx
│
├── analytics/                  # Reporting (6)
│   ├── BusinessDashboard.tsx
│   ├── CustomReports.tsx
│   ├── PerformanceMetrics.tsx
│   ├── PredictiveAnalytics.tsx
│   ├── RevenueAnalytics.tsx
│   └── TeamPerformance.tsx
│
├── auth/                       # Authentication (5)
│   ├── ProtectedRoute.tsx
│   ├── RBACProvider.tsx
│   ├── UserMenu.tsx
│   └── UnifiedOnboardingModal.tsx
│
├── layout/                     # App layout (3)
│   ├── AppSidebar.tsx
│   └── MobileBottomNav.tsx
│
└── pwa/                        # PWA support (2)
    ├── InstallPrompt.tsx
    └── PWAUpdateHandler.tsx
```

### `/src/hooks/` - Custom React Hooks (68+)

| Category | Hooks | Purpose |
|----------|-------|---------|
| **Authentication** | `use-auth.tsx` | User authentication state |
| **Data Fetching** | `useJobsOptimized.ts`, `useClientsOptimized.ts`, `useBusinessData.ts` | Server state management |
| **Real-time** | `useRealtime.ts`, `useRealtimeSync.tsx`, `useUnifiedRealtime.tsx` | WebSocket subscriptions |
| **UI State** | `useSidebar.tsx`, `useIsMobile.tsx` | Interface state |
| **Business Logic** | `useInvoices.ts`, `useEstimates.ts`, `useSchedule.ts` | Domain-specific logic |

### `/src/services/` - Business Logic Layer

```
services/
├── automationService.ts        # Automation execution engine
└── communications/
    └── TelnyxService.ts        # Telnyx API wrapper
```

### `/src/integrations/` - External API Integration

```
integrations/
└── supabase/
    ├── client.ts               # Supabase client initialization
    └── types.ts                # Auto-generated database types
```

### `/src/types/` - TypeScript Definitions

```
types/
├── job.ts                      # Job-related types
├── client.ts                   # Client types
├── invoice.ts                  # Invoice types
├── automation.ts               # Automation types
└── ...
```

## Backend Structure

### `/supabase/functions/` - Edge Functions (47)

#### AI & Machine Learning
| Function | Purpose |
|----------|---------|
| `ai-actions` | AI-powered actions |
| `ai-client-lookup` | Client search via AI |
| `ai-dispatcher-handler` | Voice AI dispatcher |
| `ai-workflow-assistant` | Workflow suggestions |
| `generate-ai-message` | AI message generation |
| `create-ai-assistant` | Assistant configuration |
| `ai-appointment-handler` | Appointment booking |
| `ai-assistant-webhook` | AI webhook handler |

#### Automation System
| Function | Purpose |
|----------|---------|
| `automation-executor` | Execute automation workflows |
| `automation-scheduler` | Schedule automation runs |
| `automation-ai-assistant` | AI-assisted automation |
| `process-automation-queue` | Queue processing |
| `process-scheduled-automations` | Cron-triggered automations |

#### SMS/Messaging (Telnyx)
| Function | Purpose |
|----------|---------|
| `telnyx-sms` | Send SMS messages |
| `sms-webhook` | Receive SMS webhooks |
| `send-estimate-sms` | Estimate notifications |
| `send-invoice-sms` | Invoice notifications |

#### Email (Mailgun)
| Function | Purpose |
|----------|---------|
| `mailgun-email` | Send emails |
| `email-webhook` | Email delivery webhooks |
| `send-email` | Generic email sending |
| `send-estimate` | Estimate email delivery |
| `send-invoice` | Invoice email delivery |

#### Voice/Calling (Telnyx)
| Function | Purpose |
|----------|---------|
| `telnyx-make-call` | Initiate outbound calls |
| `telnyx-call-control` | Call control actions |
| `telnyx-call-recording` | Recording management |
| `telnyx-call-status` | Call status webhooks |
| `telnyx-voice-webhook` | Voice event webhooks |
| `telnyx-webrtc-call` | Browser-based calling |
| `telnyx-conference-control` | Conference calls |
| `realtime-voice-bridge` | Voice bridging |

#### Phone Number Management
| Function | Purpose |
|----------|---------|
| `telnyx-phone-search` | Search available numbers |
| `telnyx-phone-purchase` | Purchase numbers |
| `telnyx-phone-numbers` | List owned numbers |
| `manage-phone-numbers` | Number configuration |
| `telnyx-voice-config` | Voice settings |

#### Utilities
| Function | Purpose |
|----------|---------|
| `check-api-keys` | API key validation |
| `check-email-config` | Email configuration check |
| `get-telnyx-token` | Token generation |
| `enhanced-communication-logger` | Communication logging |

### `/supabase/migrations/` - Database Migrations

Migration files follow the pattern: `YYYYMMDDHHMMSS_description.sql`

Key migrations include:
- Initial schema setup
- RLS policies
- Tenant fields on properties
- Automation tables
- Communication logs

## Configuration Files

### Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.ts` | Tailwind CSS customization |
| `tsconfig.json` | TypeScript compiler options |
| `tsconfig.node.json` | Node-specific TS config |
| `eslint.config.js` | ESLint rules |
| `postcss.config.js` | PostCSS plugins |
| `components.json` | shadcn/ui configuration |

### Environment Files

| File | Purpose |
|------|---------|
| `.env` | Local environment variables |
| `.env.example` | Environment template |

## Key Statistics

| Metric | Count |
|--------|-------|
| **Total Source Files** | 300+ |
| **Page Components** | 51 |
| **UI Components** | 100+ |
| **Custom Hooks** | 68+ |
| **Edge Functions** | 47 |
| **TypeScript Coverage** | 100% |
| **Lines of Code** | ~50,000+ |

## File Naming Conventions

- **Components**: PascalCase (`JobDetailsHeader.tsx`)
- **Hooks**: camelCase with `use` prefix (`useJobsOptimized.ts`)
- **Services**: camelCase (`automationService.ts`)
- **Types**: camelCase (`job.ts`)
- **Utils**: camelCase (`formatPhone.ts`)
- **Edge Functions**: kebab-case (`ai-client-lookup/index.ts`)

## Import Aliases

Configured in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Usage: `import { Button } from "@/components/ui/button"`

## Related Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Development Guide](./development-guide.md)
