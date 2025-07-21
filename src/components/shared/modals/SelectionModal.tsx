// Stub for SelectionModal to fix TypeScript errors
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { SharedDialog } from "@/components/ui/shared-dialog";
import { BaseModalProps } from "@/components/ui/modal-provider";

interface SelectionModalProps extends BaseModalProps {
  footerContent?: ReactNode;
  onSelect?: (value: any) => void;
  onCancel?: () => void;
}

export const SelectionModal = ({ 
  open = false, 
  onOpenChange, 
  title = "Select Option", 
  children,
  footerContent,
  onSelect,
  onCancel
}: SelectionModalProps) => {
  return (
    <SharedDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={title}
      footerContent={footerContent || (
        <>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSelect?.(null)}>Select</Button>
        </>
      )}
    >
      {children}
    </SharedDialog>
  );
};