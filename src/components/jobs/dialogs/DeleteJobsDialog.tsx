import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useJobs } from "@/hooks/useJobs";

interface DeleteJobsDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
}

export function DeleteJobsDialog({ selectedJobs, onOpenChange, onSuccess, open }: DeleteJobsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteJob, canDelete } = useJobs();

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("You don't have permission to delete jobs");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let successfulDeletions = 0;
      let failedDeletions = 0;
      
      // Delete jobs one by one to handle individual failures
      for (const jobId of selectedJobs) {
        try {
          const success = await deleteJob(jobId);
          if (success) {
            successfulDeletions++;
          } else {
            failedDeletions++;
          }
        } catch (error) {
          console.error(`Failed to delete job ${jobId}:`, error);
          failedDeletions++;
        }
      }

      // Show results
      if (successfulDeletions > 0) {
        toast.success(`Successfully deleted ${successfulDeletions} job${successfulDeletions > 1 ? 's' : ''}`);
      }

      if (failedDeletions > 0) {
        toast.error(`Failed to delete ${failedDeletions} job${failedDeletions > 1 ? 's' : ''}`);
      }

      // Call onSuccess if at least one job was deleted successfully
      if (successfulDeletions > 0) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete jobs:", error);
      toast.error("Failed to delete jobs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Jobs</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting || !canDelete}
          >
            {isSubmitting ? "Deleting..." : "Delete Jobs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
