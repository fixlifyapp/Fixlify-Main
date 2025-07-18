import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface CallButtonProps {
  phoneNumber: string;
  clientName?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
}

export const CallButton: React.FC<CallButtonProps> = ({
  phoneNumber,
  clientName,
  size = 'icon',
  variant = 'ghost'
}) => {
  const [isCallActive, setIsCallActive] = useState(false);

  const handleCall = () => {
    if (!phoneNumber) {
      toast.error('No phone number available');
      return;
    }

    if (isCallActive) {
      // End call logic would go here
      setIsCallActive(false);
      toast.info('Call ended');
    } else {
      // Start call logic would go here
      setIsCallActive(true);
      toast.success(`Calling ${clientName || phoneNumber}...`);
      
      // For now, just open the phone dialer
      window.location.href = `tel:${phoneNumber}`;
    }
  };
  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCall}
      disabled={!phoneNumber}
      title={phoneNumber ? `Call ${phoneNumber}` : 'No phone number'}
    >
      {isCallActive ? (
        <PhoneOff className={size === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />
      ) : (
        <Phone className={size === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />
      )}
      {size !== 'icon' && (isCallActive ? 'End Call' : 'Call')}
    </Button>
  );
};
