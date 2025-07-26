import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getUserPhoneNumber } from '@/config/telnyx';

interface OutboundCallDialogProps {
  open: boolean;
  onClose: () => void;
  defaultNumber?: string;
  clientName?: string;
}

export const OutboundCallDialog = ({
  open,
  onClose,
  defaultNumber = '',
  clientName = ''
}: OutboundCallDialogProps) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(defaultNumber);
  const [isDialing, setIsDialing] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const initiateCall = async () => {
    if (!user?.id) {
      toast.error('Please log in to make calls');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsDialing(true);

    try {
      // Get user's phone number
      const fromNumber = await getUserPhoneNumber(user.id);
      
      // Clean the phone number (remove formatting)
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const toNumber = cleanNumber.length === 10 ? `+1${cleanNumber}` : `+${cleanNumber}`;

      // Make the call via Supabase function
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: toNumber,
          from: fromNumber,
          userId: user.id,
          clientId: null
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Calling ${clientName || phoneNumber}...`);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }

    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to make call');
    } finally {
      setIsDialing(false);
    }
  };

  const handleClose = () => {
    if (!isDialing) {
      setPhoneNumber('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Make a Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {clientName && (
            <div className="text-sm text-muted-foreground">
              Calling: <span className="font-medium">{clientName}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="pr-10"
                maxLength={14}
                disabled={isDialing}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDialing}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={initiateCall}
              disabled={isDialing || !phoneNumber.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              {isDialing ? 'Dialing...' : 'Call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};