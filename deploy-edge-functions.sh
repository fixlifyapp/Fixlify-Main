#!/bin/bash

# Deploy Supabase Edge Functions for Telnyx

echo -e "\033[32mDeploying Supabase Edge Functions...\033[0m"

# Deploy setup-telnyx-number function
echo -e "\n\033[33mDeploying setup-telnyx-number...\033[0m"
npx supabase functions deploy setup-telnyx-number

# Deploy test-telnyx-connection function
echo -e "\n\033[33mDeploying test-telnyx-connection...\033[0m"
npx supabase functions deploy test-telnyx-connection

# Deploy telnyx-make-call function (already exists, just redeploy)
echo -e "\n\033[33mDeploying telnyx-make-call...\033[0m"
npx supabase functions deploy telnyx-make-call

# Deploy manage-ai-dispatcher function
echo -e "\n\033[33mDeploying manage-ai-dispatcher...\033[0m"
npx supabase functions deploy manage-ai-dispatcher

# Deploy ai-dispatcher-webhook function
echo -e "\n\033[33mDeploying ai-dispatcher-webhook...\033[0m"
npx supabase functions deploy ai-dispatcher-webhook

# Deploy telnyx-webhook-router function
echo -e "\n\033[33mDeploying telnyx-webhook-router...\033[0m"
npx supabase functions deploy telnyx-webhook-router

echo -e "\n\033[32m✅ All functions deployed successfully!\033[0m"
echo -e "\n\033[36mNow set your TELNYX_API_KEY in Supabase Dashboard:\033[0m"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to Edge Functions > Secrets"
echo "3. Add TELNYX_API_KEY with your Telnyx API key value" 