# Fixlify - Project Overview

## Executive Summary

**Fixlify** is a comprehensive repair shop management SaaS platform designed for field service businesses. The application provides end-to-end management of clients, jobs, invoices, scheduling, and communications with AI-powered automation capabilities.

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Repository Type** | Monolith |
| **Project Type** | Full-Stack Web SaaS |
| **Primary Language** | TypeScript |
| **Architecture Pattern** | React SPA + Supabase BaaS |
| **Deployment** | Vercel (Frontend) + Supabase Cloud |

## Tech Stack Summary

### Frontend
| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 18.3.1 |
| Build Tool | Vite | 5.4.1 |
| Language | TypeScript | 5.5.3 |
| UI Library | shadcn/ui (Radix) | Latest |
| Styling | Tailwind CSS | 3.4.11 |
| State Management | React Query | 5.56.2 |
| Forms | react-hook-form + zod | 7.53.0 / 3.23.8 |
| Routing | react-router-dom | 6.26.2 |
| Charts | recharts | 2.12.7 |

### Backend (Supabase)
| Category | Technology |
|----------|------------|
| Database | PostgreSQL 15 |
| Auth | Supabase Auth |
| Edge Functions | Deno Runtime |
| Real-time | Supabase Realtime |
| Storage | Supabase Storage |

### Integrations
| Service | Purpose |
|---------|---------|
| Telnyx | VoIP, SMS, AI Voice Dispatcher |
| Mailgun | Email delivery |
| OpenAI | AI message generation |
| Stripe | Payment processing |

## Key Statistics

| Metric | Count |
|--------|-------|
| Pages | 48+ |
| Edge Functions | 47 |
| Custom Hooks | 68+ |
| UI Components | 100+ |
| Database Migrations | 5 |

## Core Business Domains

### 1. Client Management
- Client profiles with properties
- Contact information management
- Landlord/Tenant relationships
- Client segmentation and analytics

### 2. Job Management
- Work order creation and tracking
- Multi-status workflow
- Scheduling with calendar views
- Job attachments and custom fields
- Job history logging

### 3. Financial Management
- Estimates and quotes
- Invoice generation
- Payment tracking
- Tax configuration
- Financial reporting

### 4. Scheduling
- Calendar-based scheduling
- Technician assignment
- Drag-and-drop interface
- Recurring jobs support

### 5. Communications
- SMS messaging (Telnyx)
- Email campaigns (Mailgun)
- Voice calls with AI dispatcher
- Communication templates
- Real-time notifications

### 6. Automation Engine
- Visual workflow builder
- Trigger-based automations
- Smart timing options
- AI-assisted workflow creation
- Automation analytics

### 7. AI & Connect
- AI Voice Dispatcher
- Intelligent message generation
- Client lookup automation
- Appointment booking via AI
- Call analytics and monitoring

### 8. Team & Multi-Tenancy
- Team member management
- Role-based access control (RBAC)
- Organization hierarchy
- Team invitations
- Performance metrics

### 9. Reporting & Analytics
- Business dashboards
- Custom report builder
- Revenue analytics
- Team performance metrics
- Predictive analytics

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + TypeScript)              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Pages   │ │Components│ │  Hooks   │ │ Services │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │ Edge Functions│  │   Realtime   │          │
│  │   Database   │  │    (Deno)    │  │  WebSockets  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Auth     │  │   Storage    │  │     RLS      │          │
│  │    System    │  │    Bucket    │  │   Policies   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Telnyx  │  │ Mailgun  │  │  OpenAI  │  │  Stripe  │        │
│  │VoIP/SMS  │  │  Email   │  │   AI     │  │ Payments │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Entry Points

| Entry Point | Purpose |
|-------------|---------|
| `src/main.tsx` | Application bootstrap |
| `src/App.tsx` | Main application component |
| `src/providers.tsx` | Context providers setup |
| `supabase/functions/*/index.ts` | Edge function entry points |

## Getting Started

See [Development Guide](./development-guide.md) for setup instructions.

## Related Documentation

- [Architecture](./architecture.md) - Detailed technical architecture
- [Source Tree Analysis](./source-tree-analysis.md) - Directory structure
- [Development Guide](./development-guide.md) - Setup and development
- [Component Inventory](./component-inventory.md) - UI components catalog _(To be generated)_
- [API Contracts](./api-contracts.md) - Edge Functions API _(To be generated)_
- [Data Models](./data-models.md) - Database schema _(To be generated)_
