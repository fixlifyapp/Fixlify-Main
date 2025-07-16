# FIXLIFY PROJECT KNOWLEDGE

## SMS/Email Communication System (Updated January 2025)

### Overview
Complete two-way SMS conversation system integrated with Telnyx for SMS messaging. Email functionality pending implementation with Mailgun.

### Database Schema
- `phone_numbers` - Stores user phone numbers for SMS sending
- `communication_logs` - Tracks all SMS/email communications with full audit trail
- `message_templates` - Reusable message templates with variable substitution
- `organization_communication_settings` - Organization-wide communication settings
- `sms_conversations` - SMS conversation threads between users and clients
- `sms_messages` - Individual SMS messages within conversations

### Edge Functions
- `send-sms` - Main SMS sending function with Telnyx integration and automatic phone number formatting
- `sms-webhook` - Webhook handler for incoming SMS messages and status updates (handles unknown numbers)
- `send-estimate` - Send estimates via email with portal links
- `send-invoice` - Send invoices via email with payment links
- `generate-with-ai` - AI generation for business insights and analytics
- `send-contact-email` - Handles contact form email submissions
- `automation-executor` - Executes automation workflows
- `reports-run` - Generates report data based on templates
- `reports-templates` - Provides report template definitions
- `intelligent-ai-assistant` - Provides AI-powered assistance and recommendations

### Features Implemented
1. **SMS Sending**: Full SMS capability via Telnyx API with automatic phone formatting
2. **Two-way SMS Conversations**: Real-time messaging interface in Connect Center
3. **Phone Number Management**: Users can have multiple phone numbers with primary designation
4. **Communication Logging**: All communications tracked with status updates
5. **Message Templates**: Reusable templates with variable substitution
6. **Error Handling**: Comprehensive error tracking and user feedback
7. **Security**: RLS policies ensure users only see their own data
8. **Real-time Updates**: Live message updates using Supabase realtime subscriptions
9. **Conversation Management**: Create, view, and manage SMS conversations with clients
10. **Unread Counts**: Track unread messages per conversation
11. **Unknown Number Handling**: Automatically creates temporary clients for unknown numbers
12. **Auto Client Creation**: New clients are created when messages arrive from unknown numbers

### Testing
- SMS conversations available in Connect Center at `/communications`
- Test page available at `/sms-test` when logged in
- Requires Telnyx API credentials in Supabase secrets
- User must have a primary phone number configured in the database
- Unknown numbers automatically create new client records

### Configuration Required
1. Set `TELNYX_API_KEY` in Supabase edge function secrets
2. Optionally set `TELNYX_MESSAGING_PROFILE_ID`
3. Add user phone numbers to `phone_numbers` table and mark one as primary
4. Configure webhook URL in Telnyx portal: `https://[your-project].supabase.co/functions/v1/sms-webhook`

### Next Steps
- Phase 4: Integrate SMS into estimate and invoice sending
- Phase 5: Add Mailgun email support
- Phase 6: Full integration across automations and client portal
- Phase 7: Add SMS templates and quick replies
- Phase 8: Implement message search and filtering

### Recent Updates (January 2025)
- Fixed incoming SMS from new numbers not appearing in Connect Center
- Updated sms-webhook edge function to handle "cold start" scenario
- Now creates new conversations automatically when receiving messages from unknown numbers
- SMS webhook properly manages conversation lifecycle
- Removed deprecated edge functions (telnyx-webhook, exec-sql, update-profiles-schema) for security and maintenance
- **FIXED: Telnyx "Invalid 'to' address" Error** (January 2025)
  - Root cause: Phone numbers stored in inconsistent formats (some with +1, some without)
  - Telnyx API requires E.164 format: `+1XXXXXXXXXX` (e.g., `+14375249932`)
  - Solution: Created `send-sms` Edge Function with automatic phone number formatting
  - The function converts any format to E.164: `4377476737` → `+14377476737`
  - Also fixed missing `userId` parameter in all SMS sending locations
- **ENHANCED: Unknown Number Handling** (January 2025)
  - SMS webhook now automatically creates temporary clients for unknown numbers
  - Client name format: "Unknown (+1XXXXXXXXXX)"
  - Auto-generated notes include timestamp of first contact
  - Conversations work seamlessly without manual client creation
  - Users can update client information later as needed
- **FIXED: Telnyx Duplicate SMS Messages** (January 2025)
  - Root cause: Webhook handler was not responding quickly enough, causing Telnyx to retry
  - Solution: Immediate 200 response to acknowledge receipt, then async processing
  - Added deduplication using unique message IDs (external_id field)
  - Database changes: Added unique constraint on sms_messages.external_id
  - New table: sms_opt_outs for tracking STOP keywords
  - Webhook now properly handles DOWN, STOP, UNSUBSCRIBE keywords
  - Test script available: test-sms-webhook.js
- **FIXED: Telnyx Webhook 401 Authorization Error** (January 2025)
  - Root cause: Supabase edge functions expect JWT authentication by default, but webhooks don't send JWT tokens
  - Solution: Disabled JWT verification for sms-webhook function
  - Implementation:
    - Added configuration in `supabase/config.toml`:
      ```toml
      [functions.sms-webhook]
      verify_jwt = false
      ```
    - Redeployed function with: `npx supabase functions deploy sms-webhook --no-verify-jwt`
  - Result: Webhook accepts requests from Telnyx without authentication headers
  - SMS functionality unchanged, only removed error logs in Telnyx debug console

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