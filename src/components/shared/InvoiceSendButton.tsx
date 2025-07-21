import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface InvoiceSendButtonProps {
  invoice: any;
  onSend?: () => void;
}

export const InvoiceSendButton = ({ invoice, onSend }: InvoiceSendButtonProps) => {
  return (
    <Button onClick={onSend} size="sm" className="gap-2">
      <Send className="h-4 w-4" />
      Send Invoice
    </Button>
  );
};