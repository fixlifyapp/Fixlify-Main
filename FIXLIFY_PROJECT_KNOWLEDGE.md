# FIXLIFY PROJECT KNOWLEDGE

## SMS/Email Communication System (Updated July 2025)

### Overview
Complete two-way SMS conversation system integrated with Telnyx for SMS messaging. Email functionality pending implementation with Mailgun.

### Database Schema
- `phone_numbers` - Stores user phone numbers for SMS sending
- `communication_logs` - Tracks all SMS/email communications with full audit trail
- `message_templates` - Reusable message templates with variable substitution
- `organization_communication_settings` - Organization-wide communication settings
- `sms_conversations` - SMS conversation threads between users and clients
- `sms_messages` - Individual SMS messages within conversations

### Edge Functions
- `send-sms` - Main SMS sending function with Telnyx integration
- `telnyx-webhook` - Handles delivery status updates from Telnyx (deprecated)
- `sms-webhook` - New webhook handler for incoming SMS messages and status updates

### Features Implemented
1. **SMS Sending**: Full SMS capability via Telnyx API
2. **Two-way SMS Conversations**: Real-time messaging interface in Connect Center
3. **Phone Number Management**: Users can have multiple phone numbers with primary designation
4. **Communication Logging**: All communications tracked with status updates
5. **Message Templates**: Reusable templates with variable substitution
6. **Error Handling**: Comprehensive error tracking and user feedback
7. **Security**: RLS policies ensure users only see their own data
8. **Real-time Updates**: Live message updates using Supabase realtime subscriptions
9. **Conversation Management**: Create, view, and manage SMS conversations with clients
10. **Unread Counts**: Track unread messages per conversation

### Testing
- SMS conversations available in Connect Center at `/communications`
- Test page available at `/sms-test` when logged in
- Requires Telnyx API credentials in Supabase secrets
- User must have a primary phone number configured in the database

### Configuration Required
1. Set `TELNYX_API_KEY` in Supabase edge function secrets
2. Optionally set `TELNYX_MESSAGING_PROFILE_ID`
3. Add user phone numbers to `phone_numbers` table and mark one as primary
4. Configure webhook URL in Telnyx portal: `https://[your-project].supabase.co/functions/v1/sms-webhook`

### Next Steps
- Phase 4: Integrate SMS into estimate and invoice sending
- Phase 5: Add Mailgun email support
- Phase 6: Full integration across automations and client portal
- Phase 7: Add SMS templates and quick replies
- Phase 8: Implement message search and filtering

### Technical Notes
- Uses Supabase edge functions for secure API key handling
- Implements proper error handling and retry logic
- Supports webhook callbacks for delivery confirmation and incoming messages
- All communications are logged for audit and debugging
- SMS conversations use database triggers to update last message and unread counts
- Context replaced MessageContext with SMSContext for cleaner implementation
