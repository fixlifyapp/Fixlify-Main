# Supabase CLI Complete Instructions

## Installation & Setup ✅
- **CLI Version**: 2.30.4
- **Project ID**: mqppvcrlvsgrsqelglod
- **Project Directory**: C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main

## Available Supabase CLI Commands

### 1. Edge Functions Management
```bash
# List all edge functions
supabase functions list

# Deploy a function
supabase functions deploy <function-name>

# Delete a function
supabase functions delete <function-name>

# View function logs
supabase functions logs <function-name>

# Deploy all functions in directory
supabase functions deploy

# Serve functions locally for testing
supabase functions serve
```

### 2. Database Management
```bash
# Run migrations
supabase db push

# Create a new migration
supabase migration new <migration-name>

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts

# Run SQL directly
supabase db execute -f <sql-file>

# Dump database schema
supabase db dump -f schema.sql

# View migration status
supabase migration list
```

### 3. Environment & Secrets Management
```bash
# Set secrets (environment variables)
supabase secrets set TELNYX_API_KEY=your_key
supabase secrets set MAILGUN_API_KEY=your_key

# List secrets
supabase secrets list

# Delete a secret
supabase secrets unset SECRET_NAME
```

### 4. Project Management
```bash
# Check project status
supabase status

# Link to a project
supabase link --project-ref <project-id>

# Unlink project
supabase unlink

# Start local development
supabase start

# Stop local development
supabase stop
```

### 5. Storage Management
```bash
# List storage buckets
supabase storage ls

# Create a bucket
supabase storage create <bucket-name>

# Upload files
supabase storage cp <local-path> <bucket-path>

# Download files
supabase storage cp <bucket-path> <local-path>
```

### 6. Auth Management
```bash
# List auth users (requires service role)
supabase auth users list

# Generate types for auth
supabase gen types typescript --schema auth
```

## Project Structure
```
Fixlify-Main-main/
├── supabase/
│   ├── .temp/
│   │   └── project-ref      # Project reference
│   ├── functions/           # Edge functions
│   │   ├── send-invoice/
│   │   ├── send-estimate/
│   │   └── [other-functions]/
│   ├── migrations/          # Database migrations
│   └── config.toml         # Supabase config
```

## Current Issues to Fix

### 1. Telnyx Functions Need Redeployment
All Telnyx-related edge functions need to be redeployed with the new API key:
- telnyx-sms
- send-invoice-sms
- send-estimate-sms
- telnyx-webhook
- telnyx-voice-webhook
- And others...

### 2. Duplicate Functions to Remove
- send-invoice-email (use send-invoice instead)
- email-send (use mailgun-email instead)

### 3. Environment Variables to Update
```bash
supabase secrets set TELNYX_API_KEY=<new-key>
supabase secrets set MAILGUN_API_KEY=<verify-current>
supabase secrets set TELNYX_CONNECTION_ID=<if-needed>
```

## Quick Commands for Current Tasks

### Redeploy All Telnyx Functions
```bash
# Windows batch command
for %f in (telnyx-sms send-invoice-sms send-estimate-sms telnyx-webhook) do supabase functions deploy %f
```

### Check Function Logs
```bash
# Check SMS sending logs
supabase functions logs telnyx-sms --tail

# Check email sending logs
supabase functions logs mailgun-email --tail
```

### Update Database Types
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

## Important URLs
- **Telnyx Webhook**: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
- **Mailgun Webhook**: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook
- **Dashboard**: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod

## Notes
- Always work from the project directory
- Use `--debug` flag for troubleshooting
- Check logs after deployments
- Keep secrets secure and never commit them
