# Quick Fix for Telnyx Sync Error

## The Error:
- Edge function is not deployed
- CORS policy blocking the request
- Need to set up Supabase project link

## Fix Steps:

### 1. Link your Supabase project:
```bash
npx supabase link --project-ref mqppvcrlvsgrsqelglod
```

### 2. Set the Telnyx API key secret:
```bash
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
npx supabase secrets set TELNYX_CONNECTION_ID=2709100729850660858
```

### 3. Deploy the edge functions:
```bash
# Deploy the phone manager function
npx supabase functions deploy telnyx-phone-manager

# Deploy the check account function
npx supabase functions deploy check-telnyx-account
```

### 4. If you still get CORS errors, update the Supabase project settings:
- Go to Supabase Dashboard
- Settings → API
- Add your local URL to allowed origins

## Alternative Quick Test:

Instead of using the sync button, let's test directly in the console:

```javascript
// Test if Telnyx API key works
async function testTelnyx() {
  const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
    headers: {
      'Authorization': 'Bearer KEY01973792571E803B1EF8E470CD832D49',
      'Accept': 'application/json'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('Your Telnyx numbers:', data.data);
  } else {
    console.error('Error:', response.status);
  }
}

testTelnyx();
```

This will show you what numbers are in your Telnyx account.