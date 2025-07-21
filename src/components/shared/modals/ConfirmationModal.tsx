// Stub for ConfirmationModal to fix TypeScript errors
import { Button } from "@/components/ui/button";
import { SharedDialog, SharedDialogProps } from "@/components/ui/shared-dialog";
import { BaseModalProps } from "@/components/ui/modal-provider";

interface ConfirmationModalProps extends BaseModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ConfirmationModal = ({ 
  open = false, 
  onOpenChange, 
  title = "Confirm Action", 
  description = "Are you sure?",
  onConfirm,
  onCancel 
}: ConfirmationModalProps) => {
  return (
    <SharedDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footerContent={
        <>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </>
      }
      hideCloseButton={true}
    />
  );
};