# Edge Functions Cleanup Guide

## Functions to Remove Immediately

### 1. telnyx-webhook (DEPRECATED)
```bash
# This function is deprecated and replaced by sms-webhook
# To remove: Delete from Supabase dashboard or CLI
```

### 2. exec-sql (SECURITY RISK)
```bash
# CRITICAL: This function allows arbitrary SQL execution
# Remove immediately to prevent security vulnerabilities
```

### 3. update-profiles-schema (ONE-TIME MIGRATION)
```bash
# This was a one-time schema update function
# No longer needed after schema is updated
```

## Functions to Review and Potentially Remove

### Voice/AI Calling Functions (Remove if not using voice features):
- realtime-voice-dispatch
- handle-ai-voice-call
- process-ai-speech
- setup-ai-dispatcher-number
- manage-ai-dispatcher
- get-ai-call-analytics

## Active Functions to Keep

### SMS/Communication:
- send-sms (Main SMS sending)
- sms-webhook (Incoming SMS handling)
- send-contact-email (Contact form emails)

### AI/Analytics:
- generate-with-ai (Business insights)
- intelligent-ai-assistant (AI help)

### Business Logic:
- automation-executor (Workflow automation)
- reports-run (Report generation)
- reports-templates (Report templates)

## Recommended Actions:

1. **Immediate**: Remove `exec-sql` - Major security risk
2. **Immediate**: Remove `telnyx-webhook` - Deprecated
3. **Soon**: Remove `update-profiles-schema` - One-time use
4. **Review**: Check if you're using voice/AI calling features
   - If not, remove all voice-related functions
5. **Update**: Any code references to removed functions
