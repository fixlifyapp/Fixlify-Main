# Quick Reference: Adding Invoice/Estimate Send Functionality

## For Invoices

### Option 1: Use InvoiceSendButton (Recommended)
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
  onSuccess={() => refreshInvoices()}
/>
```

### Option 2: Use the Hook
```tsx
import { useUniversalDocumentSend } from '@/hooks/useUniversalDocumentSend';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';

const { sendState, openSendDialog, closeSendDialog, handleSendSuccess, isOpen } = 
  useUniversalDocumentSend({ onSuccess: () => toast.success('Sent!') });

// In your JSX
<Button onClick={() => openSendDialog(invoice, 'invoice', clientInfo)}>
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
```

## For Estimates

### Option 1: Use EstimateSendButton (Recommended)
```tsx
import { EstimateSendButton } from '@/components/shared/EstimateSendButton';

// In your component
<EstimateSendButton
  estimate={estimate}
  clientInfo={{
    name: client.name,
    email: client.email,
    phone: client.phone
  }}
  onSuccess={() => refreshEstimates()}
/>
```

## Required Document Properties

### Invoice must have:
- `id: string`
- `invoice_number: string`
- `total: number`

### Estimate must have:
- `id: string`
- `estimate_number: string`
- `total: number`

### Optional but recommended:
- `client_name: string`
- `client_email: string`
- `client_phone: string`

## Do NOT use these old patterns:
```tsx
// ❌ Don't call edge functions directly
await supabase.functions.invoke('send-invoice', {...});

// ❌ Don't use invoice-actions.ts functions
invoiceActions.sendInvoice({...});

// ❌ Don't create custom send dialogs
<MyCustomSendDialog />
```

## Always use UniversalSendDialog system! ✅
