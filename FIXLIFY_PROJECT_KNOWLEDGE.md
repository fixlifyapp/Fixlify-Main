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

### 8. Improved Email Templates (2025-07-01)
- **Issue**: Email templates had poor design that didn't render properly in email clients
- **Solution**:
  - Created clean, professional email templates that work in all email clients
  - Used table-based layout for compatibility with Outlook and older email clients
  - Added proper MSO conditionals for Microsoft Office rendering
  - Simplified design with clear CTA buttons and responsive layout
  - Updated both estimate and invoice email templates
- **Key Features**:
  - Professional header with company branding
  - Clear amount display with estimate/invoice number
  - Prominent call-to-action button
  - Mobile-responsive design
  - Consistent color scheme (purple for estimates, green for invoices)
  - Company footer with contact information
- **Edge Functions Updated**:
  - `mailgun-email` - Generic email sending with template support
  - `send-estimate` - Professional estimate emails
  - `send-invoice` - Professional invoice emails

### 9. Fixed Client Portal Blank Page Issue (2025-07-01)
- **Issue**: Email links pointing to hub.fixlify.app/invoice/{id} showed blank page
- **Root Cause**: The hub.fixlify.app is a separate portal application that wasn't properly deployed or configured
- **Solution**:
  - Created local portal pages in the main application:
    - `/invoice/:invoiceId` - Direct invoice viewing page
    - `/estimate/:estimateId` - Direct estimate viewing page
    - `/portal/:accessToken` - Full client portal with token access
  - Updated email and SMS edge functions to use local URLs instead of hub.fixlify.app
  - Created professional, mobile-responsive portal pages with:
    - Invoice/Estimate details display
    - Client information
    - Line items breakdown
    - Action buttons (Pay Invoice, Accept Estimate, Download PDF)
    - Responsive design for all devices
- **Files Created**:
  - `/src/pages/InvoicePortal.tsx` - Invoice viewing page
  - `/src/pages/EstimatePortal.tsx` - Estimate viewing page
- **Edge Functions Updated**:
  - `send-invoice` - Now uses local invoice URL
  - `send-estimate` - Now uses local estimate URL
  - `send-invoice-sms` - Updated portal links
  - `send-estimate-sms` - Updated portal links
- **Note**: Once hub.fixlify.app is properly deployed, update the URLs back to use the dedicated portal domain

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

## 🚨 Jobs Loading Timeout Fix (2025-07-01)

### Critical Issue Fixed
Jobs tab showing endless loading with timeout errors and circuit breaker activation.

### Root Causes
1. Heavy query with client joins and tags
2. Missing database indexes
3. Circuit breaker triggered by repeated timeouts
4. No query timeout protection

### Solution Components
1. **Query Optimization**
   - Removed heavy joins and array fields
   - Added 10-second timeout protection
   - Created optimized RPC function for client jobs

2. **Database Optimizations**
   - Added composite indexes
   - Created optimized view
   - Added timeout-protected function

3. **Circuit Breaker Management**
   - Added reset functionality
   - Global reset function available
   - Auto-reset on manual refresh

### Emergency Fix
```javascript
// Run in console if jobs won't load
localStorage.clear();
window.resetJobsCircuitBreaker();
location.reload();
```

### Files Modified
- `/src/hooks/useJobsOptimized.ts`
- `/src/utils/errorHandling.ts`
- `/migrations/fix_jobs_timeout.sql`
- `/console_scripts/fix_jobs_timeout.js`

See `FIX_JOBS_TIMEOUT.md` for complete documentation.

## 🎯 Simplified Client Jobs Tab Fix (2025-07-01)

### Problem
Jobs weren't loading in Client Details > Jobs tab, and attempted optimizations caused more errors.

### Simple Solution
Use the existing JobsList component from Jobs page instead of creating new optimizations.

### Changes
1. **Reverted all optimizations**
   - Removed query timeouts and circuit breakers
   - Restored original query structure
   - Removed all debug code

2. **Updated ClientJobs Component**
   - Now uses standard JobsList component
   - Same UI as main Jobs page
   - All features work: bulk actions, filtering, etc.

### Result
- Jobs now load properly in client tabs
- No database changes needed
- Clean, maintainable code
- Consistent UI across the app

See `SIMPLE_FIX_CLIENT_JOBS.md` for details.

## 🔧 Fixed Client Portal "JSON object requested" Error (2025-07-01)

### Problem
When clicking on estimate/invoice links from emails, the client portal showed error: "JSON object requested, multiple (or no) rows returned"

### Root Cause
The Supabase query using nested selects with `.single()` was failing:
```javascript
// This was causing the error:
.select(`
  *,
  jobs(
    id,
    title,
    clients(*)
  )
`)
.single();
```

### Solution
Refactored both EstimatePortal and InvoicePortal to use separate queries:
1. First fetch the estimate/invoice using `.maybeSingle()`
2. Then fetch the job data if job_id exists
3. Finally fetch the client data if client_id exists
4. Combine all data into a single object

### Key Changes
- Changed from nested queries to sequential queries
- Used `.maybeSingle()` instead of `.single()` for safer error handling
- Added proper error handling for each step
- Maintained the same UI and functionality

### Files Modified
- `/src/pages/EstimatePortal.tsx`
- `/src/pages/InvoicePortal.tsx`

### Result
- Client portal now loads without errors
- Better error handling and logging
- More reliable data fetching
- Same user experience maintained

## 🔧 Fixed Client Portal "Access Denied" Error (2025-07-02)

