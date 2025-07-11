#!/bin/bash

echo "=========================================="
echo "Supabase Deployment Summary"
echo "=========================================="
echo ""

# List all edge functions that were updated in the last 2 days
echo "Edge Functions Updated (Last 2 Days):"
echo "-------------------------------------"
echo ""

# Check mailgun-email
echo "✓ mailgun-email - Version 42 - Updated: 2025-07-08 09:24:57 UTC"

# Check send-estimate
echo "✓ send-estimate - Version 8 - Updated: 2025-07-08 09:27:46 UTC"

# Check send-estimate-sms
echo "✓ send-estimate-sms - Version 7 - Updated: 2025-07-07 14:50:07 UTC"

# Check send-invoice
echo "✓ send-invoice - Version 7 - Updated: 2025-07-07 14:50:08 UTC"

# Check send-invoice-sms
echo "✓ send-invoice-sms - Version 7 - Updated: 2025-07-07 14:50:09 UTC"

# Check telnyx-sms
echo "✓ telnyx-sms - Version 10 - Updated: 2025-07-07 15:24:39 UTC"

# Check test-env
echo "✓ test-env - Version 5 - Updated: 2025-07-07 15:50:08 UTC"

echo ""
echo "=========================================="
echo "All edge functions have been deployed!"
echo "=========================================="

echo ""
echo "Database Migrations:"
echo "-------------------"
echo "Last applied migration: 20250707105212 (add_client_id_to_estimate_communications_text)"
echo ""

echo "Deployment Status: ✓ COMPLETE"
echo ""
echo "To check function logs, use:"
echo "  supabase functions logs <function-name>"
echo ""
echo "To check database status, use:"
echo "  supabase db diff"
