import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceSendButton } from '@/components/shared/InvoiceSendButton';
import { EstimateSendButton } from '@/components/shared/EstimateSendButton';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

// Example: Invoice List with Send Functionality
export const InvoiceListExample = ({ invoices, clients, onInvoiceSent }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map(invoice => {
            // Find client info for pre-filling send dialog
            const client = clients?.find(c => c.id === invoice.client_id);
            
            return (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{invoice.invoice_number}</h4>
                  <p className="text-sm text-muted-foreground">
                    {client?.name || 'Unknown Client'} • {formatCurrency(invoice.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {/* Other action buttons */}
                  
                  {/* Universal Send Button */}
                  <InvoiceSendButton
                    invoice={invoice}
                    clientInfo={client ? {
                      name: client.name,
                      email: client.email,
                      phone: client.phone
                    } : undefined}
                    onSuccess={() => {
                      // Update local state or refresh data
                      onInvoiceSent?.(invoice.id);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Example: Estimate List with Send Functionality
export const EstimateListExample = ({ estimates, clients, onEstimateSent }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {estimates.map(estimate => {
            const client = clients?.find(c => c.id === estimate.client_id);
            
            return (
              <div key={estimate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{estimate.estimate_number}</h4>
                  <p className="text-sm text-muted-foreground">
                    {client?.name || 'Unknown Client'} • {formatCurrency(estimate.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {/* Universal Send Button */}
                  <EstimateSendButton
                    estimate={estimate}
                    clientInfo={client ? {
                      name: client.name,
                      email: client.email,
                      phone: client.phone
                    } : undefined}
                    onSuccess={() => {
                      onEstimateSent?.(estimate.id);
                    }}
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Example: Custom Implementation with Hook
export const CustomDocumentList = ({ documents, type }) => {
  const { sendState, openSendDialog, closeSendDialog, handleSendSuccess, isOpen } = 
    useUniversalDocumentSend({
      onSuccess: () => {
        toast.success(`${type === 'invoice' ? 'Invoice' : 'Estimate'} sent successfully!`);
        // Refresh data or update status
      }
    });

  const handleSend = (document, clientInfo) => {
    openSendDialog(document, type, clientInfo);
  };

  return (
    <>
      <div className="space-y-4">
        {documents.map(doc => (
          <div key={doc.id} className="flex justify-between items-center">
            <span>{doc.number}</span>
            <Button onClick={() => handleSend(doc, doc.clientInfo)}>
              Send
            </Button>
          </div>
        ))}
      </div>

      {/* Single dialog instance for all documents */}
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