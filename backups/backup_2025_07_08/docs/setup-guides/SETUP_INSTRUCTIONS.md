# Complete Setup Instructions for Telnyx Calling System

## Prerequisites
- Telnyx account with API key
- Supabase project
- Node.js installed

## Step 1: Set Telnyx API Key in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Edge Functions** → **Secrets**
4. Click **"New secret"**
5. Add:
   - Name: `TELNYX_API_KEY`
   - Value: Your Telnyx API key (starts with `KEY...`)
6. Click **"Save"**

## Step 2: Deploy Edge Functions

### For Windows (PowerShell):
```powershell
.\deploy-edge-functions.ps1
```

### For Mac/Linux:
```bash
chmod +x deploy-edge-functions.sh
./deploy-edge-functions.sh
```

### Or manually deploy each function:
```bash
npx supabase functions deploy setup-telnyx-number
npx supabase functions deploy test-telnyx-connection
npx supabase functions deploy telnyx-make-call
npx supabase functions deploy manage-ai-dispatcher
npx supabase functions deploy ai-dispatcher-webhook
npx supabase functions deploy telnyx-webhook-router
```

## Step 3: Configure Telnyx Webhooks

1. Go to [Telnyx Portal](https://portal.telnyx.com)
2. Navigate to **Telephony** → **Applications**
3. Find your application (ID: 2709042883142354871)
4. Set the webhook URL to:
   ```
   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook-router
   ```
   **Important**: Use the webhook router, not the voice webhook directly!

## Step 4: Set Up AI Dispatcher

### Enable AI Dispatcher for Your Phone Number

1. Navigate to the **Calls** page
2. Select your phone number from the dropdown
3. Toggle the **AI Dispatcher** switch to enable it
4. The AI will now handle incoming calls automatically

### Configure AI Settings

1. Go to **Settings** → **AI Settings**
2. Configure:
   - Business name and hours
   - Greeting message
   - AI voice selection
   - Custom instructions
   - SMS auto-response
3. Click **Save Settings**

### Test AI Dispatcher

1. Call your Telnyx number from another phone
2. You should hear your AI greeting
3. Interact with the AI to test responses
4. Check call logs in the **Calls** → **Call History** tab

## Step 5: Test the System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the **Calls** page in the sidebar

3. Click **"Test Telnyx Connection"** to verify your API key is working

4. Click **"Setup Telnyx Number"** to add your phone number to the system

5. Try making a test call!

## How the System Works

### Call Flow
1. **Incoming Call** → Telnyx webhook → `telnyx-webhook-router`
2. Router checks if AI Dispatcher is enabled for the phone number
3. If enabled → Routes to `ai-dispatcher-webhook`
4. If disabled → Routes to `basic-telephony-webhook`
5. Call is handled according to your settings

### AI Dispatcher Features
- **Automatic Call Handling**: AI answers and handles customer inquiries
- **Appointment Booking**: Can schedule appointments based on availability
- **Custom Instructions**: Follows your specific business rules
- **Call Transcription**: All conversations are logged
- **SMS Auto-Response**: Automatically responds to text messages

## Troubleshooting

### "Failed to send a request to the Edge Function"
- Make sure you've deployed the edge functions (Step 2)
- Verify your Supabase project URL is correct

### "Failed to setup phone number"
- Check that TELNYX_API_KEY is set in Supabase Secrets
- Verify the API key is correct and active

### "Failed to initiate call"
- Ensure your Telnyx phone number is active
- Check that the webhook URL is configured correctly
- Verify the connection ID matches your Telnyx application

### AI Dispatcher not working
- Ensure AI Dispatcher is enabled for your phone number
- Check that the webhook URL ends with `/telnyx-webhook-router`
- Verify all edge functions are deployed
- Check Supabase logs for any errors

### Phone number already exists in database
If you're getting conflicts, you can manually check:
```sql
SELECT * FROM telnyx_phone_numbers;
```

## Environment Variables (Optional)

Create a `.env` file in your project root:
```env
VITE_TELNYX_CONNECTION_ID=2709042883142354871
VITE_TELNYX_DEFAULT_FROM_NUMBER=+14375249932
```

## Next Steps

- Test incoming calls by calling your Telnyx number
- Try the call button on client records
- Check call history after making calls
- Configure AI dispatcher for automated call handling
- Set up custom AI instructions for your business
- Test SMS auto-response functionality 