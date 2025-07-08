
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface CallButtonProps {
  defaultToNumber?: string;
  phoneNumber?: string;
  defaultClientId?: string;
  clientId?: string;
  clientName?: string;
  variant?: string;
  size?: string;
  showText?: boolean;
  onCallStateChange?: (state: any) => void;
}

const CallButton: React.FC<CallButtonProps> = ({ 
  defaultToNumber, 
  defaultClientId, 
  onCallStateChange 
}) => {
  const handleCall = () => {
    // Implement call functionality
    if (onCallStateChange) {
      onCallStateChange({
        status: 'calling',
        number: defaultToNumber,
        clientId: defaultClientId
      });
    }
  };

  return (
    <Button 
      onClick={handleCall}
      className="flex items-center gap-2"
    >
      <Phone className="h-4 w-4" />
      Call
    </Button>
  );
};

export default CallButton;
export { CallButton };
