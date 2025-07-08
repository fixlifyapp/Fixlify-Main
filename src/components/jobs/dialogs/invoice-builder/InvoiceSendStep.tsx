import React from 'react';
import { Button } from '@/components/ui/button';

export interface InvoiceSendStepProps {
  invoiceId: string;
  onSendComplete: () => void;
}

const InvoiceSendStep: React.FC<InvoiceSendStepProps> = ({
  invoiceId,
  onSendComplete
}) => {
  const handleSend = () => {
    // Send invoice logic
    onSendComplete();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Send Invoice</h3>
      <p>Ready to send invoice: {invoiceId}</p>
      <Button onClick={handleSend}>
        Send Invoice
      </Button>
    </div>
  );
};

export default InvoiceSendStep;
