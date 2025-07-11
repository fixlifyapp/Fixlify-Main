import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BaseModalProps } from "./modal-provider";

interface SharedDialogProps extends BaseModalProps {
  title: string;
  description?: string;
  children?: ReactNode; // Make children optional
  footerContent?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideCloseButton?: boolean;
}

export function SharedDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footerContent,
  size = "md",
  hideCloseButton = false,
}: SharedDialogProps) {
  // Map size to max-width class
  const sizeClasses = {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[550px]",
    lg: "sm:max-w-[700px]",
    xl: "sm:max-w-[900px]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        {footerContent && <DialogFooter>{footerContent}</DialogFooter>}
        {!footerContent && !hideCloseButton && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Default action buttons for forms
export function FormDialogFooter({
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Save",
  isSubmitting = false,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
  isSubmitting?: boolean;
}) {
  return (
    <>
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {cancelText}
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitText}
      </Button>
    </>
  );
}
