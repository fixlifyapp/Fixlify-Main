# Universal Document Send Implementation Guide

## Overview
The Universal Document Send system provides a consistent way to send invoices and estimates via email or SMS throughout the Fixlify application.

## Core Components

### 1. UniversalSendDialog
Location: `/src/components/jobs/dialogs/shared/UniversalSendDialog.tsx`
- Main dialog component for sending documents
- Handles both email and SMS sending
- Validates phone numbers and email addresses
- Shows loading states and error messages

### 2. useDocumentSending Hook
Location: `/src/hooks/useDocumentSending.ts`
- Handles the actual sending logic
- Calls appropriate edge functions (send-invoice, send-estimate, etc.)
- Provides loading state and error handling

### 3. useUniversalDocumentSend Hook
Location: `/src/hooks/useUniversalDocumentSend.ts`
- Manages dialog state
- Provides easy integration for any component
- Handles success callbacks

### 4. Ready-to-use Components
- `InvoiceSendButton`: `/src/components/shared/InvoiceSendButton.tsx`
- `EstimateSendButton`: `/src/components/shared/EstimateSendButton.tsx`

## Implementation Examples

### Example 1: Using the InvoiceSendButton Component
```tsx
import { InvoiceSendButton } from '@/components/shared/InvoiceSendButton';

// In your component
<InvoiceSendButton
  invoice={invoice}
  clientInfo={{
    name: client.name,
    email: client.email,
    phone: client.phone
  }}
  onSuccess={() => {
    // Refresh invoices or other actions
    refreshInvoices();
  }}
/>
```

### Example 2: Using the Hook Directly
```tsx
import { useUniversalDocumentSend } from '@/hooks/useUniversalDocumentSend';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';

export const MyComponent = () => {
  const {
    sendState,
    openSendDialog,
    closeSendDialog,
    handleSendSuccess,
    isOpen
  } = useUniversalDocumentSend({
    onSuccess: () => {
      toast.success('Document sent!');
      refreshData();
    }
  });

  const handleSendInvoice = (invoice) => {
    openSendDialog(invoice, 'invoice', {
      name: invoice.client_name,
      email: invoice.client_email,
      phone: invoice.client_phone
    });
  };

  return (
    <>
      <Button onClick={() => handleSendInvoice(invoice)}>
        Send Invoice
      </Button>

      {isOpen && sendState && (
        <UniversalSendDialog
          isOpen={isOpen}
          onClose={closeSendDialog}
          documentType={sendState.documentType}
          documentId={sendState.documentId}
          documentNumber={sendState.documentNumber}
          total={sendState.total}
          contactInfo={sendState.contactInfo}
          onSuccess={handleSendSuccess}
        />
      )}
    </>
  );
};
```

### Example 3: Multiple Documents in a List
```tsx
import { InvoiceSendButton } from '@/components/shared/InvoiceSendButton';

const InvoiceList = ({ invoices, clients }) => {
  return (
    <div>
      {invoices.map(invoice => {
        const client = clients.find(c => c.id === invoice.client_id);
        
        return (
          <div key={invoice.id} className="invoice-row">
            <span>{invoice.invoice_number}</span>
            <span>${invoice.total}</span>
            
            <InvoiceSendButton
              invoice={invoice}
              clientInfo={client ? {
                name: client.name,
                email: client.email,
                phone: client.phone
              } : undefined}
              onSuccess={() => {
                // Update invoice status
                updateInvoiceStatus(invoice.id, 'sent');
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
```

## Edge Functions
The system uses the following edge functions:
- `send-invoice`: Sends invoice via email
- `send-invoice-sms`: Sends invoice via SMS
- `send-estimate`: Sends estimate via email
- `send-estimate-sms`: Sends estimate via SMS

## Required Document Properties
For the send functionality to work properly, documents must have:

### Invoice
```typescript
{
  id: string;
  invoice_number: string;
  total: number;
  // Optional but recommended:
  client_name?: string;
  client_email?: string;
  client_phone?: string;
}
```

### Estimate
```typescript
{
  id: string;
  estimate_number: string;
  total: number;
  // Optional but recommended:
  client_name?: string;
  client_email?: string;
  client_phone?: string;
}
```

## Best Practices

1. **Always provide client info**: If available, always pass client contact information to pre-fill the dialog
2. **Handle success callbacks**: Use the onSuccess callback to refresh data or update UI
3. **Use the ready-made components**: When possible, use InvoiceSendButton or EstimateSendButton
4. **Loading states**: The dialog handles loading states automatically
5. **Error handling**: The system shows user-friendly error messages automatically

## Migration Guide

If you have existing code that sends invoices/estimates directly:

### Old Pattern (Don't use):
```tsx
// Direct edge function call
await supabase.functions.invoke('send-invoice', {
  body: { invoiceId, recipientEmail }
});
```

### New Pattern (Use this):
```tsx
import { InvoiceSendButton } from '@/components/shared/InvoiceSendButton';

<InvoiceSendButton
  invoice={invoice}
  clientInfo={clientInfo}
  onSuccess={handleSuccess}
/>
```

## Testing
1. Test with valid and invalid email addresses
2. Test with valid and invalid phone numbers
3. Test the loading states
4. Test error scenarios (network issues, etc.)
5. Verify success callbacks are triggered

## Common Issues and Solutions

### Issue: Dialog not opening
- Ensure you're passing all required props
- Check that the document object has required fields (id, number, total)

### Issue: Client info not pre-filled
- Verify the clientInfo object has the correct structure
- Check that email/phone fields are not empty strings

### Issue: Send failing
- Check browser console for errors
- Verify edge functions are deployed
- Ensure Supabase client is authenticated

## Future Enhancements
- Template selection for custom messages
- Bulk sending functionality
- Send history tracking
- Delivery status tracking
