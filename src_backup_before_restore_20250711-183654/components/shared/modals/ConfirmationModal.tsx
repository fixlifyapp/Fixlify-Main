
import React from "react";
import { SharedDialog } from "@/components/ui/shared-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { BaseModalProps } from "@/components/ui/modal-provider";

interface ConfirmationModalProps extends BaseModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  isProcessing?: boolean;
  variant?: "delete" | "warning" | "success";
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isProcessing = false,
  variant = "delete",
  confirmText,
  cancelText = "Cancel"
}: ConfirmationModalProps) {
  // Determine button variant and icon based on the modal variant
  const buttonVariants = {
    delete: "destructive",
    warning: "warning",
    success: "default"
  };
  
  const buttonIcons = {
    delete: <Trash2 size={16} />,
    warning: <AlertCircle size={16} />,
    success: <CheckCircle2 size={16} />
  };
  
  const defaultTexts = {
    delete: "Delete",
    warning: "Confirm",
    success: "Confirm"
  };
  
  const buttonVariant = buttonVariants[variant];
  const buttonIcon = buttonIcons[variant];
  const defaultConfirmText = defaultTexts[variant];

  return (
    <SharedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      hideCloseButton={true}
      footerContent={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="mt-2 sm:mt-0"
          >
            {cancelText}
          </Button>
          <Button 
            variant={buttonVariant as any}
            onClick={onConfirm}
            disabled={isProcessing}
            className="gap-2"
          >
            {buttonIcon}
            {isProcessing ? "Processing..." : (confirmText || defaultConfirmText)}
          </Button>
        </div>
      }
    >
      {/* Empty children to satisfy type requirements */}
    </SharedDialog>
  );
}
