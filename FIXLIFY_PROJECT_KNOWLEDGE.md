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

## 🐛 Dashboard Content Not Showing on PC Fix (2025-07-02)

### Problem
Dashboard content was not displaying on PC/desktop browsers while it worked correctly on mobile. Only the left sidebar menu was visible, with the main content area appearing blank.

### Root Cause
The SidebarInset component was using `min-h-svh` (minimum height: small viewport height) which caused layout issues on desktop. The flex container wasn't properly distributing width between the sidebar and main content area.

### Solution
1. **Updated PageLayout Component**
   - Added `w-full min-w-0` to ensure proper width distribution
   - Added max-width container for content centering
   - Removed `overflow-hidden` which was hiding content

2. **Fixed SidebarInset Component**
   - Changed from `min-h-svh` to proper flex layout
   - Added `w-full min-w-0` for correct width handling
   - Added `data-sidebar-inset` attribute for CSS targeting

3. **Updated Header Component**
   - Ensured full width on header element
   - Fixed padding structure for proper layout

4. **Created Layout Fix CSS**
   - Added specific CSS rules to ensure proper flex behavior
   - Fixed width constraints on sidebar and content areas
   - Prevented overflow issues

### Files Modified
- `/src/components/layout/PageLayout.tsx`
- `/src/components/ui/sidebar/sidebar-sections.tsx`
- `/src/components/layout/Header.tsx`
- `/src/pages/Dashboard.tsx`
- `/src/styles/layout-fix.css` (created)
- `/src/index.css` (imported layout-fix.css)

### Result
- Dashboard content now displays correctly on all screen sizes
- Sidebar and content area properly share available space
- Responsive behavior maintained for mobile devices
- No visual regressions on other pages

## 🔐 Blank Page Authentication Error Fix (2025-07-02)

### Problem
Pages showing blank content on PC with authentication errors in console:
- "Failed to load resource: the server responded with a status of 400"
- "Invalid Refresh Token" errors
- Auth state change: SIGNED_OUT no session

### Root Cause
Expired or corrupted authentication tokens in localStorage causing the Supabase client to fail when trying to refresh the session. The app gets stuck in a loop trying to authenticate with invalid tokens.

### Quick Fix (Run in Browser Console)
1. Open browser console (F12)
2. Copy and paste the contents of `FIX_BLANK_PAGE.js`
3. Press Enter - this will clear auth data and redirect to login

### Permanent Solution Implemented
1. **Updated ProtectedRoute Component**
   - Added auth error detection
   - Auto-redirect on refresh token errors
   - Better loading state handling

2. **Enhanced Auth State Management**
   - Added error handling in useAuthState hook
   - Improved session validation
   - Debug logging for auth issues

3. **Created Auth Fix Utilities**
   - `/src/utils/auth-fix.ts` - Helper functions for auth issues
   - `/src/utils/auth-monitor.js` - Monitors and auto-fixes auth errors
   - `FIX_BLANK_PAGE.js` - Console script for manual fixes

4. **Updated Supabase Client**
   - Enabled debug mode for auth
   - Added error handling for fetch operations
   - Better token refresh management

### Files Modified
- `/src/components/auth/ProtectedRoute.tsx`
- `/src/integrations/supabase/client.ts`
- `/src/App.tsx`
- Created: `/src/utils/auth-fix.ts`
- Created: `/src/utils/auth-monitor.js`
- Created: `FIX_BLANK_PAGE.js`

## 🔧 Layout Gap Fix & PageHeader Restoration (2025-07-02)

### Problem
After fixing the dashboard display issue, there was:
1. A large white gap between the header (search bar) and page content on all pages
2. PageHeader sections were too small after the fix
3. Action buttons on the right side of PageHeaders were working but needed proper sizing

### Root Cause
1. The `SidebarInset` component was rendering as a `<main>` element, creating nested main elements
2. The `space-y-6` utility class was adding unwanted margin between elements
3. Padding and sizing had been reduced too much in previous fixes

### Solution
1. **Fixed HTML Structure**
   - Changed `SidebarInset` from `<main>` to `<div>` element
   - Eliminated invalid nested main elements
   - Updated CSS selectors to match new structure

2. **Restored PageHeader Sizing**
   - Increased padding from `p-4 sm:p-6` to `p-6 sm:p-8`
   - Increased bottom margin from `mb-4` to `mb-6`
   - Maintained responsive design

3. **Fixed Layout Spacing**
   - Removed problematic `space-y-6` from Dashboard
   - Added explicit margins where needed
   - Restored proper content padding (1.5rem on desktop, 0.75rem on mobile)

### Files Modified
- `/src/components/ui/sidebar/sidebar-sections.tsx` - Changed SidebarInset to div
- `/src/components/ui/page-header.tsx` - Restored proper sizing
- `/src/pages/Dashboard.tsx` - Removed space-y utilities
- `/src/styles/layout-fix.css` - Updated selectors and spacing

