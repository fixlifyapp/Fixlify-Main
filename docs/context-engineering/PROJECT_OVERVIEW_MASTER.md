# Fixlify AI Automate - Master Project Overview

## 🏢 Project Information
- **Project Name**: Fixlify AI Automate
- **Description**: Comprehensive business management and automation platform for service-based businesses
- **Version**: 2.0
- **Last Updated**: 2025-07-01

## 🔧 Technical Stack

### Frontend
- **React** 18.3.1 with TypeScript 5.5.3
- **Vite** 5.4.1 (Development server on port 8080/8081/8082/8083)
- **Tailwind CSS** 3.4.11 with custom animations
- **shadcn/ui** component library with Radix UI
- **React Router DOM** 6.26.2 for routing
- **TanStack React Query** 5.56.2 for server state
- **Recharts** 2.12.7 for data visualization
- **Three.js** with React Three Fiber for 3D graphics
- **Lucide React** for icons

### Backend & Infrastructure
- **Supabase** (PostgreSQL) as BaaS
- **Supabase Auth** with JWT tokens
- **Supabase Realtime** for live updates
- **Supabase Edge Functions** for serverless functions
- **Row Level Security (RLS)** for multi-tenancy

### External Integrations
- **Telnyx** - Phone numbers, SMS, voice calls
- **Mailgun** - Email sending
- **OpenAI** - AI capabilities
- **Stripe** - Payment processing (planned)

## 📁 Project Structure

```
fixlify-ai-automate/
├── src/
│   ├── components/         # UI components (shadcn/ui + custom)
│   ├── pages/             # Route pages/views
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── lib/               # Utility libraries
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Supabase client and types
│   ├── services/          # Business logic services
│   ├── contexts/          # React contexts
│   ├── utils/             # Helper functions
│   └── styles/            # Global styles
├── supabase/              # Database migrations and functions
├── scripts/               # Build and deployment scripts
├── migrations/            # Database migration files
└── public/                # Static assets
```

## 🚀 Core Features

### 1. Dashboard & Analytics
- Real-time KPIs and business metrics
- Interactive charts and graphs
- AI-powered insights and predictions
- Customizable widgets

### 2. Client Management
- Complete client profiles and history
- Self-service client portal
- Communication tracking
- Custom fields and tags
- Relationship management

### 3. Job Management
- Full job lifecycle (lead → complete)
- Scheduling and dispatch
- Estimates and invoicing
- Service categorization
- Job templates
- Recurring jobs

### 4. Team Management
- Team member profiles
- Skills and certifications
- Commission tracking
- Performance scorecards
- Role-based permissions (RBAC)
- Time tracking

### 5. Financial Management
- Invoice generation and tracking
- Payment processing
- Financial reporting
- Revenue forecasting
- Expense tracking
- Commission calculations

### 6. AI Center
- AI Assistant with business context
- Call Analytics
- Predictive insights
- Smart dispatch optimization
- Automated responses
- Voice AI integration

### 7. Communication Hub
- Internal team messaging
- Client communications
- Email and SMS sending
- Call masking
- Automated notifications
- Communication templates

### 8. Automation Engine
- Visual workflow builder
- Pre-built automation templates
- Trigger-based actions
- External integrations
- Custom automation rules
- Scheduled automations

### 9. Phone System Integration
- Telnyx phone number management
- Inbound/outbound calling
- SMS messaging
- Call recording
- Voicemail
- Call forwarding

## 🗄️ Database Schema

### Core Tables
- `profiles` - User profiles and settings
- `clients` - Client information
- `jobs` - Job records
- `team_members` - Team data
- `invoices` - Financial records
- `estimates` - Quote records
- `automations` - Automation rules
- `messages` - Communications
- `telnyx_phone_numbers` - Phone numbers
- `ai_conversations` - AI interactions

### Multi-tenancy Architecture
- Organization-based isolation
- Row Level Security (RLS) policies
- User permissions via roles

## 🔌 Environment Configuration

### Required Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Edge Function Secrets (in Supabase)
TELNYX_API_KEY=KEY...
MAILGUN_API_KEY=key-...
OPENAI_API_KEY=sk-...
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev          # Default port 8080
npm run dev:8081     # Alternative port

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Testing
npm run lint         # Lint code
npm run preview      # Preview build

# Database
# Use Supabase Dashboard or migration files
```

## 🚨 Recent Updates & Fixes

### Latest Fixes (2025-07-01)
1. **Fixed job loading in client tabs** - Simplified to use standard JobsList component
2. **Fixed email/SMS edge functions** - Corrected function names and templates
3. **Fixed client portal** - Created local portal pages for estimates/invoices
4. **Fixed infinite render loops** - Resolved circular dependencies in MessageContext
5. **Fixed estimate/invoice numbering** - Migrated to global counters

### Key Improvements
- Professional email templates
- Robust automation safeguards
- Optimized database queries
- Better error handling
- Improved multi-tenancy support

## 📚 Documentation Files

### Setup & Configuration
- `FIXLIFY_SETUP_GUIDE.md` - Complete setup instructions
- `SETUP_INSTRUCTIONS.md` - Quick setup guide
- `ENVIRONMENT_SETUP.md` - Environment configuration
- `MCP_SETUP_INSTRUCTIONS.md` - Supabase MCP setup

### Feature Documentation
- `AUTOMATION_SYSTEM_DOCUMENTATION.md` - Automation engine details
- `ESTIMATES_INVOICES_DOCUMENTATION.md` - Financial features
- `TELNYX_PHONE_MANAGEMENT_GUIDE.md` - Phone system guide
- `email_sms_test_instructions.md` - Communication testing

### Development Guides
- `FIXLIFY_PROJECT_KNOWLEDGE.md` - Comprehensive knowledge base
- `USER_DATA_ISOLATION_GUIDE.md` - Multi-tenancy guide
- `ORGANIZATION_CONTEXT_SOLUTION.md` - Organization management

### Troubleshooting
- `PROBLEMS_FIXED.md` - Common issues and solutions
- `PRODUCTS_TROUBLESHOOTING_GUIDE.md` - Products module issues
- Various FIX_*.md files for specific issues

## 🔐 Security Considerations

### Authentication & Authorization
- Supabase Auth with JWT tokens
- Role-based access control (RBAC)
- Organization-based data isolation
- Row Level Security (RLS) policies

### Data Protection
- All API calls authenticated
- Sensitive data encrypted
- Secure token storage
- HTTPS only

### Best Practices
- Environment variables for secrets
- No hardcoded credentials
- Regular security updates
- Audit logging

## 🌟 Getting Started

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd Fixlify-Main-main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add Supabase credentials
   - Configure edge function secrets

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:8080
   - Login with credentials

## 📞 Support & Resources

- **Documentation**: See documentation files in project root
- **Supabase Dashboard**: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod
- **Support**: Check support documentation or contact team

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Edge Functions
```bash
# Deploy using Supabase CLI
supabase functions deploy [function-name]
```

### Database Migrations
- Apply via Supabase Dashboard
- Or use migration files in `/migrations`

---

*This master overview provides a comprehensive understanding of the Fixlify AI Automate project. For detailed information on specific features, refer to the individual documentation files.*