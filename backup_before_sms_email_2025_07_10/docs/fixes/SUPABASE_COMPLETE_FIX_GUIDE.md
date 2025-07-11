# Supabase Complete Setup & Fix Guide

## 🚨 IMPORTANT: Services Update Required

### 1. Frontend Service Updates Needed

**File: `/src/services/communication-service.ts`**
- Line 33: Change `'send-email'` to `'mailgun-email'`
- This is causing email sending to fail!

### 2. Edge Functions Status

#### ✅ Email Functions (Working)
- `mailgun-email` - Core email sending
- `send-invoice` - Invoice email sending
- `send-estimate` - Estimate email sending
- `mailgun-webhook` - Email tracking webhook

#### ⚠️ SMS Functions (Need API Key Update)
- `telnyx-sms` - Core SMS sending
- `send-invoice-sms` - Invoice SMS
- `send-estimate-sms` - Estimate SMS
- `telnyx-webhook` - Incoming SMS handler

#### ✅ Removed Duplicates
- `send-invoice-email` - Deleted (use `send-invoice`)
- `email-send` - Deleted (use `mailgun-email`)

## 🔧 Immediate Actions Required

### 1. Fix Frontend Code
```typescript
// In /src/services/communication-service.ts, line 33
// Change from:
await supabase.functions.invoke('send-email', {

// To:
await supabase.functions.invoke('mailgun-email', {
```

### 2. Update Telnyx API Key
```bash
# Run this command and enter your new Telnyx API key
supabase secrets set TELNYX_API_KEY=your_new_key_here
```

### 3. Redeploy Telnyx Functions
```bash
# Run the batch file I created:
redeploy_telnyx_functions.bat
```

## 📋 Complete Supabase CLI Instructions

### Project Info
- **Project ID**: mqppvcrlvsgrsqelglod
- **CLI Version**: 2.30.4
- **Access Token**: Already configured

### Essential Commands

#### Edge Functions
```bash
supabase functions list                    # List all functions
supabase functions deploy <name>           # Deploy specific function
supabase functions delete <name>           # Delete function
supabase functions deploy                  # Deploy all functions
```

#### Database
```bash
supabase db push                          # Run migrations
supabase gen types typescript --local     # Generate TypeScript types
supabase migration new <name>              # Create new migration
supabase db dump -f schema.sql            # Export schema
```

#### Secrets/Environment Variables
```bash
supabase secrets set KEY=value            # Set secret
supabase secrets list                     # List all secrets
supabase secrets unset KEY                # Remove secret
```

#### Project Management
```bash
supabase status                           # Check project status
supabase link --project-ref <id>          # Link to project
```

## 🔍 Two-Way SMS Configuration

### Webhook URLs
- **SMS Webhook**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
- **Voice Webhook**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`

### Database Tables
- `telnyx_phone_numbers` - Phone number inventory
- `telnyx_messaging_profiles` - SMS configuration
- `communication_logs` - All communications
- `estimate_communications` - Estimate-specific logs
- `invoice_communications` - Invoice-specific logs

## 📧 Email Configuration

### Mailgun Setup
- **Domain**: mg.fixlify.com
- **Webhook**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook`

### Email Functions
- `mailgun-email` - Generic email sending
- `send-invoice` - Invoice emails with templates
- `send-estimate` - Estimate emails with templates

## 🛠️ Quick Fix Scripts

### 1. Update All Secrets
```bash
# Run: update_secrets.bat
# This will prompt for API keys and update them
```

### 2. Redeploy Telnyx Functions
```bash
# Run: redeploy_telnyx_functions.bat
# This will redeploy all SMS-related functions
```

### 3. Check Database Components
```sql
-- Run in Supabase SQL editor: check_database_components.sql
-- This will show all functions, triggers, and logs
```

## ✅ Verification Steps

1. **Check Edge Functions**:
   ```bash
   supabase functions list
   ```

2. **Test SMS Sending**:
   - Try sending an invoice SMS
   - Check logs: Dashboard > Functions > telnyx-sms > Logs

3. **Test Email Sending**:
   - Try sending an invoice email
   - Check logs: Dashboard > Functions > mailgun-email > Logs

4. **Check Webhooks**:
   - Send a test SMS to your number
   - Check webhook logs in database

## 🚀 Next Steps

1. Fix the frontend code issue
2. Update Telnyx API key
3. Redeploy SMS functions
4. Test both email and SMS sending
5. Monitor logs for any errors

## 📝 Notes
- Always work from project directory
- Use `--debug` flag for troubleshooting
- Check Supabase Dashboard for visual logs
- Keep API keys secure
