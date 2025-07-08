import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  confirmText?: string;
  open?: boolean; // Make open optional for backward compatibility
}

export function DeleteConfirmDialog({ 
  title, 
  description, 
  onOpenChange, 
  onConfirm, 
  isDeleting = false,
  confirmText = "Delete",
  open
}: DeleteConfirmDialogProps) {
  return (
    // If open and onOpenChange are provided, wrap in Dialog
    open !== undefined ? (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ) : (
      // Otherwise, just render the content (to be used inside an existing Dialog)
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    )
  );
}
