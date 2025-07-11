# Supabase Comprehensive Check & Cleanup Plan

## 1. Edge Functions Analysis

### Duplicate Functions to Remove:
- **send-invoice-email** (old) → Keep **send-invoice** (new)
- **email-send** → Keep **mailgun-email**
- Multiple Telnyx webhooks → Consolidate

### SMS/Telnyx Functions:
- ✅ **telnyx-sms** - Core SMS sending (needs API key update)
- ✅ **send-invoice-sms** - Invoice SMS
- ✅ **send-estimate-sms** - Estimate SMS
- ✅ **telnyx-webhook** - Incoming SMS handler
- ✅ **telnyx-voice-webhook** - Voice calls
- **telnyx-webhook-handler** - Duplicate?
- **telnyx-webhook-router** - Duplicate?
- **telnyx-phone-numbers** - Phone management
- **manage-phone-numbers** - Duplicate?

### Email/Mailgun Functions:
- ✅ **mailgun-email** - Core email sending
- ✅ **send-invoice** - Invoice emails
- ✅ **send-estimate** - Estimate emails
- ✅ **mailgun-webhook** - Email tracking
- **send-contact-email** - Keep for contact form
- **track-email-open** - Email analytics

### Functions Needing API Key Updates:
All Telnyx functions need redeployment with new API key.

## 2. Database Components to Check

### Tables:
- `telnyx_phone_numbers` - Phone inventory
- `telnyx_messaging_profiles` - SMS profiles
- `estimate_communications` - ✅ Fixed (added client_id)
- `invoice_communications` - ✅ Fixed (added client_id)
- `communication_logs` - General logs
- `mailgun_domains` - Email domains
- `email_templates` - Email templates

### Functions/Hooks:
- Database functions that might use old API keys
- Triggers that might need updates
- RLS policies

## 3. Environment Variables to Update
- `TELNYX_API_KEY` - New API key
- `MAILGUN_API_KEY` - Verify current
- `TELNYX_CONNECTION_ID` - If changed

## 4. Frontend Services to Check
- Email service configurations
- SMS service configurations
- Webhook URLs
