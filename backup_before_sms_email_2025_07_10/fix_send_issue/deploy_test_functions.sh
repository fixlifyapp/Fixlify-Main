#!/bin/bash
# Deploy test mode edge functions

echo "🚀 Deploying test mode edge functions..."

# Deploy send-estimate with test mode
echo "📧 Deploying send-estimate (test mode)..."
supabase functions deploy send-estimate --no-verify-jwt

# Deploy send-invoice with test mode  
echo "📧 Deploying send-invoice (test mode)..."
supabase functions deploy send-invoice --no-verify-jwt

# Deploy SMS functions with test mode
echo "📱 Deploying send-estimate-sms (test mode)..."
supabase functions deploy send-estimate-sms --no-verify-jwt

echo "📱 Deploying send-invoice-sms (test mode)..."
supabase functions deploy send-invoice-sms --no-verify-jwt

echo "✅ Test mode edge functions deployed!"
echo ""
echo "ℹ️ These functions will:"
echo "  - Log sending attempts to communication tables"
echo "  - Return success without actually sending emails/SMS"
echo "  - Work without Mailgun or Telnyx API keys"
echo ""
echo "📝 To enable production mode:"
echo "  1. Get Mailgun API key from https://mailgun.com"
echo "  2. Get Telnyx API key from https://telnyx.com"
echo "  3. Add secrets in Supabase dashboard"
