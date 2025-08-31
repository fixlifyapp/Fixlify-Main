# 📱 SMS/Email Testing Guide

## Prerequisites Checklist:

### For SMS:
- [ ] Telnyx account with credits
- [ ] Phone number that can receive SMS
- [ ] TELNYX_API_KEY in Supabase secrets
- [ ] (Optional) TELNYX_MESSAGING_PROFILE_ID

### For Email:
- [ ] Mailgun account (free tier is fine)
- [ ] MAILGUN_API_KEY in Supabase secrets
- [ ] (Optional) MAILGUN_DOMAIN (defaults to mg.fixlify.com)
- [ ] Valid email address for testing

## 🧪 Step-by-Step Testing Process:

### 1. First Login to the App
```
http://localhost:8082/
```
- Log in with your credentials
- This is required for authentication

### 2. Run the SQL Setup Script
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new

Run the script: `test_sms_email_complete.sql`
- Make sure to change the phone number to your real number!

### 3. Test SMS First
Go to: http://localhost:8082/sms-test

**Test 1 - Basic SMS:**
- Phone: Your phone number (e.g., +1234567890)
- Message: "Hello from Fixlify! This is a test SMS."
- Click "Send Test SMS"
- Check your phone!

**What to verify:**
- ✅ SMS received on your phone
- ✅ Success message in the UI
- ✅ Check logs in SQL editor (run step 5 from the script)

### 4. Test Email
Go to: http://localhost:8082/email-test

**Test 1 - Template Email:**
- To: your-email@example.com
- Subject: Test Email from Fixlify
- Template: Select "Estimate Ready"
- Click "Send Test Email"

**Test 2 - Custom HTML Email:**
- To: your-email@example.com
- Subject: Custom HTML Test
- Template: Select "No template"
- Message: 
  ```html
  <h1>Hello from Fixlify!</h1>
  <p>This is a <strong>test email</strong> with HTML.</p>
  <p>Best regards,<br>Fixlify Team</p>
  ```
- Click "Send Test Email"

**What to verify:**
- ✅ Email received in your inbox
- ✅ HTML formatting looks correct
- ✅ Success message in the UI
- ✅ Check logs in SQL editor

### 5. Test from Estimates
1. Go to any job with estimates
2. Click "Send" on an estimate
3. Test both SMS and Email options
4. Verify portal link works

### 6. Check Logs
Run these queries in SQL editor:

```sql
-- See all recent communications
SELECT * FROM communication_logs 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for any errors
SELECT * FROM communication_logs 
WHERE user_id = auth.uid() 
AND status = 'failed'
ORDER BY created_at DESC;
```

## 🐛 Troubleshooting:

### SMS Not Sending?
1. **Error: "No phone number found for user"**
   - Run the SQL script to add your phone number
   
2. **Error: "Telnyx API key not configured"**
   - Check Supabase Edge Function secrets
   - Make sure TELNYX_API_KEY is set

3. **SMS not received**
   - Check phone number format (+1 for US)
   - Check Telnyx dashboard for errors
   - Verify Telnyx account has credits

### Email Not Sending?
1. **Error: "Mailgun API key not configured"**
   - Check Supabase Edge Function secrets
   - Make sure MAILGUN_API_KEY is set

2. **Email not received**
   - Check spam folder
   - Verify email address is correct
   - Check Mailgun dashboard for bounces
   - For testing, Mailgun sandbox requires verified recipients

3. **401 Unauthorized from Mailgun**
   - Verify API key is correct
   - Check if using correct region (US/EU)

## 📊 What Success Looks Like:

### SMS Success:
- Message received on phone within seconds
- Status shows "sent" or "delivered" in logs
- No error_message in communication_logs

### Email Success:
- Email received in inbox
- HTML formatting preserved
- Links are clickable
- Status shows "sent" in logs

## 🎯 Quick Test Commands:

```bash
# Check if edge functions are deployed
npx supabase functions list

# Check function logs (if errors occur)
npx supabase functions logs send-sms
npx supabase functions logs send-email
```

## Need Help?
1. Check communication_logs table for error messages
2. Look at Supabase function logs
3. Verify API credentials are correct
4. Check external service dashboards (Telnyx/Mailgun)
