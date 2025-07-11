# SMS and Email Functionality Status

## ✅ What's Working Now

### 1. **Send Estimate** 
- **Email**: ✅ Working via `send-estimate` edge function
- **SMS**: ✅ Working via `send-estimate-sms` edge function
- **UI**: ✅ Send dialog implemented in estimates tab

### 2. **Send Invoice**
- **Email**: ✅ Working via `send-invoice` edge function (just deployed)
- **SMS**: ✅ Working via `send-invoice-sms` edge function (just deployed)
- **UI**: ✅ Send dialog exists, implementation added via `invoice-actions.ts`

### 3. **Messages Center**
- **Outbound SMS**: ✅ Working - can send SMS to clients
- **Inbound SMS**: ✅ Edge function deployed (`telnyx-webhook`)
- **Two-way conversations**: ⚠️ Requires Telnyx webhook configuration

## 🔧 What Needs Configuration

### For Two-Way SMS to Work:

1. **Configure Telnyx Webhook**
   - Log into your Telnyx account
   - Go to Messaging > Messaging Profiles
   - Select your messaging profile
   - Add webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
   - Enable these events:
     - ✅ Inbound Message
     - ✅ Message Sent
     - ✅ Message Finalized

2. **Update Database** (optional - for better tracking)
   ```sql
   -- Add to messages table if not exists
   ALTER TABLE messages ADD COLUMN IF NOT EXISTS external_id TEXT;
   ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB;
   
   -- Create index for webhook lookups
   CREATE INDEX IF NOT EXISTS idx_messages_external_id ON messages(external_id);
   ```

3. **Set Environment Variables** (if using webhook verification)
   - `TELNYX_PUBLIC_KEY` - For webhook signature verification (optional but recommended)

## 📱 How to Use

### Send Estimate/Invoice
1. Go to Jobs > Select a job
2. Navigate to Estimates or Invoices tab
3. Click the send button (paper plane icon)
4. Choose Email or SMS
5. Confirm recipient details
6. Send!

### Two-Way SMS Messages
1. Go to Messages Center
2. Select or create a conversation
3. Send an SMS to a client
4. Once Telnyx webhook is configured, client replies will appear automatically

## 🧪 Testing

### Test Email/SMS Sending
```javascript
// In browser console (on your app)
await window.supabase.functions.invoke('send-invoice', {
  body: {
    invoiceId: 'your-invoice-id',
    recipientEmail: 'test@example.com',
    customMessage: 'Test invoice email'
  }
});
```

### Test Webhook (after configuration)
Send an SMS to your Telnyx phone number from any phone. Check:
1. Edge function logs: `supabase functions logs telnyx-webhook`
2. Messages table in database
3. Messages center UI for new conversation

## 🚨 Troubleshooting

### Emails/SMS not sending
1. Check API keys are set:
   - `MAILGUN_API_KEY`
   - `TELNYX_API_KEY`
2. Verify phone numbers are in correct format
3. Check edge function logs

### Incoming SMS not appearing
1. Verify webhook URL is correct in Telnyx
2. Check edge function is deployed and active
3. Look for errors in function logs
4. Ensure database tables exist

## 📊 Current Edge Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `send-email` | Generic email sending | ✅ Active |
| `telnyx-sms` | Outbound SMS | ✅ Active |
| `send-estimate` | Estimate emails | ✅ Active |
| `send-estimate-sms` | Estimate SMS | ✅ Active |
| `send-invoice` | Invoice emails | ✅ Active |
| `send-invoice-sms` | Invoice SMS | ✅ Active |
| `telnyx-webhook` | Incoming SMS handler | ✅ Active |
| `mailgun-email` | Backup email handler | ✅ Active |

All core functionality is deployed and ready to use!
