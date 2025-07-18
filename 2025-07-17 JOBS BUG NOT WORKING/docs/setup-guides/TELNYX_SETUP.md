# Telnyx Configuration Guide

## Environment Variables

Add these to your `.env` file:

```env
# Telnyx Configuration
VITE_TELNYX_CONNECTION_ID=2709042883142354871
VITE_TELNYX_DEFAULT_FROM_NUMBER=+14375249932

# In Supabase Dashboard, add this to Edge Function secrets:
TELNYX_API_KEY=your_telnyx_api_key_here
```

## Telnyx Portal Configuration

Based on your screenshots, your Telnyx Voice API application is already configured with:

1. **Application Name**: Fixlify Voice Handler
2. **Application ID**: 2709042883142354871
3. **Webhook URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`
4. **Webhook Failover URL**: `https://example.com` (you should update this)
5. **Phone Number**: +1-437-524-9932

## Important Settings to Verify

1. **Webhook API Version**: Make sure it's set to "API v2"
2. **DTMF Type**: RFC 2833 (already set correctly)
3. **Codecs**: Ensure G722, G711A, G711U, VP8, and H.264 are enabled
4. **Inbound Settings**: 
   - SIP subdomain receive settings: "From Anyone" (for testing) or "Only My Connections" (for production)
   - Enable SHAKEN/STIR headers if needed

## Testing the Integration

1. Make sure your Supabase edge functions are deployed
2. Test webhook connectivity from Telnyx portal
3. Make a test call to verify the webhook is receiving events

## Webhook URL Structure

Your webhook endpoints are:
- **Voice Webhook**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`
- **Webhook Router**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook-router`
- **AI Dispatcher**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-dispatcher-webhook`

## Testing the System

1. **Navigate to the Calls page**
   - Click on "Calls" in the sidebar menu
   - You'll see two tabs: "Dialer" and "Call History"

2. **First-time setup**
   - If no phone numbers are configured, click "Setup Telnyx Number"
   - This will add your phone number (+1-437-524-9932) to the system

3. **Making a call**
   - Enter a phone number in the "To Number" field
   - Click "Call" to make a regular call
   - Click "AI Call" to make an AI-assisted call
   - The call interface will show:
     - Call duration timer
     - Mute/unmute button
     - End call button
     - Client information (if the number belongs to a known client)

4. **Receiving calls**
   - When someone calls your Telnyx number, a popup will appear
   - You can accept or decline the call
   - If it's from a known client, their information will be displayed

5. **Call from anywhere in the app**
   - In the Clients page, each client has a "Call" button
   - In Job details, you can call the client directly
   - Any phone number in the system can be called with one click

6. **Call History**
   - View all past calls in the "Call History" tab
   - See call duration, status, and client information
   - Search and filter calls
   - Click any number to call back

## Troubleshooting

1. **"No phone numbers found" error**
   - Click "Test Telnyx Connection" to verify your API key is set
   - Make sure TELNYX_API_KEY is set in Supabase Edge Functions

2. **Calls not connecting**
   - Verify your Telnyx Application webhook URL is correct
   - Check that your phone number has the correct connection ID
   - Look at the browser console for any errors

3. **Incoming calls not showing**
   - Ensure the webhook URL in Telnyx matches your Supabase function URL
   - Check that real-time subscriptions are working in your app

## Next Steps

1. Get your Telnyx API Key from the Telnyx portal
2. Add it to your Supabase Edge Function environment variables
3. Update the failover webhook URL to a proper backup endpoint
4. Test making and receiving calls through the unified call manager 