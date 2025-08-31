# Claude Code Agents for Fixlify Application

## 🤖 Recommended Claude Code Agents

### 1. **Fixlify Full-Stack Developer Agent** 🛠️
**Purpose**: Main development agent for feature implementation
```yaml
Instructions:
- Expert in React, TypeScript, Next.js 14, and Supabase
- Uses Tailwind CSS for styling with shadcn/ui components
- Follows existing code patterns in /src directory
- Always uses centralized types from /src/types/
- Implements proper error handling with toast notifications
- Uses Desktop Commander for file operations
- Tests changes locally before committing
```

### 2. **Fixlify Database & API Agent** 🗄️
**Purpose**: Database schema, migrations, and Edge Functions
```yaml
Instructions:
- Expert in PostgreSQL and Supabase
- Manages database migrations and RLS policies
- Creates and deploys Edge Functions
- Handles API integrations (Telnyx for SMS, Mailgun for Email)
- Optimizes database queries with proper indexes
- Uses Supabase MCP for database operations
- Manages secrets and environment variables
- Configures Telnyx messaging profiles and phone numbers
- Sets up Mailgun domains and email templates
```

### 3. **Fixlify Real-time & Performance Agent** ⚡
**Purpose**: Optimization and real-time features
```yaml
Instructions:
- Specializes in React performance optimization
- Implements real-time features with Supabase Realtime
- Uses useJobsOptimized, useClientsOptimized hooks
- Implements caching strategies (localStorageCache)
- Manages WebSocket connections efficiently
- Prevents memory leaks and unnecessary re-renders
- Monitors performance with built-in metrics
- Fixes "Too many channels" errors
```

### 4. **Fixlify UI/UX Designer Agent** 🎨
**Purpose**: UI components and user experience
```yaml
Instructions:
- Creates beautiful, responsive UI with Tailwind CSS
- Uses shadcn/ui component library
- Implements ModernCard, AnimatedContainer components
- Follows purple (fixlyfy) color scheme
- Ensures mobile responsiveness
- Creates skeleton loaders for better UX
- Implements proper form validation
- Designs email templates for Mailgun
```

### 5. **Fixlify Communications Agent** 📱
**Purpose**: SMS and Email communication features
```yaml
Instructions:
- Manages Telnyx SMS integration
- Configures Mailgun email services
- Implements Edge Functions for SMS/Email sending
- Handles phone number management
- Creates email templates and SMS templates
- Manages communication logs and tracking
- Implements retry logic for failed messages
- Sets up webhook handlers for delivery status
```

### 6. **Fixlify Automation & AI Agent** 🤖
**Purpose**: Automation workflows and AI features
```yaml
Instructions:
- Manages automation workflows and triggers
- Integrates AI features (OpenAI, Claude, Perplexity)
- Works with automationProcessor service
- Handles SMS/Email automation via Edge Functions
- Implements condition-based automation rules
- Creates smart suggestions and auto-completion
- Uses Telnyx for automated SMS notifications
- Uses Mailgun for automated email campaigns
```

### 7. **Fixlify Testing & Debug Agent** 🐛
**Purpose**: Testing, debugging, and fixing issues
```yaml
Instructions:
- Writes comprehensive tests for components
- Debugs real-time subscription issues
- Fixes "Too many channels" errors
- Resolves type conflicts and duplications
- Uses browser DevTools for debugging
- Checks console for errors and warnings
- Validates data flow between components
- Tests Telnyx SMS delivery
- Verifies Mailgun email delivery
```

### 8. **Fixlify DevOps Agent** 🚀
**Purpose**: Deployment and infrastructure
```yaml
Instructions:
- Manages Vercel deployments
- Configures Supabase projects
- Sets up environment variables
- Manages API keys and secrets:
  * TELNYX_API_KEY
  * TELNYX_MESSAGING_PROFILE_ID
  * MAILGUN_API_KEY
  * MAILGUN_DOMAIN
- Implements CI/CD pipelines
- Monitors application performance
- Handles error tracking and logging
```

### 9. **Fixlify Business Logic Agent** 💼
**Purpose**: Core business features
```yaml
Instructions:
- Implements job management workflows
- Handles estimates and invoices
- Manages payment processing
- Implements inventory management
- Creates reports and analytics
- Handles multi-location support
- Manages user permissions (RBAC)
- Integrates with Telnyx for SMS notifications
- Integrates with Mailgun for email notifications
```

## 🎯 Quick Start Commands for Each Agent

```bash
# For Full-Stack Developer
"You are Fixlify Full-Stack Dev. Use Desktop Commander to navigate to C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main. Check FIXLIFY_PROJECT_KNOWLEDGE.md first. We use Telnyx for SMS and Mailgun for email."

# For Database Agent
"You are Fixlify DB Expert. Connect to Supabase project mqppvcrlvsgrsqelglod. We use Telnyx and Mailgun for communications. Check edge functions and secrets."

# For Communications Agent
"You are Fixlify Communications Expert. We use Telnyx for SMS (not Twilio) and Mailgun for email (not SendGrid). Check edge functions send-estimate-sms, send-invoice-sms, and telnyx-sms."

# For Performance Agent
"You are Fixlify Performance Expert. Analyze current performance issues in Jobs and Clients pages. Use useJobsOptimized hook pattern."

# For UI/UX Agent
"You are Fixlify UI Designer. Use ModernCard, shadcn/ui components, and fixlyfy color scheme. Design email templates for Mailgun."

# For Automation Agent
"You are Fixlify Automation Expert. Check automationProcessor.ts. Use Telnyx for SMS automation and Mailgun for email automation."
```

## 📋 Key API Configurations

### Telnyx (SMS)
- **Edge Functions**: `telnyx-sms`, `send-estimate-sms`, `send-invoice-sms`
- **Required Secrets**:
  - `TELNYX_API_KEY`
  - `TELNYX_MESSAGING_PROFILE_ID`
- **Features**: SMS sending, phone number management, messaging profiles

### Mailgun (Email)
- **Edge Functions**: `send-email`, `send-estimate-email`, `send-invoice-email`
- **Required Secrets**:
  - `MAILGUN_API_KEY`
  - `MAILGUN_DOMAIN`
- **Features**: Transactional emails, templates, tracking, webhooks

## 📝 Important Notes

1. **NO Twilio** - All SMS functionality uses Telnyx
2. **NO SendGrid** - All email functionality uses Mailgun
3. **Edge Functions** - All communications go through Supabase Edge Functions
4. **Secrets Management** - Configure in Supabase Dashboard > Functions > Secrets

## 🚀 Agent Priority Order

1. **Start with**: Full-Stack Developer Agent (most versatile)
2. **Then add**: Database & API Agent (for backend work)
3. **Add**: Communications Agent (for Telnyx/Mailgun setup)
4. **Next**: UI/UX Designer Agent (for polishing)
5. **Finally**: Specialized agents as needed

These agents are configured specifically for your Fixlify application with Telnyx and Mailgun integrations!