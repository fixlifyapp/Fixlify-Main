import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CallTransferProps {
  open: boolean;
  onClose: () => void;
  callControlId: string;
  currentCall: {
    from: string;
    to: string;
  };
}

export const CallTransfer = ({
  open,
  onClose,
  callControlId,
  currentCall
}: CallTransferProps) => {
  const [transferNumber, setTransferNumber] = useState('');
  const [transferType, setTransferType] = useState<'warm' | 'cold'>('warm');
  const [isTransferring, setIsTransferring] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setTransferNumber(formatted);
  };

  const handleTransfer = async () => {
    if (!transferNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsTransferring(true);

    try {
      // Clean the phone number (remove formatting)
      const cleanNumber = transferNumber.replace(/\D/g, '');
      const formattedNumber = cleanNumber.length === 10 ? `+1${cleanNumber}` : `+${cleanNumber}`;

      const { data, error } = await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action: 'transfer',
          callControlId,
          transferTo: formattedNumber,
          transferType
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Call ${transferType === 'warm' ? 'warm' : 'cold'} transferred successfully`);
        onClose();
      } else {
        throw new Error(data.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Failed to transfer call');
    } finally {
      setIsTransferring(false);
    }
  };

  const quickTransfers = [
    { name: 'Support Team', number: '+1234567890' },
    { name: 'Manager', number: '+1234567891' },
    { name: 'Tech Support', number: '+1234567892' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Transfer Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Call Info */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium mb-2">Current Call</h4>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{currentCall.from}</Badge>
              <ArrowRight className="h-3 w-3" />
              <Badge variant="outline">{currentCall.to}</Badge>
            </div>
          </div>

          {/* Transfer Type */}
          <div className="space-y-2">
            <Label>Transfer Type</Label>
            <div className="flex gap-2">
              <Button
                variant={transferType === 'warm' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransferType('warm')}
              >
                Warm Transfer
              </Button>
              <Button
                variant={transferType === 'cold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransferType('cold')}
              >
                Cold Transfer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {transferType === 'warm' 
                ? 'Announce the caller before transferring' 
                : 'Transfer immediately without announcement'
              }
            </p>
          </div>

          {/* Quick Transfer Options */}
          <div className="space-y-2">
            <Label>Quick Transfer</Label>
            <div className="space-y-1">
              {quickTransfers.map((contact, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTransferNumber(contact.number)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span>{contact.name}</span>
                  <span className="ml-auto text-muted-foreground text-xs">
                    {contact.number}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Number Entry */}
          <div className="space-y-2">
            <Label htmlFor="transfer-number">Transfer To</Label>
            <Input
              id="transfer-number"
              type="tel"
              placeholder="(555) 123-4567"
              value={transferNumber}
              onChange={handlePhoneChange}
              maxLength={14}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isTransferring}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isTransferring || !transferNumber.trim()}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              {isTransferring ? 'Transferring...' : 'Transfer Call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};