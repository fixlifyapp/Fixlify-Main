// Stub for FormModal to fix TypeScript errors
import { ReactNode } from "react";
import { SharedDialog } from "@/components/ui/shared-dialog";
import { BaseModalProps } from "@/components/ui/modal-provider";

interface FormModalProps extends BaseModalProps {
  footerContent?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const FormModal = ({ 
  open = false, 
  onOpenChange, 
  title = "Form", 
  description,
  children,
  footerContent,
  size = "md"
}: FormModalProps) => {
  return (
    <SharedDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footerContent={footerContent}
      size={size}
    >
      {children}
    </SharedDialog>
  );
};