// Placeholder component - Communication functionality removed
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SendCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: 'email' | 'sms';
  clientId?: string;
  jobId?: string;
  estimateId?: string;
  invoiceId?: string;
}

export function SendCommunicationDialog({
  open,
  onOpenChange,
}: SendCommunicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Communication Feature</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center text-muted-foreground">
          SMS/Email functionality has been removed for reimplementation.
        </div>
      </DialogContent>
    </Dialog>
  );
}
