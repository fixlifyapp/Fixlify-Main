import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Bot } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UnifiedCallManager } from './UnifiedCallManager';

interface CallButtonProps {
  phoneNumber?: string;
  clientId?: string;
  clientName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  isAICall?: boolean;
}

export const CallButton: React.FC<CallButtonProps> = ({
  phoneNumber,
  clientId,
  clientName,
  variant = 'outline',
  size = 'sm',
  showText = true,
  isAICall = false
}) => {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callState, setCallState] = useState<any>(null);

  const handleClick = () => {
    setShowCallDialog(true);
  };

  const handleCallStateChange = (state: any) => {
    setCallState(state);
    // Close dialog when call ends
    if (!state) {
      setShowCallDialog(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className="gap-1"
        disabled={!phoneNumber}
      >
        {isAICall ? <Bot className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
        {showText && (isAICall ? 'AI Call' : 'Call')}
      </Button>

      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {clientName ? `Call ${clientName}` : 'Make a Call'}
              {phoneNumber && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {formatPhoneNumber(phoneNumber)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <UnifiedCallManager 
            defaultToNumber={phoneNumber}
            defaultClientId={clientId}
            onCallStateChange={handleCallStateChange}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}; 