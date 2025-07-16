#!/bin/bash
# Script to remove duplicate/test edge functions from Supabase

echo "=== Cleaning up duplicate Edge Functions ==="
echo ""
echo "This script will remove the following test/duplicate functions:"
echo "- test-sms"
echo "- test-sms-debug"
echo "- test-env"
echo "- send-email (replaced by mailgun-email)"
echo ""
echo "Make sure you have the Supabase CLI installed and are logged in."
echo ""
read -p "Do you want to proceed? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Removing test functions..."
    
    # Remove test-sms
    echo "Removing test-sms..."
    supabase functions delete test-sms
    
    # Remove test-sms-debug
    echo "Removing test-sms-debug..."
    supabase functions delete test-sms-debug
    
    # Remove test-env
    echo "Removing test-env..."
    supabase functions delete test-env
    
    # Remove old send-email function
    echo "Removing send-email (replaced by mailgun-email)..."
    supabase functions delete send-email
    
    echo ""
    echo "✅ Cleanup complete!"
    echo ""
    echo "Remaining functions should be:"
    echo "- SMS: send-sms (or telnyx-sms), sms-webhook"
    echo "- Email: mailgun-email, mailgun-webhook"
    echo "- Documents: send-estimate, send-estimate-sms, send-invoice, send-invoice-sms"
    echo "- Phone management: phone-number-marketplace"
    echo "- Webhooks: telnyx-webhook"
else
    echo "Cleanup cancelled."
fi
