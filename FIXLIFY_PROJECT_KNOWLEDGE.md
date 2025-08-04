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
- **Communications**: Twilio/SendGrid/Telnyx for SMS/Email
- **AI Integration**: OpenAI, Claude, Perplexity APIs
- **Deployment**: Vercel/Supabase Cloud

## Context Engineering Documents
- **Send Estimate/Invoice System**: See `CONTEXT_SEND_ESTIMATE_INVOICE.md`
- **Automation System Plan**: See `FIXLIFY_AUTOMATION_SYSTEM_PLAN.md`

## Recent Fixes & Updates

### August 2025 Updates

#### FIXED: SMS Sending for Estimates and Invoices (August 3, 2025)
- **Issue**: SMS showed as sent but recipients didn't receive messages
- **Root Cause**: 
  1. Edge functions `send-estimate-sms` and `send-invoice-sms` were not deployed
  2. Telnyx API credentials not configured in Edge Function secrets
- **Solution Applied**:
  1. Deployed missing edge functions:
     - `send-estimate-sms` - Handles SMS sending for estimates
     - `send-invoice-sms` - Handles SMS sending for invoices  
     - `telnyx-sms` - Core SMS sending function
  2. All functions deployed with `--no-verify-jwt` flag for proper access
- **Required Configuration**:
  - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
  - Add these secrets:
    - `TELNYX_API_KEY` - Your Telnyx API key
    - `TELNYX_MESSAGING_PROFILE_ID` - Your Telnyx messaging profile ID
- **Status**: ✅ Edge functions deployed, awaiting API key configuration

#### FIXED: Duplicate Variable Declarations (August 3, 2025)
- **Issue**: TypeScript compilation error due to duplicate `user` variable declarations
- **Location**: `src/components/jobs/dialogs/unified/hooks/useDocumentOperations.ts`
- **Fix Applied**: 
  - Line 406: Renamed second `user` variable to `authUser` in convertToInvoice function
  - This prevents variable name conflicts between different functions in the same file
- **Status**: ✅ Resolved - No compilation errors

#### FIXED: Automation System Triggers (August 3, 2025)
- **Issue**: Automation triggers failing due to organization_id requirements
- **Fixes Applied**:
  1. Updated `handle_estimate_automation_triggers` function to work without organization_id
  2. Updated `handle_job_automation_triggers` function to work without organization_id
  3. Cleaned up duplicate triggers on jobs and estimates tables
  4. Ensured automation_execution_logs are created properly with pending status
- **Status**: ✅ Working - Automation logs are being created for job and estimate events

- **IMPLEMENTED: Two-Way Email System** (August 3, 2025)
  - **Overview**: Complete two-way email system using company-based email addresses
  - **Email Format**: `{company-name}@fixlify.app` (e.g., `kyky@fixlify.app`)
  - **Key Components**:
    - Database: Added `company_email_address` field to profiles and company_settings
    - Edge Functions:
      - `email-webhook`: Handles incoming emails from Mailgun (deployed)
      - `send-email`: Updated to use company email addresses as sender
    - Frontend Components:
      - `CompanyEmailSettings`: Manage company email addresses
      - Updated `EmailContext` to use new email system
  - **Features**:
    - Automatic company email generation based on company name
    - Inbound email processing via Mailgun webhook
    - Auto-client creation from unknown senders
    - Real-time email updates in Connect Center
    - Thread-based conversation tracking
  - **Configuration Required**:
    - Set up Mailgun route: `match_recipient(".*@fixlify.app")`
    - Configure webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/email-webhook`
    - Add MX records for fixlify.app domain
    - Set `MAILGUN_WEBHOOK_SECRET` in edge function secrets

## SMS Configuration Requirements

### Telnyx Setup
1. **Get Telnyx Account**:
   - Sign up at https://telnyx.com
   - Add credits to your account

2. **Create Messaging Profile**:
   - Go to Messaging > Messaging Profiles
   - Create a new profile
   - Copy the Profile ID

3. **Get API Key**:
   - Go to API Keys section
   - Create a new API key
   - Copy the key (shown only once)

4. **Purchase Phone Number**:
   - Go to Numbers > Search & Buy Numbers
   - Purchase a number with SMS capabilities
   - Assign it to your messaging profile

5. **Configure in Supabase**:
   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
   - Add:
     - `TELNYX_API_KEY`: Your API key from step 3
     - `TELNYX_MESSAGING_PROFILE_ID`: Your profile ID from step 2

6. **Add Phone Number in App**:
   - Go to Settings > Phone Numbers in the app
   - Add the phone number you purchased
   - Mark it as primary

## Testing SMS/Email Sending

### Test Estimate SMS:
1. Create or open an estimate
2. Click "Send" button
3. Select "SMS" option
4. Enter recipient phone number
5. Add optional message
6. Click Send

### Test Invoice SMS:
1. Create or open an invoice
2. Click "Send" button
3. Select "SMS" option
4. Enter recipient phone number
5. Add optional message
6. Click Send

### Debugging SMS Issues:
1. Check Edge Function logs: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions
2. Verify Telnyx credentials are set correctly
3. Ensure phone number exists in phone_numbers table
4. Check communication_logs table for error details
