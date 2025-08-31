# Fix for Email/SMS Sending Issues in Fixlify

## Problem
When clicking "Send" on an estimate or invoice, the system shows an unintended window/dialog instead of properly sending the email/SMS.

## Required Environment Variables
The following environment variables must be set in Supabase Edge Functions:

1. **MAILGUN_API_KEY** - Your Mailgun API key
2. **TELNYX_API_KEY** - Your Telnyx API key (for SMS)
3. **TELNYX_CONNECTION_ID** - Your Telnyx connection ID (optional)

## Steps to Fix

### 1. Check Current Edge Function Status
```bash
# List all edge functions
supabase functions list --project-ref mqppvcrlvsgrsqelglod

# Check if send-estimate and mailgun-email are deployed
supabase functions list --project-ref mqppvcrlvsgrsqelglod | grep -E "send-estimate|mailgun-email"
```

### 2. Set Required Environment Variables
```bash
# Set Mailgun API key
supabase secrets set MAILGUN_API_KEY=your-mailgun-api-key --project-ref mqppvcrlvsgrsqelglod

# Set Telnyx API key for SMS
supabase secrets set TELNYX_API_KEY=your-telnyx-api-key --project-ref mqppvcrlvsgrsqelglod

# List all secrets to verify
supabase secrets list --project-ref mqppvcrlvsgrsqelglod
```

### 3. Deploy/Update Edge Functions
```bash
# Deploy send-estimate function
supabase functions deploy send-estimate --project-ref mqppvcrlvsgrsqelglod

# Deploy mailgun-email function
supabase functions deploy mailgun-email --project-ref mqppvcrlvsgrsqelglod

# Deploy send-estimate-sms function
supabase functions deploy send-estimate-sms --project-ref mqppvcrlvsgrsqelglod
```

### 4. Test the Email Sending
1. Go to a job with an estimate
2. Click the three dots (⋮) menu on the estimate
3. Click "Send"
4. The Universal Send Dialog should appear
5. Enter email/phone and send

### 5. Debug in Browser Console
Run this to check if the dialog is working:
```javascript
// Check for dialogs
const dialogs = document.querySelectorAll('[role="dialog"]');
console.log('Dialogs found:', dialogs.length);

// Check for send functionality
const sendButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent?.includes('Send')
);
console.log('Send buttons:', sendButtons.length);

// Check for errors
console.log('Check console for any red error messages above');
```

### 6. Common Issues and Solutions

#### Issue: "Email service not configured"
**Solution:** Set the MAILGUN_API_KEY environment variable in Supabase

#### Issue: "SMS service not configured"  
**Solution:** Set the TELNYX_API_KEY environment variable in Supabase

#### Issue: Dialog doesn't appear
**Solution:** Check browser console for JavaScript errors, ensure estimates have valid data

#### Issue: "Authentication failed"
**Solution:** Verify API keys are correct and have proper permissions

### 7. Alternative Quick Fix
If environment variables are not set, you can temporarily update the edge function to bypass the check:

**WARNING: Only for testing, not for production!**

Update the edge function to use a test configuration that simulates sending without actually sending emails.

## Verification Steps
1. After setting environment variables, wait 1-2 minutes for changes to propagate
2. Refresh the page (Ctrl+F5 / Cmd+Shift+R)
3. Try sending an estimate again
4. Check Supabase Edge Function logs for any errors

## Need Help?
1. Check Supabase dashboard > Functions > Logs
2. Look for error messages in browser console
3. Verify API keys are active in Mailgun/Telnyx dashboards
