# Telnyx Phone Number Synchronization Fix

## Problem Summary
The Telnyx phone number synchronization was failing because:
1. The `telnyx_phone_numbers` table had a `NOT NULL` constraint on the `user_id` column
2. The sync process tried to insert available (unassigned) phone numbers with `NULL` user_id
3. This caused a database constraint violation and prevented syncing

## Solution Implemented

### 1. Database Schema Fix
Applied migration to make `user_id` nullable and update RLS policies:

```sql
-- Make user_id nullable
ALTER TABLE public.telnyx_phone_numbers 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to handle null user_id
-- Users can view available numbers (null user_id) and their own numbers
CREATE POLICY "Users can view available and own telnyx numbers"
ON public.telnyx_phone_numbers
FOR SELECT
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can claim available numbers
CREATE POLICY "Users can claim available telnyx numbers"
ON public.telnyx_phone_numbers
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Added missing columns
ALTER TABLE public.telnyx_phone_numbers 
ADD COLUMN IF NOT EXISTS locality TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY['sms', 'voice', 'mms'];
```

### 2. Edge Function Deployment
Deployed `sync-telnyx-numbers` edge function to handle syncing from Telnyx API.

### 3. Phone Number Management Flow

#### Available Numbers (from your Telnyx account)
- Synced from Telnyx API with `user_id = NULL`
- Status: 'available' 
- Users can claim these numbers (updates user_id to their ID)

#### Claimed Numbers
- Have `user_id` set to the claiming user's ID
- Status: 'active'
- Only visible to and manageable by the owning user

#### SMS Sending Logic (telnyx-sms edge function)
```javascript
// Get an active phone number for this user or any available one
const { data: phoneNumbers } = await supabaseAdmin
  .from('telnyx_phone_numbers')
  .select('*')
  .or(`user_id.eq.${userData.user.id},user_id.is.null`)
  .eq('status', 'active')
  .limit(1);
```

## Testing Instructions

### 1. Test Sync Function
Run this in browser console while logged in:
```javascript
// Copy and run test-telnyx-sync-fix.js
```

### 2. Manual Phone Number Addition
If sync fails due to missing TELNYX_API_KEY:
```javascript
// Add a phone number manually
async function addPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
    },
    body: JSON.stringify({
      phone_number: formatted,
      status: 'available',
      country_code: 'US',
      area_code: formatted.substring(2, 5),
      features: ['sms', 'voice', 'mms'],
      monthly_cost: 0,
      setup_cost: 0,
      purchased_at: new Date().toISOString()
    })
  });

  if (response.ok) {
    console.log('✅ Number added:', formatted);
  } else {
    console.error('❌ Error:', await response.text());
  }
}

// Example
addPhoneNumber('416-555-1234');
```

### 3. Configuration Requirements

#### Supabase Edge Function Secrets
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/vault

Add these secrets if missing:
- `TELNYX_API_KEY`: Your Telnyx API key
- `TELNYX_MESSAGING_PROFILE_ID`: (Optional) Your messaging profile ID
- `TELNYX_CONNECTION_ID`: (Optional) Your connection ID

## UI Components Using Phone Numbers

1. **TelnyxPhoneSync Component** (`/src/components/phone/TelnyxPhoneSync.tsx`)
   - Shows sync status
   - Auto-sync on load
   - Manual sync button
   - Lists available numbers

2. **Phone Management Page** (`/phone-management`)
   - View synced numbers
   - Claim available numbers
   - Manual number addition

3. **SMS Sending** (Estimates, Invoices, Automations)
   - Automatically selects user's phone number
   - Falls back to any available number if user has none

## Troubleshooting

### Issue: "TELNYX_API_KEY not configured"
**Solution**: Add the API key in Supabase edge function secrets

### Issue: "No active phone number available"
**Solution**: 
1. Sync numbers from Telnyx
2. Claim a number in Phone Management
3. Or manually add a number using the script above

### Issue: Sync shows 0 numbers
**Possible causes**:
1. No numbers in your Telnyx account
2. Invalid API key
3. Network/API issues

**Solution**: Check Telnyx portal and verify you have active numbers

## Files Modified

1. Database Migration: `fix_telnyx_phone_numbers_user_id_nullable`
2. Edge Function: `sync-telnyx-numbers` (deployed)
3. Test Script: `test-telnyx-sync-fix.js`

## Next Steps

1. Set up TELNYX_API_KEY in Supabase secrets
2. Run sync to import your Telnyx numbers
3. Claim numbers for users in Phone Management
4. Test SMS sending functionality
