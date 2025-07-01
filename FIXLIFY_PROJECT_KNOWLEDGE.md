# Fixlify AI Automate - Project Knowledge Base

## 🎯 Project Context

**Fixlify AI Automate** is a comprehensive business management and automation platform designed for service-based businesses (HVAC, plumbing, electrical, etc.). It combines traditional business management tools with advanced AI automation capabilities.

### Working Environment
- **Project Location**: `C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main`
- **Development Tools**: 
  - Desktop Commander for local file system operations
  - Supabase MCP for database operations
  - Vite development server on port 8080

## 🏗️ Technical Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **UI Components**: 
  - shadcn/ui with Radix UI primitives
  - Tailwind CSS 3.4.11 with custom animations
  - Lucide React for icons
- **State Management**: 
  - TanStack React Query 5.56.2 for server state
  - React Hook Form 7.53.0 with Zod validation
- **Routing**: React Router DOM 6.26.2
- **Charts**: Recharts 2.12.7
- **3D Graphics**: Three.js with React Three Fiber

### Backend & Database
- **BaaS**: Supabase (PostgreSQL)
- **Supabase URL**: `https://mqppvcrlvsgrsqelglod.supabase.co`
- **Authentication**: Supabase Auth with JWT
- **Real-time**: Supabase Realtime subscriptions
- **Storage Key**: `fixlify-auth-token`

## 📁 Project Structure

```
fixlify-ai-automate/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Utility libraries
│   ├── integrations/     # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── services/         # Business logic services
│   ├── contexts/         # React contexts
│   ├── utils/            # Helper functions
│   └── styles/           # Global styles
├── supabase/            # Database migrations and functions
├── scripts/             # Build and deployment scripts
└── public/              # Static assets
```

## 🔑 Key Features & Modules

### 1. **Dashboard & Analytics**
- Real-time KPIs and metrics
- Interactive charts using Recharts
- AI-powered insights
- Predictive analytics

### 2. **Client Management**
- Client profiles with complete history
- Self-service portal
- Communication tracking
- Relationship management

### 3. **Job Management**
- Full lifecycle management
- Scheduling and dispatch
- Estimates and invoicing
- Service categorization

### 4. **AI Center**
- AI Assistant with business data access
- Call Analytics
- Automation Rules engine
- Predictive Insights
- Smart Dispatch optimization

### 5. **Team Management**
- Member profiles and skills
- Commission tracking
- Role-based access control (RBAC)
- Performance scorecards

### 6. **Financial Management**
- Invoice generation
- Payment processing
- Financial reporting
- Revenue forecasting

### 7. **Communication Hub**
- Internal messaging
- Client communications
- Automated notifications
- Call masking features

### 8. **Automation Engine**
- Workflow builder
- Trigger-based actions
- External integrations
- Custom automation rules

## 🗄️ Database Schema (Key Tables)

### Core Tables
- `profiles` - User profiles and settings
- `clients` - Client information
- `jobs` - Job records and status
- `team_members` - Team member data
- `invoices` - Financial records
- `automations` - Automation rules
- `automation_templates` - Pre-built automation templates
- `messages` - Communication records
- `ai_conversations` - AI interaction history

### Multi-tenancy
- Row-level security (RLS) based on `organization_id`
- User isolation through Supabase policies

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev          # Port 8080
npm run dev:8081    # Port 8081

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 🔌 Key Integrations

### Supabase Integration
- Client initialized in `/src/integrations/supabase/client.ts`
- Types generated in `/src/integrations/supabase/types.ts`
- Auth persistence with localStorage
- Real-time subscriptions for live updates

### Environment Variables
```
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg
```

## 🛠️ Common Development Tasks

### Working with Components
- Components follow compound pattern (e.g., Card.Header, Card.Content)
- Use shadcn/ui components from `/src/components/ui/`
- Custom business components in `/src/components/`

### Database Operations
- Use Supabase MCP for database queries
- Check RLS policies for multi-tenancy
- Use TypeScript types from `/src/types/`

### Adding New Features
1. Define types in `/src/types/`
2. Create database migrations in `/supabase/migrations/`
3. Build UI components
4. Implement business logic in services
5. Add to routing if needed

### AI Integration Points
- AI hooks in `/src/hooks/use-ai/`
- AI-related components in AI Center
- Automation engine for AI-driven workflows

## 🚨 Important Considerations

### Security
- All database operations respect RLS
- Authentication required for all routes
- API keys stored securely in environment variables

