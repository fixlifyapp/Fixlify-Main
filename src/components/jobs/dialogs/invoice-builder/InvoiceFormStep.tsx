
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InvoiceData } from '@/hooks/useInvoiceBuilder';

interface InvoiceFormStepProps {
  invoiceData: InvoiceData;
  onUpdate: (updates: Partial<InvoiceData>) => void;
}

export const InvoiceFormStep: React.FC<InvoiceFormStepProps> = ({
  invoiceData,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoice_number">Invoice Number</Label>
            <Input
              id="invoice_number"
              value={invoiceData.invoice_number}
              onChange={(e) => onUpdate({ invoice_number: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={invoiceData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={invoiceData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={invoiceData.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
