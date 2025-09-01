# TEMPORARY FIX FOR TELNYX VARIABLES

Since Supabase Edge Functions require authentication that Telnyx can't provide, you have two options:

## Option 1: Manual Variables (Immediate Fix)
Fill in the Dynamic Variables fields in Telnyx manually:

| Field | Value |
|-------|-------|
| greeting | Thank you for calling Nicks appliance repair. I'm Sarah. Which appliance needs our attention today? |
| agent_name | Sarah |
| company_name | Nicks appliance repair |
| business_niche | Appliance Repair |
| services_offered | Refrigerator, Washer, Dryer, Dishwasher, and Oven repair |
| hours_of_operation | Monday-Friday 9am-6pm |
| additional_info | Service call $129. Emergency+$50. 90-day warranty. Senior discount 10%. Same-day service available |
| ai_capabilities | I can schedule appointments, answer questions about our services, provide pricing information, check technician availability, and help with emergency issues |
| agent_personality | Be helpful with troubleshooting, understanding about appliance frustrations, clear about repair vs replace decisions |
| is_existing_customer | false |
| customer_name | (leave empty) |
| customer_history | (leave empty) |
| outstanding_balance | 0 |
| call_transfer_message | Let me transfer you to a specialist who can better assist you with that |

## Option 2: Use a Different Webhook Service
Since Supabase requires authentication, you could:
1. Use Pipedream or Webhook.site to create a public endpoint
2. Have it proxy the request to Supabase with proper authentication
3. Return the response to Telnyx

## The Issue:
- Supabase Edge Functions ALWAYS require "Authorization: Bearer [token]" header
- Telnyx can't send this header format
- The ?apikey= parameter doesn't work with Supabase Edge Functions
- This is why you're getting 401 Unauthorized errors

## Why It Worked Before:
Either:
1. Supabase changed their authentication requirements
2. Telnyx changed how they send webhooks
3. The configuration was different

For now, manually fill in the Dynamic Variables fields to get it working immediately.