# Fixlify Project Context

## Project Overview
**Name:** Fixlify MAIN WEB
**Type:** Repair Shop Management SaaS Platform
**Status:** Production (Active Development)

## Technology Stack (from package.json)

### Frontend
- **React:** 18.3.1
- **TypeScript:** 5.5.3
- **Build:** Vite 5.4.1
- **Styling:** Tailwind CSS 3.4.11
- **UI:** shadcn/ui (full @radix-ui/* suite)
- **State:** @tanstack/react-query 5.56.2
- **Routing:** react-router-dom 6.26.2
- **Forms:** react-hook-form 7.53 + zod 3.23.8
- **Charts:** recharts 2.12.7
- **3D:** Three.js 0.158 + @react-three/fiber 8.18
- **Flow diagrams:** @xyflow/react 12.7.1
- **Animation:** framer-motion 11.18.2
- **Dates:** date-fns 3.6.0

### Backend (Supabase)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **API:** 47 Edge Functions (Deno runtime)
- **Real-time:** Supabase Realtime
- **Client:** @supabase/supabase-js 2.50.5

### Key URLs
- **Supabase:** https://mqppvcrlvsgrsqelglod.supabase.co
- **Production:** https://fixlify.app

## Edge Functions (47 total)

### Telnyx (SMS/Voice) - 15 functions
- telnyx-sms, sms-webhook
- telnyx-make-call, telnyx-call-control, telnyx-call-status
- telnyx-voice-webhook, telnyx-webhook
- telnyx-call-recording, telnyx-conference-control
- telnyx-phone-search, telnyx-phone-purchase
- telnyx-webrtc-call, telnyx-voice-config
- telnyx-mcp-handler, get-telnyx-token

### Email (Mailgun) - 5 functions
- send-email, mailgun-email
- email-webhook
- check-email-config, test-email

### AI/Assistant - 8 functions
- ai-dispatcher-handler, ai-assistant-webhook
- ai-client-lookup, ai-appointment-handler
- ai-actions, ai-workflow-assistant
- create-ai-assistant, generate-ai-message
- update-assistant-voice

### Automations - 5 functions
- automation-executor, automation-executor-v2
- automation-scheduler
- process-automation-queue
- process-scheduled-automations
- automation-ai-assistant

### Invoicing - 4 functions
- send-invoice, send-invoice-sms
- send-estimate, send-estimate-sms
- book-appointment

## Key Components (src/components/)

### AI & Connect
- AIDispatcherConfiguration, TelnyxAIConfiguration
- AIAgentDashboard, AIDispatcherSettings
- InsightsGenerator, IntelligentAssistant

### Calling (Telnyx)
- UnifiedCallManager, ActiveCallInterface
- CallButton, InboundCallNotification
- OutboundCallDialog, CallTransfer
- ConferenceCall, CallAnalytics

### Automations (Visual Workflow Builder)
- AdvancedWorkflowBuilder, VisualWorkflowCanvas
- SmartTriggerSelector, SmartActionSelector
- WorkflowExecutionMonitor
- AutomationAnalytics, AutomationTesting

### Clients
- ClientForm, ClientsList, ClientsFilters
- ClientContactActions, GeneratePortalLinkDialog
- Client portal with secure token links

### Communications
- CommunicationsDashboard
- EmailAnalytics, SMSAnalytics

## Integrations Summary
| Service | Purpose | Key |
|---------|---------|-----|
| **Telnyx** | SMS + Voice calls | TELNYX_API_KEY |
| **Mailgun** | Email (fixlify.app) | MAILGUN_API_KEY |
| **OpenAI** | AI Assistant/Dispatcher | OPENAI_API_KEY |
| **Stripe** | Payments | STRIPE_SECRET_KEY |

## Coding Standards
- TypeScript strict mode, no `any`
- Functional components with hooks
- Tailwind for styling (no inline)
- Edge Functions: Deno ES modules
- Phone format: E.164 (+1XXXXXXXXXX)

## Critical Rules
1. Never hardcode API keys
2. Always use RLS on tables
3. Edge Functions: `@supabase/supabase-js@2` (not @2.7.1)
4. Run IDE diagnostics before completing code tasks
5. Email addresses: `company@fixlify.app` format
6. **ALWAYS check existing resources before creating new ones:**
   - Before creating Edge Function: `ls supabase/functions/`
   - Before creating table: check migrations folder
   - Before adding RPC: check existing database functions
   - Prevent duplicates: search codebase first
7. Use correct function names when invoking Edge Functions (see list above)

## ⚠️ Known Bugs - Function Name Mismatches (18 found)

The following function invocations call NON-EXISTENT edge functions:

| Called Function | Actual Function | Files Affected |
|-----------------|-----------------|----------------|
| `send-sms` | `telnyx-sms` | TelnyxService.ts, MessageDialog.tsx, automationService.ts, AutomationTestRunner.tsx, useEstimateActions.ts |
| `generate-with-ai` | `generate-ai-message` | AiAssistant.tsx, BrandingSection.tsx, edge-function-examples.ts |
| `telnyx-phone-numbers` | **MISSING** | PhoneNumbersList.tsx, PhoneNumberManager.tsx, SettingsIntegrations.tsx (9 calls) |
| `test-telnyx-connection` | **MISSING** | TelnyxSettings.tsx, debug-messaging.ts, setup-messaging-services.ts (4 calls) |
| `manage-phone-numbers` | **MISSING** | PhoneNumberSearch.tsx, PhoneNumbersManagement.tsx |
| `get-ai-call-analytics` | **MISSING** | AICallAnalytics.tsx, AiCenterPage.tsx |
| `ai-dispatcher-configs` | **MISSING** | AIAssistantVariables.tsx |
| `intelligent-ai-assistant` | **MISSING** | useIntelligentAI.ts |
| `portal-data` | **MISSING** | GeneratePortalLinkDialog.tsx |
| `send-team-invitation` | **MISSING** | useTeamInvitations.ts |
| `test-smtp` | **MISSING** | useCompanyEmailSettings.ts |
| `telnyx-phone-manager` | **MISSING** | TelnyxSyncButton.tsx |
| `setup-ai-dispatcher-number` | **MISSING** | SetupAIDispatcher.tsx |
| `manage-mailgun-domains` | **MISSING** | MailgunConfig.tsx |
| `check-telnyx-account` | **MISSING** | TelnyxDebugPage.tsx |
| `convert-estimate-to-invoice` | **MISSING** | EstimatesList.tsx |
| `notifications` | **MISSING** | edge-function-examples.ts |
| `get_logs` | **MISSING** | edge-function-examples.ts |

## ⚠️ Migration Issues Found

### Non-standard directories in migrations folder (should only be .sql files):
- automation/, cleanup/, fixes/, functions/, phone-system/, products/, profiles/, security/, sms-email/, verification/

### Duplicate table definitions:
| Table | Files |
|-------|-------|
| `telnyx_calls` | 20250726095300, 20250726095355, 20250726103003 |
| `automation_templates` | 20240124_enhanced_automations.sql, 20250625_unified_automation_system.sql, create_automation_tables.sql |
| `communication_logs` | 20240125_communication_logs.sql + 1 other |

**Total migrations:** 116 files
