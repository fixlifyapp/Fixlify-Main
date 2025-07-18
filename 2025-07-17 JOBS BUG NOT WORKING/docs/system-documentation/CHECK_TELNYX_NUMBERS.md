# How to Check Your Telnyx Phone Numbers

## Option 1: Use the Debug Page (Recommended)

1. **Add the import** at the top of `/src/App.tsx`:
```javascript
import TelnyxDebugPage from "./pages/TelnyxDebugPage";
```

2. **Add the route** after the phone-numbers route:
```javascript
<Route path="/telnyx-debug" element={
  <AuthProvider>
    <ProtectedRouteWithProviders>
      <TelnyxDebugPage />
    </ProtectedRouteWithProviders>
  </AuthProvider>
} />
```

3. **Deploy the edge function**:
```bash
npx supabase functions deploy check-telnyx-account
```

4. **Visit the page**:
Navigate to: `http://localhost:8081/telnyx-debug`

5. **Click "Check Account"** to see all your Telnyx numbers

## Option 2: Use Browser Console

1. Open your app in the browser
2. Open DevTools (F12)
3. Go to Console tab
4. Run this code:

```javascript
// Check Telnyx numbers via edge function
const checkTelnyx = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data, error } = await supabase.functions.invoke('check-telnyx-account');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📱 Telnyx Account Summary:');
  console.log(`Total Numbers: ${data.total_numbers}`);
  console.log(`Connection ID: ${data.connection_id}`);
  console.log('\n📞 Phone Numbers:');
  
  data.numbers.forEach((num, i) => {
    console.log(`\n${i + 1}. ${num.phone_number}`);
    console.log(`   Status: ${num.status}`);
    console.log(`   SMS: ${num.messaging_enabled ? '✅' : '❌'}`);
    console.log(`   Voice: ${num.voice_enabled ? '✅' : '❌'}`);
    console.log(`   Created: ${new Date(num.created_at).toLocaleDateString()}`);
  });
};

checkTelnyx();
```

## Option 3: Use the Sync Feature

1. Go to `/phone-numbers` page
2. Click "Sync from Telnyx" button
3. This will import all numbers from your Telnyx account
4. Check "Your Available Numbers" tab to see them

## What to Look For:

- **phone_number**: The actual phone number
- **status**: Should be "active"
- **messaging_enabled**: Should be true for SMS
- **voice_enabled**: Should be true for calls
- **connection_id**: Should match your configured ID

## If No Numbers Show:

1. Check your Telnyx dashboard at https://portal.telnyx.com
2. Verify numbers are purchased there
3. Check API key is correct in Supabase secrets
4. Look at edge function logs for errors