
import React, { ReactNode } from "react";
import { SharedDialog } from "@/components/ui/shared-dialog";
import { BaseModalProps } from "@/components/ui/modal-provider";

interface FormModalProps extends BaseModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  footerContent?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footerContent,
  size = "md"
}: FormModalProps) {
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
}
