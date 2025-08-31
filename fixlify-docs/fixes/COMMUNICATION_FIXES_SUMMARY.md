# Fixed Communication Service Issues

## Issues Fixed:

### 1. ✅ Import Error in ConnectCenter
- **Fixed**: Changed `@/hooks/useAuth` → `@/hooks/use-auth`
- **Files Updated**:
  - ConnectCenter.tsx
  - CommunicationTemplates.tsx
  - CommunicationAutomations.tsx

### 2. ✅ Syntax Error in communication-service.ts
- **Fixed**: Comment and code were on the same line causing syntax error
- **Line 30**: Separated comment from code

### 3. ✅ Wrong Edge Function Names
- **Fixed**: Updated to use correct edge function names:
  - `mailgun-email` → `send-email`
  - `sms-send` → `telnyx-sms`
- **Added**: Missing `user_id` parameter for SMS sending

## Current Edge Functions:

| Function | Purpose | Status |
|----------|---------|--------|
| `send-email` | Generic email sending | ✅ Active |
| `telnyx-sms` | SMS sending | ✅ Active |
| `send-estimate` | Send estimate emails | ✅ Active |
| `send-estimate-sms` | Send estimate SMS | ✅ Active |
| `send-invoice` | Send invoice emails | ✅ Active |
| `send-invoice-sms` | Send invoice SMS | ✅ Active |
| `telnyx-webhook` | Receive incoming SMS | ✅ Active |

## To Test:

1. **Messages Center** should now load without errors
2. **Send Email/SMS** from Connect Center should work
3. **Send Invoice/Estimate** from Jobs page should work

## Next Steps:

1. Configure Telnyx webhook for two-way SMS:
   - URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
   - Enable "Inbound Message" events

2. Test all communication features using the test script in `test-communications.js`
