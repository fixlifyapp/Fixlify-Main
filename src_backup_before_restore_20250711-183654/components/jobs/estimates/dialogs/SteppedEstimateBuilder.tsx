
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SteppedEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onEstimateCreated: () => void;
}

export const SteppedEstimateBuilder = ({ 
  open, 
  onOpenChange, 
  jobId, 
  onEstimateCreated 
}: SteppedEstimateBuilderProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Estimate</h2>
          <p className="text-muted-foreground mb-4">
            Estimate builder will be implemented here.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onEstimateCreated();
              onOpenChange(false);
            }}>
              Create Estimate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
