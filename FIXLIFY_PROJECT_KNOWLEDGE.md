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

## Recent Fixes & Updates

### Performance Optimization (July 22, 2025)
- **Bundle Size Reduced by 87%!**
  - Initial bundle: 2.28 MB → 296 KB
  - Implemented code splitting with manual chunks
  - Added lazy loading for non-critical routes
  - Removed unused dependencies (Three.js - 66 packages)
- **Code Splitting Strategy**:
  - react-vendor: 163 KB (React core)
  - ui-vendor: 214 KB (UI components)
  - supabase: 114 KB (Supabase SDK)
  - forms: 81 KB (Form libraries)
  - charts: 417 KB (Chart libraries)
- **Build Performance**: ~15s build time maintained
- **Impact**: Dramatically improved initial load times

### July 2025 Updates

- **FIXED: SMS Context Display Error** (July 2025)
  - Issue: SMSContext trying to display as React element when switching to Connect Center
  - Root cause: Incorrect import of SMSContext instead of SMSProvider
  - Solution: Import and use SMSProvider component properly in layout
  - Result: Connect Center SMS tab now loads without errors
- **FIXED: Send SMS Database Error** (July 2025)
  - Issue: Foreign key constraint violation when sending SMS
  - Root cause: sms_messages table had FK constraint to non-existent sms_conversation_messages
  - Solution: 
    - Dropped incorrect FK constraint
    - SMS messages now properly reference sms_conversations table
    - Updated Edge Function to handle message insertion properly
    - Don't throw errors on message insert failures (SMS already sent)
  - Result: SMS messages send correctly without database errors
- **FIXED: Estimate/Invoice Line Items Foreign Key Error** (July 2025)
  - Root cause: Edge functions were trying to query line_items table with foreign key relationship that doesn't exist
  - Estimates and invoices store items in JSONB column, not separate line_items table
  - Solution:
    - Updated send-estimate edge function to use JSONB items field
    - Updated send-invoice edge function to use JSONB items field
    - Added proper handling for different item field names (description/name, unit_price/rate/amount)
    - Added "No line items" message when items array is empty
  - Result: Estimate and invoice emails send successfully without database errors
- **FIXED: Two-Way SMS Implementation** (July 2025)
  - **Outbound SMS**: Already working via send-sms edge function
  - **Inbound SMS**: Fixed webhook configuration
  - Solution:
    - Deployed sms-webhook with `--no-verify-jwt` flag (required for external webhooks)
    - Added webhook signature verification for security
    - Auto-creates client records for unknown numbers
    - Creates conversations and tracks unread counts
  - **Production Security**:
    - JWT disabled is standard for webhooks (Stripe, Twilio, etc use same pattern)
    - Added Telnyx signature verification (HMAC-SHA256)
    - Set TELNYX_WEBHOOK_SECRET in edge function secrets
    - Webhook only processes valid Telnyx payloads
  - Result: Full two-way SMS working in Connect Center
- **IMPLEMENTED: SMS Webhook Security** (July 2025)
  - **Production-Ready Configuration**:
    - JWT verification disabled (standard for webhooks)
    - Telnyx signature verification added
    - CORS headers configured
    - Request body validation
    - Error handling with proper status codes
  - **Security Features**:
    - Verifies telnyx-signature-ed25519 header
    - Validates timestamp to prevent replay attacks
    - Only processes valid Telnyx message payloads
    - Logs all operations for audit trail
  - **Auto-Client Creation**:
    - Unknown numbers create new client records
    - Sets appropriate defaults (individual, lead status)
    - Links conversations to client for tracking

### Technical Notes
- Uses Supabase edge functions for secure API key handling
- Implements proper error handling and retry logic
- Supports webhook callbacks for delivery confirmation and incoming messages
- All communications are logged for audit and debugging
- SMS conversations use database triggers to update last message and unread counts
- Context replaced MessageContext with SMSContext for cleaner implementation
- **Phone Number Format Requirements**:
  - Telnyx API requires E.164 format: `+` followed by country code and number
  - The `send-sms` Edge Function automatically formats phone numbers:
    - Removes all non-digit characters (spaces, dashes, parentheses)
    - Adds US country code (+1) if not present for 10-digit numbers
    - Validates final format matches E.164 pattern: `/^\+[1-9]\d{1,14}$/`
  - Always store phone numbers consistently in the database (preferably E.164)
  - Frontend can accept any format - conversion happens in the Edge Function
- **Unknown Number Handling**:
  - Webhook automatically creates client records for unknown numbers
  - Client type set to 'individual' with status 'lead'
  - Notes field documents auto-creation with timestamp
  - Conversations link to new client ID for proper tracking
  - All messages are logged with client metadata
- **Portal Token Security**:
  - All portal links now use secure random tokens (64 hex characters)
  - Tokens are generated using crypto.getRandomValues() for security
  - Tokens are stored in portal_access_token field in estimates/invoices tables
  - Portal routes validate token before displaying document
  - No direct ID exposure in URLs anymore
- **Webhook Security (Production)**:
  - JWT verification disabled is standard practice for webhooks
  - External services (Telnyx, Stripe, Twilio) cannot provide Supabase JWTs
  - Security implemented via:
    - HMAC-SHA256 signature verification
    - HTTPS only (enforced by Supabase)
    - Limited endpoint functionality
    - Request validation against Telnyx signature
  - TELNYX_WEBHOOK_SECRET must be set in edge function secrets


## Supabase Backup System (January 2025)

### Overview
Comprehensive backup system for Fixlify Supabase project including database, edge functions, migrations, and configuration.

### Backup Structure
```
supabase-backup/
├── database/
│   ├── tables/           # Individual table exports (JSON)
│   ├── export-commands.sql  # SQL export commands
│   └── full_backup_*.sql    # Complete database dumps
├── functions/            # Edge Functions (✅ Completed)
├── migrations/          # SQL migrations (✅ Completed) 
├── storage/             # Storage bucket files (manual)
├── config/              # Configuration templates
│   └── secrets.template.env  # Secrets template (no real values)
├── auth/                # Auth configuration docs
├── backup.bat           # Windows backup script
├── backup.sh            # Mac/Linux backup script
├── README.md            # Original backup guide
├── RESTORE_GUIDE.md     # Restoration instructions
└── BACKUP_INSTRUCTIONS.md  # Detailed backup instructions
```

### Backup Status
- ✅ Edge Functions: All copied from `supabase/functions`
- ✅ Migrations: All copied from `supabase/migrations`
- ✅ Configuration: Project config copied
- ✅ Documentation: Complete backup and restore guides
- ⚠️ Database: Scripts ready, manual execution required
- ⚠️ Storage Files: Manual download required
- ⚠️ API Keys/Secrets: Manual backup required

### Critical Tables
- profiles (4 records)
- clients (3 records)
- jobs (3 records)
- phone_numbers (1 record)
- products (35 records)
- Plus 50+ other tables

### Backup Methods
1. **Supabase Dashboard**: Download from backups page
2. **pg_dump**: Use provided scripts (recommended)
3. **SQL Export**: Manual queries in SQL editor

### Important URLs
- Database Backups: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/database/backups
- Edge Function Secrets: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
- Storage Buckets: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/storage/buckets
- API Settings: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api

### Next Steps for Complete Backup
1. Get database password from Supabase dashboard
2. Run `backup.bat` (Windows) or `backup.sh` (Mac/Linux)
3. Download storage files manually
4. Copy all API keys/secrets to secure location
5. Test restore on local Supabase instance