import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface EstimateSendButtonProps {
  estimate: any;
  onSend?: () => void;
}

export const EstimateSendButton = ({ estimate, onSend }: EstimateSendButtonProps) => {
  return (
    <Button onClick={onSend} size="sm" className="gap-2">
      <Send className="h-4 w-4" />
      Send Estimate
    </Button>
  );
};