## 🎨 Client Management Page Redesign (2025-07-02)

### Problem
The Client Management page had alignment issues and didn't look polished across different devices (PC, notebooks, tablets, phones).

### Changes Made
1. **Improved Stats Cards**
   - Better spacing and consistent heights
   - Enhanced hover effects with scale and shadow
   - Gradient backgrounds with proper opacity
   - Icon containers with hover animations
   - Responsive grid (1 column mobile, 2 columns tablet, 4 columns desktop)

2. **Search and Filter Bar**
   - Better alignment with rounded corners (rounded-2xl)
   - Improved shadow and backdrop blur effects
   - Filter button changes color when active
   - View toggle with smooth transitions
   - Proper spacing between elements

3. **Responsive Design**
   - Max width container (1600px) for ultra-wide screens
   - Consistent padding and margins across devices
   - Mobile-first approach with proper breakpoints
   - Typography scales appropriately on different screens

4. **Visual Enhancements**
   - Smooth transitions on all interactive elements
   - Better focus states for accessibility
   - Loading skeletons with shimmer effect
   - Consistent border radius (rounded-2xl for main containers)

5. **Layout Improvements**
   - Fixed grid layouts with proper gaps
   - Centered content on large screens
   - Better pagination design with proper spacing
   - Animated filter expansion

### Files Modified
- `/src/pages/ClientsPage.tsx` - Complete redesign with better structure
- `/src/styles/clients-page.css` - New CSS file for additional styling
- `/src/index.css` - Import new CSS file

### Result
- Clean, modern design that looks consistent across all devices
- Better visual hierarchy with proper spacing
- Smooth animations and transitions
- Improved user experience with better alignment


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
│   ├── contexts/         # React contexts│   └── store/            # Global state management
├── public/              # Static assets
└── supabase/           # Database migrations and types

## 🎨 Design System Updates

