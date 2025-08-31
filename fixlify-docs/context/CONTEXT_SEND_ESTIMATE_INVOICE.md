# Context Engineering: Send Estimate/Invoice System

## Overview
Fixlify has a comprehensive system for sending estimates and invoices via SMS and Email. The system uses Edge Functions for secure communication and includes portal links for clients to view/approve documents.

## Key Components

### Edge Functions
1. **send-estimate** - Sends estimate via email
2. **send-estimate-sms** - Sends estimate via SMS  
3. **send-invoice** - Sends invoice via email
4. **send-invoice-sms** - Sends invoice via SMS

### Portal System
- Estimates and invoices include secure portal links
- Portal tokens are generated for security (no direct IDs in URLs)
- Clients can view, approve, and pay through the portal
- Portal URL format: `https://hub.fixlify.app/portal/{token}`

## How to Send Estimates/Invoices

### Via UI
1. Go to Estimates or Invoices page
2. Click on the estimate/invoice row
3. Use the "Send" button in the action menu
4. Choose SMS or Email
5. System automatically sends with portal link

### Via Code (Edge Functions)
```javascript
// Send Estimate via SMS
await supabase.functions.invoke('send-estimate-sms', {
  body: {
    estimateId: 'estimate-id-here',
    phoneNumber: '+1234567890' // optional, uses client's phone if not provided
  }
});

// Send Invoice via Email
await supabase.functions.invoke('send-invoice', {
  body: {
    invoiceId: 'invoice-id-here',
    email: 'client@email.com' // optional, uses client's email if not provided
  }
});
```

## Message Templates

### SMS Templates
- **Estimate**: "Hello {client.name}! Your Estimate #{number} for ${total} is ready. View and approve here: {portal_link} - {company.name} Team"
- **Invoice**: "Hi {client.name}, your Invoice #{number} for ${total} is ready. View and pay online: {portal_link} - {company.name}"

### Email Templates
- Full HTML templates with company branding
- Includes line items, totals, and action buttons
- Portal link for online viewing/payment

## Important Notes

1. **Phone Number Format**: 
   - Edge functions automatically format to E.164 (+1234567890)
   - Frontend can accept any format

2. **Portal Security**:
   - Each document gets a unique portal token
   - Tokens stored in `portal_access_token` field
   - No direct IDs exposed in URLs

3. **Communication Logging**:
   - All sends are logged in `communication_logs` table
   - Tracks status, recipient, content, and timestamps

4. **Error Handling**:
   - Functions return detailed error messages
   - Common errors: missing phone/email, invalid document ID
   - All errors logged for debugging

## Database Structure

### Estimates Table
- `portal_access_token` - Unique token for portal access
- `client_id` - Links to client
- `status` - draft, sent, viewed, approved, declined
- `sent_at` - Timestamp when sent
- `viewed_at` - Timestamp when viewed in portal

### Invoices Table  
- `portal_access_token` - Unique token for portal access
- `client_id` - Links to client
- `status` - draft, sent, viewed, paid, overdue
- `sent_at` - Timestamp when sent
- `paid_at` - Timestamp when paid

## Testing Send Functions

1. **Check API Keys**:
   ```javascript
   await supabase.functions.invoke('check-api-keys')
   // Should return { mailgun: true, telnyx: true }
   ```

2. **Test Send**:
   - Create test estimate/invoice
   - Use send button in UI
   - Check `communication_logs` for entry
   - Verify client receives message

## Common Issues & Solutions

1. **"No phone number configured"**
   - User needs primary phone in Settings > Phone Numbers
   - Check `phone_numbers` table

2. **"Client has no phone/email"**
   - Update client record with contact info
   - Can override by passing phoneNumber/email in request

3. **Portal link shows 404**
   - Check if portal_access_token exists
   - Verify document status is not 'draft'
   - Check portal routes in UniversalPortal.tsx

4. **Message not sending**
   - Verify API keys are set in Edge Function secrets
   - Check communication_logs for errors
   - Ensure phone number is E.164 format

## Related Files
- `/supabase/functions/send-estimate/`
- `/supabase/functions/send-invoice/`
- `/src/pages/UniversalPortal.tsx`
- `/src/components/estimates/EstimateActions.tsx`
- `/src/components/invoices/InvoiceActions.tsx`