### Problem
When clicking on portal links with access tokens, the client portal showed "Access Denied" error with console showing "Portal data loading failed" and 500 error.

### Root Cause
The ClientPortal component was trying to invoke a `portal-data` edge function that didn't exist in the Supabase edge functions.

### Solution
Created the missing `portal-data` edge function that:
1. Validates the access token from client_portal_access table
2. Fetches client data based on the token
3. Retrieves all related jobs, estimates, and invoices
4. Calculates totals and statistics
5. Returns formatted portal data with proper permissions

### Key Components
- **Edge Function**: `portal-data` - Handles portal data retrieval
- **Database Function**: `generate_portal_access` - Creates secure access tokens
- **Table**: `client_portal_access` - Stores portal access tokens with permissions

### Files Created/Modified
- Created edge function: `portal-data`
- No frontend changes needed - the component was already correct

### Result
- Client portal now loads successfully with valid access tokens
- Secure token-based access to client data
- Proper permission handling
- Full portal functionality restored


## 🎯 Client Portal Enhancements (2025-07-02)

### Changes Made

1. **Dynamic Email Generation**
   - Created `/src/utils/email.ts` utility for email formatting
   - Updated `ClientPortalFooter` to use dynamic email generation
   - Email format: `companyname@fixlify.app` (spaces/special chars converted to underscores)
   - Falls back to `support@fixlify.app` if no company name

2. **Edge Functions Created**
   - `portal-data` - Validates tokens and returns client portal data
   - `document-viewer` - Handles document viewing (placeholder for PDF viewer)
   - `download-document` - Handles document downloads (placeholder for PDF generation)

3. **Portal Button Functionality**
   - **View Button**: Opens document in new tab at `/{documentType}/{id}`
   - **Download Button**: Shows "coming soon" message and opens document for printing
   - **Pay Now Button**: Shows "coming soon" message and opens invoice view
   - All buttons have loading states and proper error handling

4. **Email Generation Rules**
   - Company name is converted to lowercase
   - Spaces, hyphens, ampersands, etc. are replaced with underscores
   - Non-alphanumeric characters are removed
   - Multiple underscores are collapsed to single
   - Limited to 30 characters
   - Example: "Fixlify Services Inc." → `fixlifyservices@fixlify.app`

### Files Modified
- `/src/components/portal/ClientPortalFooter.tsx` - Uses dynamic email
- `/src/components/portal/DocumentList.tsx` - Updated button handlers
- `/src/utils/email.ts` - Created email utility functions
- Edge functions: `portal-data`, `document-viewer`, `download-document`

### Future Enhancements Needed
1. **PDF Generation**: Integrate with a PDF service (Puppeteer, jsPDF, etc.)
2. **Payment Integration**: Connect with Stripe or similar payment processor
3. **Document Storage**: Store generated PDFs in Supabase Storage
4. **Email Templates**: Create better email templates for notifications


## 🎨 Client Portal 3D Gradient Redesign (2025-07-02)

### Overview
Transformed the client portal into a stunning 3D gradient experience with modern glassmorphism effects, animated backgrounds, and premium visual design.

### Design Features

1. **Background & Theme**
   - Dark gradient background: `from-slate-900 via-purple-900 to-slate-900`
   - Animated blob effects with purple, pink, and blue gradients
   - Glass morphism effects with backdrop blur throughout

2. **3D Effects & Animations**
   - Floating animated blobs in background
   - 3D card hover effects with transform and shadow
   - Gradient animations on borders and text
   - Smooth hover transitions with scale and lift effects
   - Loading state with concentric animated rings

3. **Color Scheme**
   - Primary: Purple to Pink gradients
   - Accent colors: Blue, Green, Orange for different sections
   - Glass effects: White/10 with backdrop blur
   - Text: White primary, purple-200/300 for secondary

4. **Component Updates**
   - **Stats Cards**: 3D gradient backgrounds with hover effects
   - **Navigation**: Glass sidebar with gradient active states
   - **Document Cards**: Glass backgrounds with gradient icons
   - **Buttons**: Gradient backgrounds with shadow effects
   - **Footer**: 3D contact cards with gradient backgrounds

5. **Interactive Elements**
   - Hover animations on all interactive elements
   - Loading spinners integrated into buttons
   - Collapsible document cards with smooth transitions
   - Mobile-responsive glass sheet menu

6. **Premium Features Section**
   - Added premium features showcase in sidebar
   - Security badges with gradient effects
   - "Made with love" animation in footer

### Files Modified
- `/src/pages/ClientPortal.tsx` - Complete redesign with 3D gradients
- `/src/components/portal/DocumentList.tsx` - Glass cards with gradients
- `/src/components/portal/ClientPortalFooter.tsx` - 3D contact cards
- `/src/styles/portal-3d.css` - Custom animations and effects
- `/src/index.css` - Import portal 3D styles

### CSS Animations Added
- `blob` - Floating background elements
- `gradient-shift` - Animated gradient backgrounds
- `shimmer` - Loading state effects
- `float` - Floating icon animation
- `pulse-glow` - Glowing badge effects
- Custom scrollbar with gradient thumb

### Accessibility Maintained
- Proper contrast ratios on glass elements
- Focus states on interactive elements
- Screen reader friendly markup
- Responsive design for all devices

### Performance Considerations
- CSS animations use GPU acceleration
- Backdrop filters with Safari fallbacks
- Efficient hover state transitions
- Optimized for smooth scrolling
