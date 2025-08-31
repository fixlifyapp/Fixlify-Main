# Supabase Edge Functions Analysis Report

## Summary
Total Edge Functions in Codebase: 48
Functions Actually Used in Code: 29
Unused Functions: 19

## Functions Currently Used in Application

### Core Communication Functions
1. **telnyx-sms** - SMS messaging service (heavily used)
2. **send-email** - Email service via SMTP
3. **mailgun-email** - Mailgun email service
4. **send-estimate** - Estimate document sending
5. **send-estimate-sms** - SMS estimate sending
6. **send-invoice** - Invoice document sending
7. **send-invoice-sms** - SMS invoice sending

### Automation Functions
8. **automation-executor** - Core automation processing (heavily used)
9. **generate-ai-message** - AI message generation
10. **ai-workflow-assistant** - AI workflow assistance

### Phone/Call Management
11. **telnyx-make-call** - Outbound calling
12. **telnyx-call-control** - Call control operations
13. **telnyx-conference-control** - Conference call management
14. **telnyx-phone-numbers** - Phone number management
15. **ai-dispatcher-handler** - AI dispatcher configuration
16. **setup-ai-dispatcher-number** - AI dispatcher setup
17. **manage-phone-numbers** - Phone number operations

### Testing & Debugging
18. **test-telnyx-connection** - Telnyx connection testing
19. **check-email-config** - Email configuration check
20. **check-telnyx-account** - Telnyx account verification
21. **test-smtp** - SMTP testing

### Other Active Functions
22. **enhanced-communication-logger** - Communication logging
23. **get-ai-call-analytics** - AI call analytics
24. **send-team-invitation** - Team invitations
25. **portal-data** - Client portal data
26. **manage-mailgun-domains** - Mailgun domain management
27. **ai-dispatcher-configs** - AI dispatcher configuration
28. **convert-estimate-to-invoice** - Estimate conversion
29. **send-sms** - Generic SMS sending

## Unused Edge Functions (Not Found in Code)

### AI/Assistant Functions
1. **ai-actions** - No references found
2. **ai-appointment-handler** - No references found
3. **ai-assistant-webhook** - No references found
4. **ai-client-lookup** - No references found
5. **automation-ai-assistant** - No references found
6. **create-ai-assistant** - No references found

### Automation Functions
7. **automation-executor-v2** - Appears to be unused (v1 is active)
8. **automation-scheduler** - No references found
9. **process-automation-queue** - No references found
10. **process-scheduled-automations** - No references found

### Communication Functions
11. **book-appointment** - No references found
12. **email-webhook** - No references found
13. **sms-webhook** - No references found
14. **telnyx-webhook** - No references found

### Voice/Call Functions
15. **realtime-voice-bridge** - No references found
16. **telnyx-call-recording** - No references found
17. **telnyx-call-status** - No references found
18. **telnyx-phone-purchase** - No references found
19. **telnyx-phone-search** - No references found
20. **telnyx-voice-config** - No references found
21. **telnyx-voice-webhook** - No references found
22. **telnyx-webrtc-call** - No references found
23. **telnyx-mcp-handler** - No references found
24. **update-assistant-voice** - No references found

### Testing Functions
25. **test-email** - No references found
26. **test-env** - No references found
27. **test-send-estimate** - No references found
28. **test-telnyx** - No references found
29. **test-voice** - No references found

### Utility Functions
30. **check-api-keys** - No references found
31. **get-telnyx-token** - No references found

## Recommendations

### High Priority
1. **Remove unused v2 automation executor** - automation-executor-v2 appears to be a duplicate
2. **Consolidate webhook handlers** - Multiple webhook functions exist but aren't used
3. **Clean up test functions** - Several test functions in production that should be removed

### Medium Priority
1. **Review AI assistant functions** - Many AI-related functions aren't integrated
2. **Evaluate voice/call recording** - Recording functions exist but not implemented
3. **Check automation queue processors** - Queue-based automation functions not in use

### Low Priority
1. **Document or remove utility functions** - Several utility functions with no clear purpose
2. **Consolidate similar functions** - Some functions appear to have overlapping functionality

## Deployment Status
Unable to verify remote deployment status due to authentication requirements.
Recommend manual verification of deployed functions against this list.