# Email and SMS Testing Instructions for Fixlify

## Overview
This guide provides instructions for testing the email and SMS functionality in your Fixlify application. All edge functions have been updated to properly handle CORS and include portal links.

## Prerequisites
1. Ensure you have the following environment variables set in Supabase:
   - `MAILGUN_API_KEY` - Your Mailgun API key
   - `TELNYX_API_KEY` - Your Telnyx API key  
   - `TELNYX_CONNECTION_ID` (optional) - Your Telnyx connection ID

2. Ensure you have an active Telnyx phone number assigned to your user in the `telnyx_phone_numbers` table

## Testing from the Application

### Testing Estimate Email/SMS
1. Navigate to the Estimates page in your Fixlify app
2. Find an estimate you want to send
3. Click the "Send" button or action menu
4. Choose either "Send Email" or "Send SMS"
5. Enter the recipient's email or phone number
6. Optionally add a custom message
7. Click "Send"

### Testing Invoice Email/SMS  
1. Navigate to the Invoices page in your Fixlify app
2. Find an invoice you want to send
3. Click the "Send" button or action menu
4. Choose either "Send Email" or "Send SMS"
5. Enter the recipient's email or phone number
6. Optionally add a custom message
7. Click "Send"

## Testing with cURL

### Get your authentication token
First, get your Supabase anon key from the environment variables or project settings.

### Test Estimate Email
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "estimateId": "ESTIMATE_ID_HERE",
    "recipientEmail": "test@example.com"
  }'
```

### Test Estimate SMS
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "estimateId": "ESTIMATE_ID_HERE", 
    "recipientPhone": "+1234567890"
  }'
```

### Test Invoice Email
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "invoiceId": "INVOICE_ID_HERE",
    "recipientEmail": "test@example.com"
  }'
```

### Test Invoice SMS
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-invoice-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "invoiceId": "INVOICE_ID_HERE",
    "recipientPhone": "+1234567890"
  }'
```

## Verifying Success

### Check Function Logs
1. Go to your Supabase dashboard
2. Navigate to Edge Functions
3. Click on the function you want to check
4. View the logs to see detailed information about the request

### Check Communication Logs
- For estimates: Check the `estimate_communications` table
- For invoices: Check the `invoice_communications` table

### Verify Portal Links
All emails and SMS messages include portal links that allow clients to:
- View their estimates/invoices
- Access without logging in (secure token-based access)
- Links are valid for 72 hours by default

## Common Issues and Solutions

### CORS Errors
The functions have been updated to handle CORS properly. The OPTIONS request is handled first before any other logic.

### Authentication Errors
- Ensure you're including both `Authorization` and `apikey` headers
- Use `Bearer YOUR_TOKEN` format for Authorization header

### Phone Number Format
- Phone numbers should include country code (e.g., +1 for US)
- The system will automatically format phone numbers
- Minimum 10 digits required

### Missing Phone Number
Ensure you have an active phone number in the `telnyx_phone_numbers` table with:
- `status = 'active'`
- `user_id` assigned to your user

## Testing Portal Links

1. After sending an email/SMS, check the communication logs for the `portal_link_included` field
2. The portal link format is: `https://hub.fixlify.app/portal/{token}`
3. Test the link in an incognito/private browser window to verify it works without authentication

## Support

If you encounter any issues:
1. Check the Edge Function logs in Supabase dashboard
2. Verify all environment variables are set correctly
3. Ensure your Mailgun domain is verified and configured
4. Ensure your Telnyx account has credits and phone numbers are properly configured
