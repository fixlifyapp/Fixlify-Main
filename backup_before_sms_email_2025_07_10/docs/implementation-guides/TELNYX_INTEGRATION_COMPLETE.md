# Telnyx Phone Numbers Integration - Complete Setup Guide

## Overview
The Fixlify app now has a complete Telnyx integration that allows each user to have their own phone number for:
- ✅ Two-way SMS messaging
- ✅ Voice calls (inbound and outbound)
- ✅ AI Dispatcher for intelligent call routing
- ✅ Call recording and transcription
- ✅ Real-time webhooks

## Current Configuration

### Environment Variables (Updated ✅)
```env
VITE_TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
VITE_TELNYX_CONNECTION_ID=2709100729850660858
VITE_TELNYX_PUBLIC_KEY=e5jeBd2E62zcfqhmsfbYiIgtP06y1KjigRg2cGRg84=
```

### Database Schema
- **Table**: `telnyx_phone_numbers`
- **Key Fields**:
  - `phone_number` - The phone number
  - `user_id` - Assigned user (NULL = available)
  - `status` - active/available/inactive
  - `ai_dispatcher_enabled` - Enable AI features
  - `connection_id` - Telnyx connection ID

### Available Phone Numbers
- +14375290279 (Active, unassigned)
- +14375249932 (Active, unassigned) 
- +12268948117 (Available)
- +12268947028 (Active, unassigned)
- +14375249999 (Active, unassigned)

## How It Works

### 1. Phone Number Assignment
Each user can:
- Claim an existing unassigned number
- Purchase a new number from Telnyx
- Have multiple numbers (system uses the most recent)

### 2. SMS Flow
```
User sends SMS → Edge Function → Get user's phone number → Send via Telnyx API → Log in database
```

### 3. Voice Call Flow
```
Incoming call → Telnyx webhook → Voice handler → AI Dispatcher (optional) → Route to user
Outgoing call → Make call API → Use user's number → Track in database
```

## User Interface

### Phone Numbers Page (`/phone-numbers`)
- **Status Overview**: Shows configuration and user's numbers
- **Manage Numbers**: Claim or purchase numbers
- **Configuration**: View webhook URLs and settings

### Key Components
1. `TelnyxPhoneStatus` - Shows integration status
2. `PhoneNumberPurchase` - UI for getting numbers
3. `TelnyxService` - Core service class

## API Integration

### Edge Functions
- `telnyx-sms` - Send SMS messages
- `sms-receiver` - Receive inbound SMS
- `telnyx-voice-webhook` - Handle voice events
- `telnyx-phone-numbers` - Manage numbers
- `ai-dispatcher-webhook` - AI call routing

### Webhooks Configuration
All webhooks point to:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/[function-name]
```

## Testing

### 1. Quick Test in Browser Console
```javascript
// Copy and paste the test script
const script = await fetch('/src/utils/test-telnyx-integration.js').then(r => r.text());
eval(script);
```

### 2. Send Test SMS
```javascript
testSendSMS('+1234567890', 'Hello from Fixlify!');
```

### 3. Check User's Numbers
Navigate to `/phone-numbers` to see status

## Common Tasks

### Assign a Number to User
1. User logs in
2. Goes to Phone Numbers page
3. Clicks "Claim" on available number
4. Number is assigned to their account

### Purchase New Number
1. Go to Phone Numbers page
2. Search by area code or city
3. Select and purchase number
4. Automatically assigned to user

### Enable AI Dispatcher
1. Number must be assigned to user
2. AI Dispatcher automatically available
3. Configure in AI Center

## Troubleshooting

### "No phone number found"
- User needs to claim/purchase a number first
- Check Phone Numbers page

### SMS Not Sending
1. Check user has active number
2. Verify Telnyx API key is set
3. Check Supabase logs for errors

### Webhooks Not Working
1. Verify webhook URLs in Telnyx portal
2. Check edge function logs
3. Ensure public key matches

## Security Notes
- Each user can only see/use their own numbers
- API keys stored securely in environment
- RLS policies enforce data isolation
- Webhook validation using public key

## Next Steps
1. Test SMS sending with a real number
2. Configure voice application in Telnyx portal
3. Set up AI Dispatcher rules
4. Monitor usage and costs

## Support
For issues:
1. Check browser console for errors
2. Review Supabase function logs
3. Verify Telnyx portal configuration
4. Check database for phone number assignment