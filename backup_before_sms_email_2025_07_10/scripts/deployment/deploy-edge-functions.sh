#!/bin/bash
# Deploy all edge functions to Supabase

echo "🚀 Deploying Edge Functions to Supabase..."

# Deploy each function
echo "📦 Deploying telnyx-sms..."
supabase functions deploy telnyx-sms

echo "📦 Deploying mailgun-email..."
supabase functions deploy mailgun-email

echo "📦 Deploying send-estimate..."
supabase functions deploy send-estimate

echo "📦 Deploying send-estimate-sms..."
supabase functions deploy send-estimate-sms

echo "📦 Deploying send-invoice..."
supabase functions deploy send-invoice

echo "📦 Deploying send-invoice-sms..."
supabase functions deploy send-invoice-sms

echo "✅ All edge functions deployed successfully!"
echo "🔧 Remember to set environment variables in Supabase dashboard:"
echo "   - TELNYX_API_KEY"
echo "   - MAILGUN_API_KEY"
echo "   - TELNYX_MESSAGING_PROFILE_ID (optional)"