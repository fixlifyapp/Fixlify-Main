# Test Edge Functions Script

Write-Host "Testing Edge Functions for Estimate/Invoice Sending"
Write-Host "=================================================="
Write-Host ""

# Test to check if environment variables are set
Write-Host "Please verify the following environment variables are set in Supabase:"
Write-Host "1. MAILGUN_API_KEY - Required for email sending"
Write-Host "2. TELNYX_API_KEY - Required for SMS sending"
Write-Host "3. TELNYX_PHONE_NUMBER - Phone number for SMS"
Write-Host ""
Write-Host "To check/set these, go to:"
Write-Host "https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets"
Write-Host ""
Write-Host "Or access directly from the link mentioned in the documents:"
Write-Host "https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets"
Write-Host ""

# Check if the edge functions exist
Write-Host "Edge Functions Status:"
Write-Host "- send-estimate: Version 2 (Fixed)"
Write-Host "- send-invoice: Version 125 (Fixed)"
Write-Host "- send-estimate-sms: Should exist"
Write-Host "- send-invoice-sms: Should exist"
Write-Host "- telnyx-sms: Required for SMS sending"
Write-Host ""

Write-Host "Common Issues:"
Write-Host "1. If SMS sending fails, check if telnyx-sms edge function exists"
Write-Host "2. If email sending fails, verify MAILGUN_API_KEY is set"
Write-Host "3. Make sure phone numbers are formatted correctly (10 digits)"
