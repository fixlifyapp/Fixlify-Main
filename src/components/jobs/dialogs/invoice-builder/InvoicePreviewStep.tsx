
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceData } from '@/hooks/useInvoiceBuilder';
import { formatCurrency } from '@/lib/currency';

interface InvoicePreviewStepProps {
  invoiceData: InvoiceData;
}

export const InvoicePreviewStep: React.FC<InvoicePreviewStepProps> = ({
  invoiceData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-6 bg-white">
          <div className="text-2xl font-bold mb-4">
            Invoice #{invoiceData.invoice_number}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold">{invoiceData.title}</h3>
            <p className="text-muted-foreground">{invoiceData.description}</p>
          </div>

          {invoiceData.items.length > 0 && (
            <div className="mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Description</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td>{item.description}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.rate)}</td>
                      <td className="text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-4 text-right space-y-1">
                <div>Subtotal: {formatCurrency(invoiceData.subtotal)}</div>
                <div>Tax: {formatCurrency(invoiceData.tax_amount)}</div>
                <div className="font-bold text-lg">
                  Total: {formatCurrency(invoiceData.total)}
                </div>
              </div>
            </div>
          )}

          {invoiceData.notes && (
            <div className="mt-4">
              <h4 className="font-semibold">Notes:</h4>
              <p className="text-sm text-muted-foreground">{invoiceData.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
