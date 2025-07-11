import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface JobDetailsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDescription: string;
  onSave: (description: string) => void;
  jobId: string; // Add jobId prop
}

export function JobDetailsEditDialog({
  open,
  onOpenChange,
  initialDescription,
  onSave,
  jobId,
}: JobDetailsEditDialogProps) {
  const [description, setDescription] = useState(initialDescription);
  const { logNoteAdded } = useJobHistoryIntegration(jobId);

  const handleSave = async () => {
    // Log the description change as a note if it's different
    if (description !== initialDescription) {
      await logNoteAdded(`Job description updated: ${description}`);
    }
    
    onSave(description);
    onOpenChange(false);
    toast.success("Job description updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Job Description</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[150px]"
            placeholder="Enter detailed job description..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
