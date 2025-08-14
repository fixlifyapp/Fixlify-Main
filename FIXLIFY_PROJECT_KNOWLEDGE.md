# Fixlify Project Knowledge Base

## Project Overview
Fixlify is a comprehensive repair shop management system built with Next.js, Supabase, and modern web technologies. It provides tools for managing repairs, customers, inventory, communications, and business operations.

## Key Features
- Customer & Job Management
- Inventory Control
- Automated Communications (SMS/Email)
- AI-Powered Tools
- Multi-location Support
- Real-time Updates

## Technical Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Realtime)
- **Communications**: Telnyx for SMS, Mailgun for Email
- **AI Integration**: OpenAI, Claude, Perplexity APIs
- **Deployment**: Vercel/Supabase Cloud

## Context Engineering Documents
- **Send Estimate/Invoice System**: See `CONTEXT_SEND_ESTIMATE_INVOICE.md`
- **Automation System Plan**: See `FIXLIFY_AUTOMATION_SYSTEM_PLAN.md`

## Recent Fixes & Updates

### August 2025 Updates

#### FIXED: Job System Type Consolidation (August 4, 2025)
- **Issue**: 67+ duplicate Job interface definitions across the codebase causing type safety issues
- **Root Cause**: 
  1. No single source of truth for Job type
  2. Each component/hook defined its own Job interface
  3. Mixed field names (revenue vs total, client_id vs clientId)
  4. Database had mixed case status values
- **Solution Applied**:
  1. Created central Job type definition in `src/types/job.ts`
  2. Database fixes:
     - Migrated status values from mixed case to lowercase with underscores
     - Added check constraint for valid status values
     - Created 18 performance indexes on commonly queried fields
  3. Updated all components and hooks to use central type
  4. Maintained backward compatibility for field names
  5. Fixed workflow builder to use `job.revenue` instead of `job.total`
- **Remaining Items**:
  - Duplicate hooks (useJobsOptimized, useJobsConsolidated) kept for pagination support
  - Both `revenue`/`total` and `client_id`/`clientId` supported for compatibility
- **Status**: ✅ Fixed - Type safety improved, no breaking changes

#### COMPLETED: Job System Type Consolidation (August 4, 2025)

### Edge Functions Fixed (January 10, 2025)

#### SMS/Email Communication System
**Issue**: SMS and email functions not working across estimates, invoices, messages, and automations
**Root Causes**:
1. Automation executor calling wrong function (`telnyx-sms` instead of `send-sms`)
2. Missing source phone number configuration
3. No default phone number in database

**Solution Applied**:
1. Updated `automation-executor` edge function to call correct `send-sms` function
2. Fixed `send-sms` to handle phone number lookup and use default if needed
3. Added default phone number (+18335743145) for SMS operations
4. Ensured all communication tables exist with proper RLS

**Edge Functions Currently Active**:
- `send-sms` - Handles all SMS sending (estimates, invoices, messages, automations)
- `mailgun-email` - Handles all email sending
- `send-estimate` - Sends estimates via email
- `send-invoice` - Sends invoices via email
- `automation-executor` - Executes automation workflows with email/SMS actions
- `generate-with-ai` - AI text generation
- Other AI/telephony functions for voice features

**Status**: ✅ Fixed - All communication channels working

### SMS/Email Edge Functions Configuration (January 10, 2025)

#### Working Edge Functions Setup
**SMS Functions**:
- `send-sms` - Primary SMS sending function used by estimates/invoices
- `telnyx-sms` - Alternative SMS function used by messages/conversations
- Both use Telnyx number: `+14375249932`
- Both handle multiple parameter formats (to/recipientPhone, message/text)

**Email Function**:
- `mailgun-email` - Handles all email sending
- Uses Mailgun API with domain `mg.fixlify.app`

**Required Environment Variables** (in Supabase Edge Functions secrets):
- `TELNYX_API_KEY` - Your Telnyx API key
- `TELNYX_MESSAGING_PROFILE_ID` - Optional, can be omitted
- `MAILGUN_API_KEY` - Your Mailgun API key
- `MAILGUN_DOMAIN` - Default: mg.fixlify.app

**Important Notes**:
1. Phone number must be verified/purchased in Telnyx account
2. Both `send-sms` and `telnyx-sms` functions exist for backward compatibility
3. Functions use `@supabase/supabase-js@2` import (not @2.7.1 which causes errors)
4. Don't use messaging_profile_id if not configured in Telnyx

**Components Using These Functions**:
- Estimates/Invoices: `send-sms`
- Messages/Conversations: `telnyx-sms`
- Automations: `send-sms` (via automation-executor)
- Email features: `mailgun-email`

**Status**: ✅ All communication functions operational


### AI Dispatcher System Fixed (January 14, 2025)

#### Issue
AI Dispatcher toggle functionality not working - missing edge function and improper configuration

#### Root Causes
1. No `ai-dispatcher-handler` edge function existed
2. Frontend was calling non-existent edge functions (`manage-ai-dispatcher`, `telnyx-phone-numbers`)
3. AI dispatcher configurations table existed but was not being populated

#### Solution Applied
1. **Created `ai-dispatcher-handler` edge function** with actions:
   - `enable` - Enable AI dispatcher and create config
   - `disable` - Disable AI dispatcher
   - `update_config` - Update AI configuration
   - `get_config` - Get current configuration
   - `handle_call` - Handle incoming AI calls

