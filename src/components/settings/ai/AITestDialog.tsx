import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AITestDialogProps {
  open: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export const AITestDialog = ({ open, onClose, phoneNumber }: AITestDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Test AI Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="h-[500px]">
          <iframe
            src={`https://engage.telnyx.com/widget?destination=${phoneNumber.replace('+', '')}&hideDialer=false&autoConnect=false`}
            width="100%"
            height="100%"
            allow="microphone; autoplay"
            className="border-0 rounded-lg"
            title="Telnyx Voice"
          />
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Click call button above to test your AI Assistant
        </p>
      </DialogContent>
    </Dialog>
  );
};