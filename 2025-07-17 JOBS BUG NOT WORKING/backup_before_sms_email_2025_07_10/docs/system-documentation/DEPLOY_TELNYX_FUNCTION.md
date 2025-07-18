# Deploy Telnyx Edge Function - Step by Step

## Option A: Deploy via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - https://app.supabase.com/project/mqppvcrlvsgrsqelglod

2. **Navigate to Edge Functions**
   - Click "Edge Functions" in the left sidebar

3. **Create New Function**
   - Click "New Function"
   - Name: `telnyx-phone-manager`
   - Copy the code from: `/supabase/functions/telnyx-phone-manager/index.ts`

4. **Set Environment Variables**
   - Go to Settings → Edge Functions
   - Add secrets:
     - `TELNYX_API_KEY`: KEY01973792571E803B1EF8E470CD832D49
     - `TELNYX_CONNECTION_ID`: 2709100729850660858

5. **Deploy**
   - Click Deploy

## Option B: Deploy via CLI

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link your project
npx supabase link --project-ref mqppvcrlvsgrsqelglod
# When asked for password, press Enter to skip

# 3. Set secrets
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
npx supabase secrets set TELNYX_CONNECTION_ID=2709100729850660858

# 4. Deploy the function
npx supabase functions deploy telnyx-phone-manager --no-verify-jwt

# 5. Test it works
npx supabase functions invoke telnyx-phone-manager --body '{"action":"sync_telnyx_numbers"}'
```

## Option C: Quick Fix Without Deployment

Add this to your `.env.local` file:
```
VITE_USE_LOCAL_TELNYX=true
```

Then use this code in your app to bypass the edge function:

```javascript
// In TelnyxSyncButton.tsx
const syncTelnyxNumbers = async () => {
  if (import.meta.env.VITE_USE_LOCAL_TELNYX) {
    // Direct API call (only works locally)
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      headers: {
        'Authorization': 'Bearer KEY01973792571E803B1EF8E470CD832D49',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Process numbers...
    }
  } else {
    // Use edge function
    await supabase.functions.invoke('telnyx-phone-manager', {
      body: { action: 'sync_telnyx_numbers' }
    });
  }
};
```

## After Deployment

The sync button should work and:
1. Fetch all numbers from your Telnyx account
2. Add new ones to the database
3. Show them as "Available to claim"

Your new number will appear automatically!