2. **Updated frontend components**:
   - `PhoneNumbersList.tsx` - Fixed toggleAIDispatcher to use new edge function
   - `PhoneNumberManagementPage.tsx` - Updated to use ai-dispatcher-handler

3. **Database structure verified**:
   - `phone_numbers` table has `ai_dispatcher_enabled` field
   - `ai_dispatcher_configs` table exists for storing AI settings
   - `ai_dispatcher_call_logs` table for call history

#### Testing
Created `test-ai-dispatcher.js` script to verify functionality in browser console

#### Status
✅ **Fixed** - AI Dispatcher can now be toggled and configured properly



### AI Dispatcher System - Hybrid Approach (August 12, 2025)

#### Implementation Strategy
Using **Hybrid Approach**: Telnyx AI Assistant + MCP Server + Dynamic Variables

**Components**:
1. **Telnyx AI Assistant** (`assistant-6f3d8e8f-2351-4946-9...`) - Voice handling
2. **MCP Server** (`c646fbf5-a768-49eb-b8d2-f2faeb116154`) - Integrations
3. **Dynamic Variables Webhook** (`ai-assistant-webhook`) - Personalization
4. **Supabase Integration** - Database operations

#### Edge Functions Created
1. **`ai-assistant-webhook`** - Returns dynamic variables for AI personalization
2. **`telnyx-mcp-handler`** - Handles MCP events and integrations
3. **`mcp-tools-handler`** - Custom tools for AI actions

#### Database Schema
**`ai_dispatcher_configs` table** - Comprehensive configuration:
- Business information (name, niche, address, etc.)
- AI agent settings (name, personality, voice)
- Operating hours (per day, timezone)
- Services & offerings
- Pricing information
- Call scripts (greeting, hold, transfer)
- Appointment settings
- Knowledge base (FAQs, policies)
- Integration settings
- Analytics configuration

#### UI Components
**`AIDispatcherConfiguration.tsx`** - Complete configuration interface:
- 6 tabs: Business, Voice & AI, Hours, Services, Scripts, Advanced
- Real-time preview and testing
- Save/load configurations
- Test call functionality

#### Configuration Variables Available
Business: `{{business_name}}`, `{{business_niche}}`, `{{business_address}}`
AI: `{{agent_name}}`, `{{agent_personality}}`, `{{voice_id}}`
Hours: `{{hours_of_operation}}`, `{{timezone}}`, `{{emergency_services}}`
Services: `{{services_offered}}`, `{{specialties}}`, `{{service_areas}}`
Real-time: `{{current_date}}`, `{{current_time}}`, `{{current_wait_time}}`
Customer: `{{caller_number}}`, `{{customer_status}}`, `{{customer_history}}`
Pricing: `{{price_range}}`, `{{payment_methods}}`, `{{warranty_policy}}`

#### Key Benefits
- **Multi-tenant support** - Each business gets custom AI behavior
- **Real-time personalization** - Dynamic variables per call
- **Scalable architecture** - Handles unlimited businesses
- **Cost-effective** - ~$0.025 per minute
- **Quick deployment** - Launch in hours, not weeks

#### Status
✅ **Implemented** - Full hybrid system ready for production

### Phone Configuration Page Enhancements (August 14, 2025)

#### Business Niche System
**15 Pre-configured Business Types** with auto-population:
1. HVAC - Heating & cooling specialists
2. Plumbing - Water & pipe services
3. Electrical - Power & wiring experts
4. Roofing - Roof repair & replacement
5. Landscaping - Lawn & garden care
6. Cleaning - Residential & commercial cleaning
7. Pest Control - Extermination services
8. Locksmith - Security & lock services
9. Appliance Repair - Home appliance fixes
10. Computer Repair - Tech support & repairs
11. Auto Repair - Vehicle maintenance
12. Home Security - Alarm & camera systems
13. Garage Door - Installation & repair
14. Carpet Cleaning - Floor care specialists
15. Window Cleaning - Glass & window services

**Auto-populated Fields per Niche**:
- AI Capabilities (7 specific functions)
- Services Offered (industry-specific list)
- Greeting Message (customized template)
- Agent Personality (professional tone)

#### Mobile-Responsive Design Updates
**Text & Readability**:
- Base 16px font size for all inputs
- Bold labels with font-medium class
- Improved contrast (gray-600/gray-400)
- Line-height: relaxed for better readability

**Form Elements**:
- Minimum 44px touch targets on mobile
- Consistent spacing (space-y-2)
- Larger textareas (min-h-100px to 150px)
- Monospace font for capabilities field

**Responsive Layout**:
- Max-width container (4xl) for desktop
- Responsive padding (px-4 mobile, px-6 tablet, px-8 desktop)
- Buttons stack vertically on mobile
- Full-width save button with prominent styling

**Button Improvements**:
- Save button: py-4, text-lg, font-semibold
- Test button: py-3, text-base, font-medium
- Icon sizes increased from h-4 to h-5
- Better hover states with /90 opacity

#### Files Modified
- `/src/pages/settings/PhoneNumberConfigPage.tsx` - Main configuration page
- `/src/config/niche-capabilities.ts` - Niche data and templates
- `/src/utils/business-niches.ts` - Business type definitions
- `/src/styles/phone-config.css` - Responsive styling rules

#### Current Status
✅ **Fully Functional** - Phone configuration page with business niche selection, auto-population, and mobile-responsive design