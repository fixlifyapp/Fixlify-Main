# Edge Functions Cleanup Summary

## Functions to Remove (4 total)

### Test Functions (not needed in production):
1. **test-sms** - Test function for SMS
2. **test-sms-debug** - Debug version of SMS test
3. **test-env** - Test for environment variables

### Duplicate Functions:
4. **send-email** - Old email function (replaced by mailgun-email)

## Functions to Keep (11 total)

### Core SMS/Email Functions:
- **send-sms** or **telnyx-sms** - Main SMS sending functionality
- **mailgun-email** - Email sending via Mailgun API

### Document Sending Functions:
- **send-estimate** - Send estimates via email
- **send-estimate-sms** - Send estimates via SMS
- **send-invoice** - Send invoices via email
- **send-invoice-sms** - Send invoices via SMS

### Webhook Handlers:
- **sms-webhook** - Handle incoming SMS messages
- **mailgun-webhook** - Handle Mailgun events
- **telnyx-webhook** - Handle Telnyx webhooks

### Other Functions:
- **phone-number-marketplace** - Phone number management

## Cleanup Commands

To remove the duplicate functions, run these commands in your terminal:

```bash
# Remove test functions
supabase functions delete test-sms
supabase functions delete test-sms-debug
supabase functions delete test-env

# Remove old email function
supabase functions delete send-email
```

Or use the provided script:
```bash
cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\scripts
bash cleanup-edge-functions.sh
```

## Important Notes

1. **SMS Naming**: You have both `send-sms` and `telnyx-sms`. Check which one is the actual implementation and keep that one.

2. **Before Deletion**: Make sure no part of your application is calling these test functions.

3. **After Cleanup**: Your edge functions will be properly organized:
   - SMS functionality: Telnyx-based
   - Email functionality: Mailgun-based
   - Clear separation between production and test code
