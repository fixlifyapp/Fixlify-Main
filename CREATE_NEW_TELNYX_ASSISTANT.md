# QUICK SETUP: Create New Telnyx AI Assistant

## Step 1: Create New Assistant in Telnyx
1. Go to AI > AI Assistants
2. Click "Create New Assistant"
3. Name: "Fixlify AI Assistant"

## Step 2: Basic Settings
- Name: Main
- Model: Qwen/Qwen3-235B-A22B (or your preference)
- Voice: alloy

## Step 3: Instructions (paste this):
You are {{agent_name}} for {{company_name}}, a {{business_niche}} specialist.

Always respond immediately. Never be silent.
- "hello" → "Hi! I can help with your {{business_niche}} needs. What's your issue?"
- "appointment" → "I'll help schedule that. What day works best?"
- [SILENCE] → "Are you still there? I'm here to help."

## Step 4: Greeting:
{{greeting}}

## Step 5: CRITICAL - Dynamic Variables Webhook URL:
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook

## Step 6: Phone Number
Assign to: +14375249932

## Step 7: Save and Test!