# Telnyx AI Assistant Setup Checklist

## Prerequisites
- [ ] Telnyx account created
- [ ] API Key generated
- [ ] Phone number purchased
- [ ] Webhook URLs configured

## Configuration Steps

### 1. Telnyx Portal Settings
- [ ] AI Assistant created
- [ ] Voice model selected (KokoroTTS)
- [ ] Phone number assigned to assistant
- [ ] Webhook endpoints configured

### 2. Application Settings
- [ ] API Key added to environment variables
- [ ] Phone number configured
- [ ] Assistant ID stored
- [ ] Voice settings configured

### 3. Testing
- [ ] Test call functionality
- [ ] Voice preview working
- [ ] Webhook receiving events
- [ ] AI responses working

## Current Configuration Status
- API Key: NOT SET
- Phone Number: +14375249932 (needs verification)
- Assistant ID: NOT SET
- Voice Model: NOT CONFIGURED

## Files to Update:
1. `/supabase/functions/.env` - Add Telnyx API key
2. Database `api_keys` table - Store API key securely
3. Phone number configuration - Link to AI assistant
4. Voice settings - Configure KokoroTTS models