### Performance
- Lazy loading for route components
- React Query for efficient data fetching
- Optimistic updates for better UX

### Multi-tenancy
- Organization-based data isolation
- Proper RLS policies on all tables
- User permissions managed through roles

## 📝 Common Issues & Solutions

### CORS Issues
- Supabase client configured without global headers
- Use proper authentication headers

### Authentication
- Token stored in localStorage as `fixlify-auth-token`
- Auto-refresh enabled
- Session detection in URL

### Build Issues
- Check Node.js version compatibility
- Clear node_modules and reinstall
- Verify all environment variables

## 🎯 Development Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Component Reusability**: Use compound components
3. **State Management**: Server state in React Query, local state in components
4. **Error Handling**: Proper error boundaries and toast notifications
5. **Testing**: Test database operations with Supabase MCP
6. **Code Organization**: Follow existing patterns in codebase

## 🔗 Quick References

- **Supabase Dashboard**: Access via Supabase URL
- **Component Library**: `/src/components/ui/`
- **API Types**: `/src/types/database.ts`
- **Automation Docs**: Various AUTOMATION_*.md files
- **Setup Guides**: SETUP_INSTRUCTIONS.md, FIXLIFY_SETUP_GUIDE.md

---

This knowledge base should be used in conjunction with the actual codebase. Always verify current implementations as the project evolves.


## 📧 Email & SMS Configuration (Updated 2025-06-30)

### Edge Functions Deployed
- **telnyx-sms**: Core SMS sending functionality via Telnyx API
- **mailgun-email**: Core email sending functionality via Mailgun API  
- **send-estimate**: Send estimate emails with portal links
- **send-estimate-sms**: Send estimate SMS with portal links
- **send-invoice**: Send invoice emails with portal links
- **send-invoice-sms**: Send invoice SMS with portal links

### Required Environment Variables
- `TELNYX_API_KEY`: Your Telnyx API key for SMS
- `MAILGUN_API_KEY`: Your Mailgun API key for emails
- `TELNYX_CONNECTION_ID`: Optional Telnyx connection ID

### Phone Number Configuration
- Phone numbers stored in `telnyx_phone_numbers` table
- Must have `status = 'active'` and `user_id` assigned
- System automatically selects user's phone number for sending

### Communication Logging
- Emails logged in `estimate_communications` and `invoice_communications` tables
- SMS messages logged with portal link tracking
- All communications include client info and timestamps

### Portal Link Generation
- Uses `generate_portal_access` RPC function
- Creates secure, time-limited access tokens (72 hours default)
- Links format: `https://hub.fixlify.app/portal/{token}`

### Testing
See `email_sms_test_instructions.md` for detailed testing procedures.


## 🐛 Recent Fixes (2025-07-01)

### 1. Fixed "scheduled_date" column error
- **Issue**: Jobs table queries were looking for non-existent `scheduled_date` column
- **Solution**: Updated all references from `scheduled_date` to `date` (the actual column name) in:
  - `/src/utils/automationTriggers.ts`
  - `/src/services/automation-execution.ts`
  - `/src/services/automation-execution-backup.ts`
  - `/src/hooks/automations/useAutomationExecution.ts`

### 2. Fixed duplicate client creation issue
- **Issue**: Client form was submitting multiple times when clicked
- **Solution**: Added submission guard in `ClientsCreateModal.tsx` to prevent multiple submissions

### 3. Fixed "organization_id=undefined" error
- **Issue**: Automation workflows were being queried with undefined organization_id
- **Solution**: 
  - Updated `useAutomationTriggers` hook to use profile's organization_id
  - Added validation in `automation-trigger-service.ts` to check for valid organization_id
  - Fixed initialization to pass both userId and organizationId

### 4. Fixed "ERR_INSUFFICIENT_RESOURCES" during job creation
- **Issue**: Automation triggers were causing infinite loops when creating jobs
- **Solution**: Implemented comprehensive safeguards:
  - Created `AutomationExecutionTracker` to limit executions per entity
  - Added detection for entities created by automation
  - Implemented configurable limits and debug mode
  - Enhanced trigger service with proper checks
  - See `AUTOMATION_SAFEGUARDS.md` for detailed documentation

### 5. Fixed estimate/invoice numbering system
- **Issue**: Duplicate key violations when creating estimates due to per-user counters conflicting with global unique constraints
- **Solution**: 
  - Migrated to global counters for estimates and invoices (user_id = NULL in id_counters table)
  - Created atomic `get_next_document_number` database function to prevent race conditions
  - Updated `generateNextId` to use the atomic function for estimates/invoices
  - Added proper error handling for duplicate key violations with user-friendly messages
  - Added database indexes for better performance
  - Ensured proper RLS policies for id_counters table

