# 🚀 Telnyx MCP Setup - Complete Step-by-Step Guide

## Prerequisites Checklist
- [x] Telnyx account with API access
- [x] Phone number: +14375249932
- [x] Edge function: `telnyx-mcp-handler` created
- [ ] MCP Server configured in Telnyx
- [ ] Phone number updated with MCP settings

## Step 1: Deploy the Edge Function

Open PowerShell as Administrator and run:
```powershell
cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
.\deploy-mcp-handler.ps1
```

**Important**: Copy the generated webhook secret! You'll need it for Step 2.
Example: `mcp_secret_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0`

## Step 2: Create MCP Server in Telnyx

### 2.1 Navigate to MCP Servers
1. Log in to [Telnyx Dashboard](https://portal.telnyx.com)
2. Go to **AI Assistants** → **MCP Servers**
3. Click **"Create MCP Server"** button

### 2.2 Fill in the Configuration

#### Main Settings Screen:
```
┌─────────────────────────────────────────────────────┐
│ Create MCP Server                                   │
│                                                     │
│ Name: Fixlify AI Voice Assistant                   │
│                                                     │
│ Type:  ● HTTP   ○ SSE                             │
│                                                     │
│ URL: https://mqppvcrlvsgrsqelglod.supabase.co/    │
│      functions/v1/telnyx-mcp-handler              │
│                                                     │
│ + Append integration secret                        │
│                                                     │
│ API Key: [▼ Select API Key]                       │
│                                                     │
│ [Cancel]  [Save]                                   │
└─────────────────────────────────────────────────────┘
```

### 2.3 Add Integration Secret

Click **"+ Append integration secret"** and fill in:

```
┌─────────────────────────────────────────────────────┐
│ New Integration Secret                              │
│                                                     │
│ Identifier: MCP_WEBHOOK_SECRET                     │
│                                                     │
│ Secret Value: [Paste the secret from Step 1]       │
│                                                     │
│ [Cancel]  [Save]                                   │
└─────────────────────────────────────────────────────┘
```

### 2.4 Select API Key

In the **API Key** dropdown, select:
- Your production API key (starts with `KEY...`)
- This is the same key used for SMS operations

### 2.5 Save Configuration

Click **Save** to create the MCP Server.

You'll receive a response like:
```json
{
  "mcp_server_id": "mcp_12345-6789-abcd-efgh-ijklmnopqrst",
  "status": "active"
}
```

**Copy the `mcp_server_id`!** You'll need it for Step 3.

## Step 3: Update Phone Number Configuration

### Option A: Using Browser Console

1. Open Fixlify in your browser
2. Log in to your account
3. Open Developer Tools (F12)
4. Go to Console tab
5. Paste and run:

```javascript
// First, load the test script
await fetch('https://raw.githubusercontent.com/yourusername/fixlify/main/test-mcp-configuration.js')
  .then(r => r.text())
  .then(eval);

// Then enable MCP for your phone
enableMCPForPhone(
  'mcp_12345-6789-abcd-efgh-ijklmnopqrst',  // Your MCP Server ID
  'mcp_secret_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0'  // Your webhook secret
);
```

### Option B: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Table Editor → `phone_numbers`
3. Find the row with `+14375249932`
4. Update these fields:
   - `mcp_enabled`: `true`
   - `mcp_server_id`: `[Your MCP Server ID]`
   - `mcp_integration_secret`: `[Your webhook secret]`

## Step 4: Configure Phone Number in Telnyx

1. Go to **Phone Numbers** in Telnyx Dashboard
2. Click on `+14375249932`
3. In the **Voice** section:
   - Set **Connection**: Your MCP Server (should appear in dropdown)
   - **Webhook URL**: Will be auto-filled
4. Save changes

## Step 5: Test the Integration

### 5.1 Browser Console Test
Run in browser console:
```javascript
testMCPConfiguration();  // Full configuration check
testMCPEvent('call.initiated');  // Simulate call event
```

### 5.2 Real Call Test
1. Call `+14375249932` from any phone
2. You should hear: "Hello! Thank you for calling Fixlify. How can I help you today?"
3. Speak your request
4. AI will respond based on your input

## Step 6: Monitor & Debug

### Check Logs
In browser console:
```javascript
// View recent calls
const { data } = await window.supabase
  .from('ai_dispatcher_call_logs')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(10);
console.table(data);
```

### View Edge Function Logs
```bash
supabase functions logs telnyx-mcp-handler
```

## 🎯 Expected Results

When everything is configured correctly:

1. **Incoming calls** → Answered automatically
2. **AI greeting** → Plays immediately
3. **Customer speaks** → Transcribed by Whisper
4. **AI responds** → Generated by GPT-4
5. **Call ends** → Logged in database

## 🔧 Troubleshooting

### Issue: MCP Server not appearing in Telnyx
- Verify the edge function URL is correct
- Check that the function is deployed
- Ensure API key has proper permissions

### Issue: Calls not being answered
- Check `mcp_enabled` is `true` in database
- Verify MCP Server ID is correct
- Check edge function logs for errors

### Issue: No AI responses
- Verify `OPENAI_API_KEY` is set in Supabase secrets
- Check AI configuration in `ai_dispatcher_configs` table
- Review edge function logs for API errors

## 📊 Performance Metrics

After setup, you should see:
- **Response time**: < 1 second
- **Transcription accuracy**: > 95%
- **Call completion rate**: > 90%
- **Cost per call**: ~$0.05-0.10

## 🎉 Success Indicators

✅ MCP Server shows "Active" in Telnyx
✅ Phone number connected to MCP Server
✅ Test calls are answered automatically
✅ AI responds appropriately to queries
✅ Call logs appear in database

## 📝 Next Steps

1. **Customize AI behavior**: Update `ai_dispatcher_configs` table
2. **Add business logic**: Modify edge function for specific actions
3. **Enable recording**: Add call recording for quality assurance
4. **Set up analytics**: Create dashboard for call metrics
5. **Scale up**: Add more phone numbers with same MCP Server

## 💡 Pro Tips

1. **Test with low volume first** - Start with internal testing
2. **Monitor costs** - Set up billing alerts in Telnyx
3. **Regular backups** - Export call logs weekly
4. **Update prompts** - Refine AI responses based on actual calls
5. **Security** - Rotate webhook secrets monthly

---

**Support**: If you encounter issues, check:
- Supabase Edge Function logs
- Telnyx portal events
- Browser console for errors
- Database for call logs
