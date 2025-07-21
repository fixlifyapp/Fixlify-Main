// Minimal stub to avoid build errors
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationDialog({ open, onOpenChange }: NewConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New SMS Conversation</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-muted-foreground">Conversation features coming soon.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}