# 🔧 TELNYX API Key Update Guide

## Your Correct API Key
```
KEY0197DAA8BF3E951E5527CAA98E7770FC
```

## Current Status
- ✅ Frontend .env file has the correct key
- ❌ Supabase Edge Functions need the key updated

## Update Instructions

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
2. Find `TELNYX_API_KEY` in the list
3. Click the edit icon (pencil)
4. Replace with: `KEY0197DAA8BF3E951E5527CAA98E7770FC`
5. **Important**: No quotes, no spaces
6. Click Save
7. Wait 30-60 seconds

### Option 2: Via Supabase CLI
```bash
supabase secrets set TELNYX_API_KEY=KEY0197DAA8BF3E951E5527CAA98E7770FC --project-ref mqppvcrlvsgrsqelglod
```

## Test the Update
1. Wait 30-60 seconds after updating
2. Go to Jobs page in your app
3. Try sending an SMS from an estimate or invoice
4. Check if it works

## Troubleshooting
If it still doesn't work after updating:
1. Make sure you have active phone numbers in Telnyx
2. Check your Telnyx account balance
3. Verify the phone numbers table in Supabase has entries

## Files Already Updated
- ✅ `.env` - Has correct key
- ✅ Documentation updated
- ❌ Supabase Secrets - Needs manual update

## Quick Console Test
Run this in browser console to test:
```javascript
testTelnyxKey('KEY0197DAA8BF3E951E5527CAA98E7770FC')
```
