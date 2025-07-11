#!/bin/bash
# Supabase Edge Functions Cleanup Script

echo "Starting Supabase Edge Functions Cleanup..."

# Delete duplicate/old functions
echo "Removing duplicate functions..."
supabase functions delete send-invoice-email --project-ref mqppvcrlvsgrsqelglod
supabase functions delete email-send --project-ref mqppvcrlvsgrsqelglod

# Functions that need redeployment with new Telnyx API
TELNYX_FUNCTIONS=(
    "telnyx-sms"
    "send-invoice-sms"
    "send-estimate-sms"
    "telnyx-webhook"
    "telnyx-voice-webhook"
    "telnyx-phone-numbers"
    "manage-phone-numbers"
    "setup-telnyx-number"
    "sync-telnyx-numbers"
    "telnyx-phone-manager"
    "telnyx-webhook-handler"
    "telnyx-webhook-router"
    "telnyx-make-call"
    "telnyx-messaging-profile"
)

echo "Functions that need redeployment with new Telnyx API:"
for func in "${TELNYX_FUNCTIONS[@]}"; do
    echo "- $func"
done

# Check current webhook URLs
echo -e "\nChecking webhook configurations..."
echo "Make sure these URLs are configured in your services:"
echo "Telnyx Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook"
echo "Mailgun Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook"
