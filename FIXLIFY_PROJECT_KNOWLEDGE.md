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
