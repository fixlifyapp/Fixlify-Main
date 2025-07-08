import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Icons } from '@/components/ui/icons';
import { useJobStore } from '@/stores/job.store';
import { formatCurrency } from '@/lib/utils';
import { UniversalSendDialog } from '../../shared/UniversalSendDialog';

interface UnifiedDocumentViewerDialogsProps {
  documentType: 'estimate' | 'invoice';
  documentId: string;
  documentNumber: string;
  total: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess?: () => void;
}

export function UnifiedDocumentViewerDialogs({
  documentType,
  documentId,
  documentNumber,
  total,
  contactInfo,
  onSuccess
}: UnifiedDocumentViewerDialogsProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { deleteEstimate, duplicateEstimate, deleteInvoice, duplicateInvoice } = useJobStore();
  const [showSendDialog, setShowSendDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (documentType === 'estimate') {
        await deleteEstimate(documentId);
      } else {
        await deleteInvoice(documentId);
      }
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} deleted successfully`);
      setOpenDeleteDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || `Failed to delete ${documentType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      if (documentType === 'estimate') {
        await duplicateEstimate(documentId);
      } else {
        await duplicateInvoice(documentId);
      }
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} duplicated successfully`);
      setOpenDuplicateDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || `Failed to duplicate ${documentType}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <>
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your{' '}
              {documentType === 'estimate' ? 'estimate' : 'invoice'} and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openDuplicateDialog} onOpenChange={setOpenDuplicateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Duplicate
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duplicate {documentType === 'estimate' ? 'Estimate' : 'Invoice'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to duplicate this {documentType}? This will create a new{' '}
              {documentType === 'estimate' ? 'estimate' : 'invoice'} with the same data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Total
              </Label>
              <Input
                type="text"
                id="total"
                value={formatCurrency(total)}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleDuplicate} disabled={isDuplicating}>
              {isDuplicating && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button size="sm" onClick={() => setShowSendDialog(true)}>
        Send
      </Button>
      
      <UniversalSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        documentType={documentType}
        documentId={documentId}
        documentNumber={documentNumber}
        total={total}
        contactInfo={contactInfo}
        onSuccess={() => {
          setShowSendDialog(false);
          onSuccess?.();
        }}
      />
    </>
  );
}