### 6. Fixed "Maximum update depth exceeded" error
- **Issue**: Infinite render loop when loading any job page caused by circular dependencies in MessageContext
- **Solution**:
  - Removed `activeConversation?.id` from `fetchConversations` useCallback dependencies
  - Added separate useEffect to handle active conversation updates
  - Fixed debouncing for realtime subscriptions (increased delay to 500ms)
  - Fixed syntax error in GlobalRealtimeProvider (missing arrow function for refreshMessages)
  - Simplified global realtime listener useEffect in MessageContext
- **Key Changes**:
  - MessageContext: Removed circular dependency between fetchConversations and activeConversation
  - GlobalRealtimeProvider: Fixed missing colon in refreshMessages function definition
  - Improved debouncing to prevent rapid state updates from realtime subscriptions

### 7. Fixed SMS/Email sending edge function errors
- **Issue**: System was trying to invoke non-existent edge functions causing send failures
- **Solution**:
  - Updated all references from `send-estimate-fixed` to `send-estimate` in useEstimateActions.ts
  - Changed all `mailgun-email` references to `send-email` in frontend code
  - Deployed `mailgun-email` edge function for backward compatibility
  - Updated `telnyx-sms` edge function with better phone number handling
  - Updated `automation-executor` to use correct edge function names
- **Key Files Updated**:
  - `/src/components/jobs/estimates/hooks/useEstimateActions.ts`
  - `/src/services/email-service.ts`
  - `/src/services/automation-execution-service.ts`
  - `/src/pages/TestAutomationPage.tsx`

### Development Server
- Running on port 8082/8083 (ports 8080 and 8081 were in use)
- Access at: http://localhost:8083/


## 🏢 Organization Context Management (2025-06-30)

### Problem Solved
Fixed inconsistent usage of `user_id` vs `organization_id` across the application, especially in automation workflows.

### Solution Components
1. **OrganizationContext Service** (`/src/services/organizationContext.ts`)
   - Centralized management of organization context
   - Automatic fallback for backward compatibility
   - Helper methods for Supabase queries

2. **useOrganizationContext Hook** (`/src/hooks/use-organization-context.ts`)
   - React hook for components
   - Auto-initialization on user login
   - Reactive to profile changes

3. **Database Migration**
   - Updated existing records to have both IDs
   - Added performance indexes
   - Maintains backward compatibility

### Usage
```typescript
// In components
const { applyToQuery } = useOrganizationContext();
let query = supabase.from('table').select('*');
query = applyToQuery(query); // Adds proper filters

// In services
import { organizationContext } from '@/services/organizationContext';
await organizationContext.initialize(userId);
```

### Key Benefits
- Consistent data access patterns
- Backward compatibility with existing data
- Easy migration path to organization-based architecture
- Better performance with proper indexes

See `ORGANIZATION_CONTEXT_SOLUTION.md` for detailed documentation.


## 🔧 Jobs Not Loading in Client Tab Fix (2025-07-01)

### Problem Identified
Jobs were not loading when viewing the Jobs tab in client details, showing an endless loading spinner.

### Root Causes
1. Missing organization_id on some job records
2. Overly restrictive RLS policies
3. Inner join requirement on clients table
4. Permission scope limitations

### Solution Components
1. **Updated useJobsOptimized Hook**
   - Enhanced debugging with detailed console logs
   - Changed from inner to left join for clients
   - Better error handling and recovery

2. **Enhanced ClientJobs Component** 
   - Added error states with retry functionality
   - Auto-debug when no jobs found
   - Debug button for manual troubleshooting

3. **Debug Utility** (`/src/utils/jobsDebug.ts`)
   - Comprehensive debugging tool
   - Checks auth, permissions, and data access
   - Available in browser console

4. **Database Migration** (`/migrations/fix_jobs_client_loading.sql`)
   - Updates jobs to have organization_id
   - Recreates RLS policies with better access rules
   - Adds debug_job_access() function

### Key Files Modified
- `/src/hooks/useJobsOptimized.ts`
- `/src/components/clients/ClientJobs.tsx`
- `/src/utils/jobsDebug.ts`
- `/migrations/fix_jobs_client_loading.sql`

### Usage
```javascript
// Debug in browser console
debugJobsLoading('client-id-here')
```

See `FIX_JOBS_CLIENT_TAB.md` for complete documentation.