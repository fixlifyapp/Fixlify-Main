// Shared dialog component to fix TypeScript errors
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BaseModalProps } from "./modal-provider";

export interface SharedDialogProps extends BaseModalProps {
  footerContent?: ReactNode;
  hideCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const SharedDialog = ({ 
  open = false, 
  onOpenChange, 
  title, 
  description,
  children,
  footerContent,
  hideCloseButton = false,
  size = "md"
}: SharedDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={size === "lg" ? "max-w-4xl" : "max-w-2xl"}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="space-y-4">
          {children}
        </div>
        {footerContent && (
          <div className="flex gap-2 justify-end">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};