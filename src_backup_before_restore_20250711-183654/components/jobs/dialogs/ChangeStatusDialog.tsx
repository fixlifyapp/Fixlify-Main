import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check, Clock, Loader2, XCircle, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobStatuses } from "@/hooks/useConfigItems";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface ChangeStatusDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (status: string) => void;
}

export function ChangeStatusDialog({ selectedJobs, onOpenChange, onSuccess }: ChangeStatusDialogProps) {
  const [status, setStatus] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items: jobStatuses } = useJobStatuses();

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "completed":
        return <Check className="h-4 w-4 text-fixlyfy-success" />;
      case "scheduled":
        return <Calendar className="h-4 w-4 text-fixlyfy-info" />;
      case "in-progress":
        return <Loader2 className="h-4 w-4 text-fixlyfy-warning" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-fixlyfy-error" />;
      case "ask-review":
        return <AlertTriangle className="h-4 w-4 text-fixlyfy-secondary" />;
      default:
        return <Clock className="h-4 w-4 text-fixlyfy-primary" />;
    }
  };

  const getStatusClass = (value: string) => {
    const dbStatus = jobStatuses.find(s => s.name === value);
    if (dbStatus && dbStatus.color) {
      return `border-${dbStatus.color}/20 text-${dbStatus.color}`;
    }
    
    switch (value) {
      case "scheduled":
        return "border-fixlyfy-primary/20 text-fixlyfy-primary";
      case "in-progress":
        return "border-fixlyfy-warning/20 text-fixlyfy-warning";
      case "completed":
        return "border-fixlyfy-success/20 text-fixlyfy-success";
      case "cancelled":
        return "border-fixlyfy-error/20 text-fixlyfy-error";
      case "ask-review":
        return "border-fixlyfy-secondary/20 text-fixlyfy-secondary";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current statuses for logging
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, status')
        .in('id', selectedJobs);

      // Update status for all selected jobs in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .in('id', selectedJobs);
        
      if (error) {
        throw error;
      }
      
      // Log status changes for each job
      if (jobsData) {
        for (const job of jobsData) {
          const { logStatusChange } = useJobHistoryIntegration(job.id);
          await logStatusChange(job.status, status);
        }
      }
      
      // Call onSuccess with the new status
      onSuccess(status);
      onOpenChange(false);
      toast.success(`Updated ${selectedJobs.length} jobs to "${status}"`);
    } catch (error) {
      console.error("Failed to update job status:", error);
      toast.error("Failed to update job status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change Status for {selectedJobs.length} Selected Jobs</DialogTitle>
        <DialogDescription>
          Update the status for all selected jobs. This will override their current status.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="py-6">
          <RadioGroup value={status} onValueChange={setStatus} className="grid grid-cols-2 gap-3">
            {jobStatuses
              .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
              .map((statusOption) => (
                <div key={statusOption.id}>
                  <RadioGroupItem
                    value={statusOption.name}
                    id={`status-${statusOption.name}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`status-${statusOption.name}`}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-md border bg-card p-3 hover:bg-accent hover:text-accent-foreground",
                      "cursor-pointer peer-data-[state=checked]:border-2",
                      getStatusClass(statusOption.name)
                    )}
                  >
                    {getStatusIcon(statusOption.name)}
                    {statusOption.name.charAt(0).toUpperCase() + statusOption.name.slice(1)}
                  </Label>
                </div>
              ))}
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !status}
            className={cn(
              status && getStatusClass(status),
              "border"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
