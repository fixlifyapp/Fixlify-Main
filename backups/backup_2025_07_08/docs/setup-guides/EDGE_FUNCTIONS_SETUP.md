# Edge Functions Setup - Fixlify

## Current Status

I've successfully deployed the following edge functions:
- ✅ `send-estimate` - For sending estimates via email
- ✅ `send-invoice` - For sending invoices via email  
- ✅ `telnyx-sms` - For sending SMS messages via Telnyx

## What's Missing

The edge functions are deployed but need environment variables (secrets) to be configured in Supabase:

### Required Environment Variables

1. **MAILGUN_API_KEY** - Your Mailgun API key for sending emails
2. **TELNYX_API_KEY** - Your Telnyx API key for sending SMS messages
3. **TELNYX_PHONE_NUMBER** - Your Telnyx phone number (optional, if not stored in DB)
4. **TELNYX_MESSAGING_PROFILE_ID** - Your Telnyx messaging profile ID (optional)

## How to Set Environment Variables

You mentioned that API keys should be available at:
https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

To add the missing environment variables:

1. Go to the Supabase Dashboard
2. Navigate to Edge Functions > Secrets
3. Add the following secrets:
   - Key: `MAILGUN_API_KEY`
   - Value: Your actual Mailgun API key
   
   - Key: `TELNYX_API_KEY`  
   - Value: Your actual Telnyx API key

## Current Error Explained

The error "no we have email send or sms email working thru mailgun but sms thru telnyx no" indicates:

- ✅ Email sending through Mailgun is working (MAILGUN_API_KEY is set)
- ❌ SMS sending through Telnyx is not working (TELNYX_API_KEY might be missing)

## Testing the Functions

Once the environment variables are set, the functions can be called with proper authentication:

```javascript
// Example: Send SMS via Telnyx
const response = await supabase.functions.invoke('telnyx-sms', {
  body: {
    recipientPhone: '+1234567890',
    message: 'Test message',
    client_id: 'optional-client-id',
    job_id: 'optional-job-id'
  }
});

// Example: Send Estimate Email
const response = await supabase.functions.invoke('send-estimate', {
  body: {
    estimateId: 'estimate-uuid',
    recipientEmail: 'client@example.com',
    customMessage: 'Optional custom message'
  }
});

// Example: Send Invoice Email
const response = await supabase.functions.invoke('send-invoice', {
  body: {
    invoiceId: 'invoice-uuid',
    recipientEmail: 'client@example.com',
    customMessage: 'Optional custom message'
  }
});
```

## What Each Function Does

### send-estimate
- Sends professional estimate emails to clients
- Includes a link to the client portal
- Uses Mailgun for email delivery
- Requires: MAILGUN_API_KEY

### send-invoice
- Sends professional invoice emails to clients
- Includes a link to the client portal
- Shows payment status (paid/unpaid)
- Uses Mailgun for email delivery
- Requires: MAILGUN_API_KEY

### telnyx-sms
- Sends SMS messages via Telnyx
- Formats phone numbers automatically
- Logs messages in the database
- Requires: TELNYX_API_KEY

## Next Steps

1. Add the TELNYX_API_KEY to Supabase Edge Function Secrets
2. Verify MAILGUN_API_KEY is correctly set
3. Test the functions from your application

The functions are now deployed and ready to use once the environment variables are configured!