### Modern 3D Gradient Design (Updated)
- **Client Portal**: Unified single portal system with modern 3D aesthetics
- **Color Scheme**: 
  - Primary: Blue to Purple gradients (#3B82F6 → #8B5CF6)
  - Backgrounds: Dark with glass morphism effects
  - Accents: Neon glows and animated gradients
- **Components**: 
  - 3D animated cards with hover effects
  - Glass morphism panels
  - Gradient borders and shadows
  - Smooth transitions and animations
- **Client Portal Features**:
  - View/Download buttons restored on all documents
  - Modern 3D design throughout
  - Responsive for all devices
  - Animated backgrounds and effects

## 🔐 Authentication & Security

### Multi-tenant Architecture
- Separate authentication for companies and clients
- Company auth: `fixlify-auth-token`
- Client portal: Token-based access via URL parameter
- RLS policies enforcing data isolation

### Client Portal Access
- Access via `/portal/:accessToken` route
- Tokens generated for each client
- No login required - direct link access
- Secure document viewing and downloading

## 📊 Database Schema

### Core Tables
- **profiles**: User profiles linked to auth.users
- **companies**: Company/tenant information
- **clients**: Customer records per company
- **jobs**: Repair/service jobs
- **invoices**: Financial records
- **documents**: File storage references
- **messages**: Communication logs
- **team_members**: Staff management
- **products**: Inventory items
- **appointments**: Scheduling

### Key Relationships
- All tables have `company_id` for multi-tenancy
- RLS policies ensure data isolation
- Cascade deletes for data integrity

## 🚀 Key Features

### Business Management
- **Job Management**: Create, track, and manage service jobs
- **Client Management**: CRM with communication history
- **Scheduling**: Calendar and appointment system
- **Financial**: Invoicing, estimates, payments
- **Team Management**: Staff roles and permissions
- **Inventory**: Product and parts tracking

### AI & Automation
- **AI Center**: Claude integration for business insights
- **Automation Workflows**: Custom business process automation
- **Smart Scheduling**: AI-powered appointment optimization
- **Document Analysis**: Automated document processing
- **Communication**: Automated client messaging

### Client Portal
- **Unified System**: Single portal for all client needs
- **Document Access**: View and download invoices, estimates, reports
- **Job Tracking**: Real-time status updates
- **Communication**: Direct messaging with business
- **Modern UI**: 3D gradients and animations
- **Responsive**: Works on all devices

## 🔧 Development Guidelines

### Code Standards
- TypeScript for type safety
- Component-based architecture
- Custom hooks for logic reuse
- Consistent error handling
- Performance optimization (React.memo, useMemo, etc.)

### State Management
- React Query for server state
- Local state with useState/useReducer
- Form state with React Hook Form
- Global state via contexts when needed

### Styling
- Tailwind CSS utilities
- CSS modules for component styles
- Consistent spacing and sizing
- Mobile-first responsive design
- Dark theme with gradient accents

### Performance
- Code splitting with React.lazy
- Image optimization
- Debounced search inputs
- Virtualized long lists
- Optimistic updates

## 🔄 Recent Updates

### Client Portal Redesign (Latest)
- Removed duplicate portal systems
- Unified into single ClientPortal component
- Added modern 3D gradient design
- Restored view/download functionality
- Improved responsive layouts
- Added glass morphism effects
- Enhanced animations and transitions

### Previous Updates
- Supabase integration optimizations
- Real-time subscriptions setup
- Multi-tenant architecture implementation
- AI Center with Claude integration
- Automation workflow builder
- Performance optimizations

## 🐛 Known Issues & Solutions

### Common Issues
1. **Auth Token Conflicts**: Clear localStorage if switching accounts
2. **Real-time Updates**: Check Supabase subscription status
3. **File Uploads**: Ensure proper CORS configuration
4. **Performance**: Monitor React Query cache size

### Debugging Tips
- Check browser console for errors
- Verify Supabase connection
- Review RLS policies for permission issues
- Check network tab for API failures

## 📝 Deployment Notes

### Environment Variables
```
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### Build Process
```bash
npm run build
npm run preview  # Test production build
```

### Hosting
- Vite optimized for static hosting
- Configure redirects for SPA routing
- Enable HTTPS for production
- Set proper CORS headers

## 🔮 Future Enhancements

### Planned Features
- Mobile app development
- Advanced AI analytics
- Voice-activated controls
- AR/VR job visualization
- Blockchain integration for contracts
- IoT device monitoring

### Technical Debt
- Migrate remaining JS files to TypeScript
- Implement comprehensive testing
- Optimize bundle size
- Add service workers for offline support
- Enhance accessibility features

---

*Last Updated: Current Session*
*Maintained by: AI Assistant*

## 🔐 Portal Access System Implementation (2025-07-02)

### Overview
Implemented a comprehensive portal access system that allows every client to access their portal through secure, time-limited tokens. The system works for all clients and user accounts.

### Key Components

1. **Database Tables**
   - `client_portal_access` - Stores portal access tokens with permissions
   - `portal_sessions` - Tracks active portal sessions

2. **Edge Functions**
   - `portal-data` - Validates tokens and returns client data (Updated to use correct table names)
   - `document-viewer` - Handles document viewing
   - `download-document` - Handles document downloads

3. **SQL Function**
   - `generate_portal_access` - Creates secure access tokens with permissions

### How It Works
1. **Token Generation**: Use `generate_portal_access` function to create tokens for clients
2. **Portal Access**: Clients access via URL: `https://hub.fixlify.app/portal/{token}` or locally `http://localhost:8080/portal/{token}`
3. **Session Management**: First access creates a session in `portal_sessions` table
4. **Permissions**: Fine-grained control over what clients can view/do

### Testing Portal Access
- Created `/test-portal-access` page to test portal generation for all clients
- Access at: `http://localhost:8080/test-portal-access`
- Features:
  - Generate portal access for all clients
  - Test portal data loading
  - View generated URLs
  - Batch processing support

### Default Permissions
```json
{
  "view_estimates": true,
  "view_invoices": true,
  "view_jobs": true,
  "pay_invoices": true,
  "approve_estimates": true
}
```

### Portal URLs
- Production: `https://hub.fixlify.app/portal/{token}`
- Local: `http://localhost:8080/portal/{token}`
- Tokens valid for 72 hours by default

### Usage Example
```sql
-- Generate portal access for a client
SELECT generate_portal_access(
    'CLIENT_ID',
    jsonb_build_object(
        'view_estimates', true,
        'view_invoices', true,
        'view_jobs', true,
        'pay_invoices', true,
        'approve_estimates', true
    ),
    72  -- hours valid
);
```

---

*Portal Access System Added: 2025-07-02*


## 🎨 ClientsList Redesign to Match JobsList (2025-07-02)

### Problem
The ClientsList component design was inconsistent with the JobsList design. It lacked checkboxes for bulk actions and had a different visual structure.

### Changes Made

1. **Matching Table Design**
   - Added checkbox column for selection
   - Matching header structure with JobsList
   - Similar hover effects and transitions
   - Consistent column layout
   - Action buttons matching Jobs design

2. **Bulk Actions Support**
   - Added `selectedClients` state management
   - Created `BulkActionsBar` component for clients
   - Support for bulk status updates
   - Bulk delete functionality
   - Export selected clients to CSV

3. **Grid View Updates**
   - Checkboxes in grid cards
   - Consistent card design with Jobs
   - Better hover states
   - Portal link button
   - Edit and delete actions

4. **List View Columns**
   - Checkbox selection
   - Name with status badge
   - Company
   - Contact (email/phone)
   - Address
   - Segment
   - Jobs count
   - Revenue
   - Actions (portal link, edit, delete)

5. **Visual Consistency**
   - Same status badge styling
   - Matching icon usage
   - Consistent spacing and padding
   - Similar hover and focus states

### Files Modified
- `/src/components/clients/ClientsList.tsx` - Complete redesign
- `/src/pages/ClientsPage.tsx` - Added bulk action support
- `/src/components/clients/BulkActionsBar.tsx` - New component

### Result
- ClientsList now matches JobsList design exactly
- Consistent user experience across modules
- Better bulk action capabilities
- Improved visual hierarchy

## 🐛 Fixed ClientsList Component Error (2025-07-03)

### Problem
The ClientsList component was throwing TypeScript errors about missing required props (selectedClients, onSelectClient, onSelectAllClients) when used in places like ClientStats.tsx where these props weren't provided.

### Root Cause
The redesigned ClientsList component made selection-related props required, but the component was being used in other places without these props.

### Solution
1. Made all selection-related props optional in the ClientsList interface
2. Added a `showSelection` flag that checks if selection handlers are provided
3. Conditionally render checkboxes and selection UI only when handlers are available
4. Updated both grid and list views to handle optional selection functionality

### Key Changes
- Selection props are now optional: `selectedClients?`, `onSelectClient?`, `onSelectAllClients?`
- Added `showSelection` boolean to control checkbox visibility
- Checkboxes only appear when selection handlers are provided
- Component maintains backward compatibility with existing usage

### Files Modified
- `/src/components/clients/ClientsList.tsx` - Made selection props optional and conditional

### Result
- ClientsList works both with and without selection functionality
- No more TypeScript errors
- Backward compatible with existing usage
- Clean separation of concerns

## 🐛 Fixed DialogPortal Error in ClientsList (2025-07-03)

### Problem
The clients page was showing error: "'DialogPortal' must be used within 'Dialog'" when accessing http://localhost:8080/clients

### Root Cause
The DeleteConfirmDialog component was being called with incorrect props in ClientsList:
- Used `isOpen` instead of `open`
- Used `onClose` instead of `onOpenChange`

### Solution
Updated the DeleteConfirmDialog usage in ClientsList to use the correct props:
- Changed `isOpen={showDeleteDialog}` to `open={showDeleteDialog}`
- Changed `onClose` to `onOpenChange` with proper handling

### Files Modified
- `/src/components/clients/ClientsList.tsx` - Fixed DeleteConfirmDialog prop names

### Additional Notes
If you see authentication errors in the console, try:
1. Clear your browser's localStorage
2. Go to login page and sign in again
3. This will refresh the authentication tokens

### Result
- Client page now loads without Dialog errors
- Delete confirmation dialog works properly
- No breaking changes to the website

## 🎨 Fixed PageHeader Button Alignment (2025-07-03)

### Problem
The "Add Client" button in the Client Management page header was not aligned to the right side properly.

### Solution
Updated the PageHeader component to improve button alignment:
1. Changed breakpoint from `lg:` to `md:` for earlier horizontal layout
2. Added `self-start md:self-auto` to button container
3. Ensured proper flexbox layout with `md:flex-row md:justify-between`

### Files Modified
- `/src/components/ui/page-header.tsx` - Updated flex layout and button alignment

### Result
- Action buttons now properly align to the right on tablets and larger screens
- Better responsive behavior
- Consistent header layout across all pages

## 🎨 Fixed Global PageHeader Button Alignment (2025-07-03)

### Problem
Action buttons in PageHeader were not aligning to the right on all pages (notebooks, PCs, tablets). The issue was related to:
1. Inconsistent wrapper divs (ClientsPage had max-w-[1600px] wrapper)
2. PageHeader flex layout not working properly at all breakpoints
3. Related to previous gap fix that added padding to main element

### Root Causes
1. **Inconsistent page wrappers** - Some pages had constraining wrapper divs
2. **Breakpoint issues** - Button alignment only worked on large screens (lg:)
3. **Parent padding** - Main element has 1.5rem padding affecting layout

### Solution
1. **Removed constraining wrapper** from ClientsPage
2. **Updated PageHeader breakpoints**:
   - Changed from `lg:` to `sm:` for earlier responsive behavior
   - Updated flex layout to `sm:flex-row sm:justify-between`
   - Added `sm:self-center` to button container
3. **Improved responsive padding**:
   - Mobile: p-4
   - Small screens: sm:p-6
   - Large screens: lg:p-8

### Files Modified
- `/src/components/ui/page-header.tsx` - Fixed responsive layout and breakpoints
- `/src/pages/ClientsPage.tsx` - Removed max-w-[1600px] wrapper div

### Result
- Action buttons now properly align to the right on all screen sizes
- Consistent behavior across all pages
- Better responsive design
- No visual gaps or alignment issues

## 🎨 Complete Fix for PageHeader Button Alignment (2025-07-03)

### Problem
Deep global layout issue where buttons appeared below content instead of aligned to the right on tablets/notebooks/PCs.

### Root Causes
1. **Flexbox limitations** - Flex layout wasn't working properly across all screen sizes
2. **Content overflow** - Main container's `overflow-y-auto` was affecting layout
3. **Width constraints** - Some pages had wrapper divs constraining content
4. **Responsive breakpoints** - Button alignment only worked on specific screen sizes

### Solution Applied
Complete redesign of PageHeader with different approaches for different screen sizes:

#### Mobile & Tablets (< 1024px):
- Stack layout with button centered below content
- Clean, touch-friendly design
- Button appears after badges

#### Desktop (≥ 1024px):
- **Absolute positioning** for the button
- Button positioned at `top-6 right-6`
- Content has `pr-40` padding to prevent overlap
- Clean side-by-side layout

### Technical Changes

1. **PageHeader Component**:
   - Split into two different layouts using `lg:hidden` and `hidden lg:block`
   - Desktop uses absolute positioning for precise control
   - Mobile/tablet uses flex stack layout
   - Proper padding to prevent content overlap

2. **Layout CSS Updates**:
   - Added `min-height: 0` to main for proper flex sizing
   - Ensured full width for all content
   - Fixed overflow issues

### Files Modified
- `/src/components/ui/page-header.tsx` - Complete redesign with responsive layouts
- `/src/styles/layout-fix.css` - Enhanced for better flex container handling

### Result
✅ **Mobile**: Centered button below content
✅ **Tablets**: Centered button below content  
✅ **Desktop/Notebooks**: Button properly aligned to the right using absolute positioning
✅ **All screen sizes**: Clean, professional appearance

### Testing Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: ≥ 1024px (lg breakpoint)

## 🎨 Fixed Vertical Centering in PageHeader (2025-07-03)

### Problem
Text and content were too high, almost touching the top border. Both left content and right button needed to be vertically centered.

### Solution
Completely redesigned the PageHeader with proper vertical centering:

1. **Removed padding from container** - Now using `min-h` with flex centering
2. **Added minimum heights**:
   - Mobile: `min-h-[120px]`
   - Tablet: `sm:min-h-[140px]`
   - Desktop: `lg:min-h-[160px]`
3. **Used Flexbox for vertical centering**:
   - Wrapper has `flex items-center`
   - Desktop layout uses `lg:flex lg:items-center lg:justify-between`
4. **Proper spacing**:
   - Desktop: `lg:py-8` for vertical padding
   - Mobile/Tablet: `py-4 sm:py-6`
   - Horizontal padding: `px-4 sm:px-6 lg:px-8`

### Key Changes
- Both text (left) and button (right) are now vertically centered
- Consistent spacing across all screen sizes
- Clean, professional appearance
- No more content touching borders

### Files Modified
- `/src/components/ui/page-header.tsx` - Complete vertical centering implementation

### Result
✅ Content properly centered vertically on all devices
✅ Button and text aligned at the same height
✅ Consistent spacing from top and bottom borders

## 🎨 Fixed Job Details Page Issues (2025-07-03)

### Problems Fixed

1. **Removed "Edit Job" Button**
   - Removed the Edit Job button from the job details header as requested
   - Cleaned up unused code and imports

2. **Fixed Duplicate Job Title**
   - The job ID (e.g., "Job J-2006") was being shown both in the PageHeader and in the JobInfoSection
   - Removed the duplicate display from JobInfoSection to avoid redundancy
   - Removed unused Hash icon import

3. **Redesigned Estimates & Invoices Lists**
   - Fixed broken/messy design in estimates and invoices tabs
   - Created clean three-section card layout:
     - Header: Gray background with number, status, and amount
     - Details: White background with dates and notes
     - Actions: Gray background with action buttons
   - Improved button styling and hover effects
   - Better mobile responsiveness

### Files Modified
- `/src/components/jobs/JobDetailsHeader.tsx` - Removed Edit Job button
- `/src/components/jobs/header/JobInfoSection.tsx` - Removed duplicate job ID display
- `/src/components/jobs/overview/ModernJobEstimatesTab.tsx` - Redesigned estimate cards
- `/src/components/jobs/overview/ModernJobInvoicesTab.tsx` - Redesigned invoice cards

### Result
- Cleaner job details page without duplicate information
- Professional-looking estimates and invoices lists
- Consistent design across all tabs
- Better mobile experience

## 🐛 Fixed Grid View Error in ClientsList (2025-07-03)

### Problem
Clicking the grid view button in the clients page caused an error due to duplicate and out-of-scope `getStatusBadgeStyle` function definitions.

### Root Cause
The `getStatusBadgeStyle` function was defined multiple times inside different component scopes (ClientsList, ClientCard, and ClientRow), causing reference errors when components tried to access it.

### Solution
1. Moved `getStatusBadgeStyle` function to the module level (outside all components)
2. Removed all duplicate definitions from inside components
3. Now all components can access the shared function

### Additional Improvements
1. **Enhanced Search Bar Design**:
   - Added consistent height (h-10) across all elements
   - Improved border styling with border-border/50
   - Better alignment of search input and buttons
   - Added w-full to search input container for proper responsive behavior

2. **Updated ClientsFilters Component**:
   - Removed duplicate search input (already in main page)
   - Improved dropdown styling to match search bar
   - Added more filter options (prospects, time ranges)
   - Consistent rounded-xl borders and heights

### Files Modified
- `/src/components/clients/ClientsList.tsx` - Fixed function scope issue
- `/src/pages/ClientsPage.tsx` - Enhanced search bar styling
- `/src/components/clients/ClientsFilters.tsx` - Removed duplicate search, improved filters

### Result
- Grid view now works without errors
- Consistent and polished search/filter UI
- Better user experience with aligned elements

## 🎨 Added PageHeader to Details Pages (2025-07-03)

### Changes Made

#### Client Details Page (`/src/pages/ClientDetailPage.tsx`)
- Added PageHeader with consistent design
- Icon: User icon
- Badges: "Contact Info" and "Business Details"
- Action button: "Create Job"
- Removed old custom header

#### Job Details Page (`/src/pages/JobDetailsPage.tsx` & `/src/components/jobs/JobDetailsHeader.tsx`)
- Integrated PageHeader into JobDetailsHeader component
- Dynamic title: "Job J-XXXX"
- Dynamic subtitle: Client name and job title
- Dynamic badges based on job data:
  - Status badge (with appropriate color)
  - Revenue badge (if exists)
  - Date badge
- Action button: "Edit Job"
- Kept JobInfoSection below for additional details

### Design Consistency
- Both detail pages now match the global PageHeader design
- Proper vertical centering
- Responsive layout
- Consistent button alignment
- Professional appearance

### Files Modified
- `/src/pages/ClientDetailPage.tsx` - Added PageHeader
- `/src/components/jobs/JobDetailsHeader.tsx` - Integrated PageHeader
- `/src/pages/JobDetailsPage.tsx` - Removed Card wrapper

### Result
✅ Client Details page has consistent header design
✅ Job Details page has consistent header design
✅ Both pages follow the same layout pattern as list pages

## 🔧 Fixed Job Revenue Tracking (2025-07-03)

### Problem
Job revenue was not being updated when invoices were marked as paid. Jobs would show 0 revenue in the clients list and job list even though they had paid invoices.

### Root Cause
There was no mechanism to update the `jobs.revenue` field when an invoice status changed to 'paid'. The revenue field existed in the database but wasn't being populated.

### Solution
Created database triggers to automatically update job revenue when invoices are paid:

1. **Invoice Payment Trigger** (`update_job_revenue_on_invoice_payment`)
   - Fires when invoice status changes to 'paid'
   - Adds invoice total to job revenue
   - Also handles status changes from 'paid' to other statuses (subtracts revenue)

2. **Invoice Insert Trigger** (`update_job_revenue_on_invoice_insert`)
   - Handles cases where invoices are created with status already set to 'paid'
   - Immediately updates job revenue

3. **Revenue Calculation Function** (`recalculate_job_revenue`)
   - Utility function to recalculate total revenue from all paid invoices
   - Useful for data cleanup or verification

4. **Revenue Summary View** (`job_revenue_summary`)
   - Provides breakdown of job revenue
   - Shows paid vs unpaid invoices
   - Calculates pending revenue

### Database Changes
```sql
-- Triggers created:
- update_job_revenue_on_invoice_payment_trigger
- update_job_revenue_on_invoice_insert_trigger

-- Functions created:
- update_job_revenue_on_invoice_payment()
- update_job_revenue_on_invoice_insert()
- recalculate_job_revenue(job_id TEXT)

-- View created:
- job_revenue_summary

-- Index added:
- idx_invoices_job_id_status ON invoices(job_id, status)
```

### Result
- ✅ Job revenue automatically updates when invoices are paid
- ✅ Historical data has been corrected (existing paid invoices updated job revenue)
- ✅ Revenue displays correctly in all views (client lists, job lists, dashboards)
- ✅ Supports multiple invoices per job
- ✅ Handles invoice status changes (void, cancelled, etc.)

### Files Modified
- Database only - no frontend changes required
- Added migration: `update_job_revenue_on_invoice_payment`
- Added migration: `add_job_revenue_calculation_function`


## 🔧 Mobile Sidebar Background Issue Analysis (2025-01-07)

### Problem
Mobile hamburger menu opens with dark/black background, making menu items invisible. Multiple fix attempts were made but ultimately reverted.

### Root Cause Analysis
- Radix UI Sheet component not inheriting proper background colors
- CSS variable conflicts between sidebar and main background
- Specificity wars with multiple CSS override attempts

### Attempted Solutions (Reverted)
1. Created multiple CSS fix files with !important overrides
2. Modified sidebar components with inline styles
3. Added JavaScript mutation observers to force backgrounds
4. Created emergency console scripts

### Learnings
- Forcing styles with !important creates cascading problems
- Multiple CSS files targeting same issue causes conflicts
- Need to address root cause in component library rather than override

### Recommended Approach
- Consider alternative mobile menu implementation
- Use native mobile menu component instead of Sheet
- Ensure proper CSS variable inheritance from start

## 🎨 Comprehensive Layout Analysis (2025-01-07)

### Issues Identified

#### Mobile (< 768px)
- **Padding**: Only 12px - content too close to edges
- **Touch Targets**: Below 44px minimum requirement  
- **Sidebar**: Transparent background on hamburger menu

#### Tablet (768px - 1023px)
- **Breakpoints**: Awkward transitions between layouts
- **Grid**: Cards don't properly reflow in 2 columns
- **Headers**: Inconsistent heights across breakpoints

#### Desktop (≥ 1024px)
- **Container**: No max-width, content stretches infinitely
- **Spacing**: Same padding all sides (needs more horizontal)
- **Readability**: Lines too long on wide screens

#### Ultra-wide (≥ 1920px)
- **Layout**: No consideration for multi-panel layouts
- **Whitespace**: Poor use of available space
- **Content**: Stretches beyond comfortable reading width

### Solution Implemented
After pulling latest from GitHub:
- Removed conflicting CSS: `critical-layout-fix.css`, `layout-fix.css`
- Added unified `responsive-layout.css` with semantic approach
- Implemented proper container system
- Established consistent spacing scale

### New Responsive System
```
Breakpoints:
- Mobile: < 640px  
- Tablet: 640px - 1023px
- Desktop: 1024px - 1279px
- Wide: ≥ 1280px

Container Max-widths:
- Desktop: 1200px
- Wide: 1400px

Spacing Scale:
- Mobile: 1rem base
- Tablet: 1.5rem base  
- Desktop: 2rem base
- Wide: 2.5rem base
```

### Tools Created
1. **LAYOUT_ANALYSIS_REPORT.md** - Detailed analysis of all issues
2. **LAYOUT_DEBUG.js** - Browser tool to visualize problems
3. **CONTEXT_ENGINEERING_GUIDE.md** - How to maintain context

### Best Practices Going Forward
1. **Mobile First**: Always start with mobile design
2. **Container Based**: Use `.container-responsive` class
3. **Semantic Spacing**: Use device-specific space classes
4. **Test All Sizes**: Check mobile, tablet, desktop, wide
5. **Document Changes**: Update context files immediately


## 🔧 Fixed Job Page Client Display & Message Icon (2025-07-05)

### Problems Fixed
1. Job pages were showing "Unknown Client" instead of the actual client name
2. Message icon in job pages was not functional (no action when clicked)

### Root Causes
1. **Client Data Issue**: The `jobDataTransformer` was looking for `jobData.clients` but needed to handle both `clients` (from Supabase join) and `client` variations
2. **Message Icon Issue**: The `ClientContactButtons` component was ignoring the `onMessageClick` prop and had its own navigation logic that properly opens the messaging center

### Solutions Implemented
1. **Updated jobDataTransformer.ts**
   - Now handles both `jobData.clients` and `jobData.client` for flexibility
   - Added `title` field to JobInfo type and transformer

2. **Fixed JobDetailsHeader.tsx**
   - Removed duplicate handler functions that were trying to open SMS directly
   - Now uses the proper `job.client` property instead of `job.client?.name`
   - Simplified to let ClientContactButtons handle navigation

3. **ClientContactButtons Behavior**
   - Component navigates to `/connect` page with proper parameters
   - Opens messaging center with client pre-selected
   - Better UX than opening native SMS app

### Files Modified
- `/src/components/jobs/context/utils/jobDataTransformer.ts`
- `/src/components/jobs/context/types.ts`
- `/src/components/jobs/JobDetailsHeader.tsx`
- `/src/components/jobs/header/ClientContactButtons.tsx`

### Result
- Job pages now correctly display client names
- Message icon opens the messaging center with the client pre-selected
- Call icon opens the call center with the client pre-selected
- Email icon opens the email center with the client pre-selected
- Edit icon navigates to the client details page


## 🔧 Fixed Job Page Client Display & Message Icon (2025-07-05)

### Problems Fixed
1. Job pages were showing "Unknown Client" instead of the actual client name
2. Message icon in job pages was not opening the messaging center when clicked

### Root Causes
1. **Client Data Issue**: The JobDetailsHeader was only looking for `job.client` but the client data from the join query was in `job.clients`
2. **Message Icon Issue**: Empty callback functions were being passed to ClientContactButtons, overriding the default navigation behavior

### Solutions Implemented
1. **Updated JobDetailsHeader.tsx**
   - Changed subtitle to check both `job.clients?.name` and `job.client` for flexibility
   - Removed empty `onCallClick` and `onMessageClick` callbacks that were blocking functionality

2. **Updated JobInfoSection.tsx**
   - Made `onCallClick` and `onMessageClick` props optional
   - Allows ClientContactButtons to use its default navigation logic

3. **Enhanced jobDataTransformer.ts**
   - Better handling of client data extraction
   - Added `clients` property to JobInfo type to store full client object
   - Improved logging for debugging

### Files Modified
- `/src/components/jobs/JobDetailsHeader.tsx`
- `/src/components/jobs/header/JobInfoSection.tsx`
- `/src/components/jobs/context/utils/jobDataTransformer.ts`
- `/src/components/jobs/context/types.ts`

### Result
- Job pages now correctly display client names from the database
- Message icon opens the messaging center with the client pre-selected
- Call icon opens the call center with the client pre-selected
- Email icon opens the email center with the client pre-selected
- Edit icon navigates to the client details page


## 🎨 Job Header Redesign (2025-07-05)

### Changes Made
1. **Simplified Job Title**
   - Now shows only "Job J-2006" in the main header
   - Removed client name and job type from the subtitle

2. **Enhanced Status Section**
   - Added client name and job type next to the status badge
   - Information displayed in the blue gradient status bar
   - Format: Status Badge • Client Name • Job Type
   - Clean separator dots between elements

### Files Modified
- `/src/components/jobs/JobDetailsHeader.tsx` - Removed subtitle, added props to JobInfoSection
- `/src/components/jobs/header/JobInfoSection.tsx` - Added client name and job type display

### Visual Result
- Cleaner header with just the job number
- All relevant information (status, client, job type) grouped together in the status section
- Better visual hierarchy and organization


## 🎨 Job Status Section Layout Update (2025-07-05)

### Changes Made
1. **Vertical Layout for Status Section**
   - Changed from horizontal inline layout to vertical stacked layout
   - Client name and job type now appear on separate lines under the status badge

2. **Larger Font Sizes**
   - Client name: `text-base sm:text-lg font-semibold` (16px/18px, bold)
   - Job type: `text-sm sm:text-base` (14px/16px)
   - Status badge: Increased to `text-sm h-7` (from `text-xs h-6`)

3. **Better Spacing**
   - Added `space-y-2` between elements for better readability
   - Increased padding from `p-2` to `p-3` in the status container
   - Added `mb-2` margin after the status label

### Visual Result
- More prominent display of client name
- Better hierarchy with larger, bolder fonts
- Cleaner vertical layout instead of cramped horizontal layout
- Improved readability on all devices


## 🌍 International SMS Support for USA, Canada, and Spain (2025-07-05)

### Problem Fixed
SMS sending was failing when users entered phone numbers without country codes, especially for international numbers.

### Solution Implemented

1. **Enhanced Phone Number Formatting in telnyx-sms Edge Function**
   - Automatically detects and formats phone numbers for USA, Canada, and Spain
   - USA/Canada numbers: 10 digits → +1XXXXXXXXXX
   - Spain numbers: 9 digits starting with 6 or 7 → +34XXXXXXXXX
   - Handles numbers with country codes already included
   - Better error messages for invalid phone numbers

2. **Improved User Interface in UniversalSendDialog**
   - Added helpful blue info box showing supported phone formats
   - Examples: US/Canada: (555) 123-4567 or 5551234567
   - Examples: Spain: +34 612345678 or 34612345678
   - Clear instruction to include country code for non-US/Canada numbers
   - Updated placeholder text to show better examples
   - Improved validation error messages with specific examples

3. **Phone Number Validation**
   - Accepts 10-15 digits (standard international phone number length)
   - Removes non-digit characters for validation
   - Provides clear feedback when phone number format is invalid

### Supported Countries
- **USA/Canada**: 10-digit numbers automatically get +1 prefix
- **Spain**: 9-digit mobile numbers (starting with 6 or 7) automatically get +34 prefix

### Edge Function Updates
- `telnyx-sms`: Enhanced with robust phone formatting logic for target countries
- Better error handling and logging
- Automatic country code detection for supported countries

### Files Modified
- `/src/components/jobs/dialogs/shared/UniversalSendDialog.tsx` - Enhanced UI with better hints
- `/src/utils/phoneUtils.ts` - Updated suggestions for target countries
- Edge function `telnyx-sms` - Improved phone number formatting logic

### Result
- SMS can now be sent to USA, Canada, and Spain without requiring users to know exact formatting
- Automatic country code detection for supported countries
- Clear guidance for users on how to enter phone numbers
- Works with various formats: 5551234567, (555) 123-4567, 612345678, +34612345678
