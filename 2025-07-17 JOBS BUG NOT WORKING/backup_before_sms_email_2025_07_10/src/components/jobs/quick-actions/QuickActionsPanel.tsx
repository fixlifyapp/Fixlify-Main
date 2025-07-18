
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Zap } from "lucide-react";
import { QuickAction } from "./types";
import { toast } from "sonner";

interface QuickActionsPanelProps {
  jobId: string;
  quickActions: QuickAction[];
  onCompleteJob: () => Promise<void>;
}

export const QuickActionsPanel = ({ jobId, quickActions, onCompleteJob }: QuickActionsPanelProps) => {
  const [isCompleteJobDialogOpen, setIsCompleteJobDialogOpen] = useState(false);
  
  const handleQuickAction = (actionId: number) => {
    switch (actionId) {
      case 1:
        // Complete Job
        setIsCompleteJobDialogOpen(true);
        break;
      case 2:
        // Send Reminder
        toast.success("Reminder sent to client");
        break;
      default:
        break;
    }
  };
  
  const handleCompleteJob = async () => {
    try {
      await onCompleteJob();
      toast.success("Job marked as completed");
    } catch (error) {
      console.error("Error in handleCompleteJob:", error);
      toast.error("Failed to complete job");
    } finally {
      setIsCompleteJobDialogOpen(false);
    }
  };
  
  return (
    <>
      <Card className="border-fixlyfy-border mb-6">
        <CardHeader className="p-4 border-b border-fixlyfy-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-fixlyfy/10 flex items-center justify-center">
              <Zap size={18} className="text-fixlyfy" />
            </div>
            <h3 className="text-lg font-medium">Quick Actions</h3>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 gap-3">
          {quickActions.map(action => (
            <Button
              key={action.id}
              variant={action.variant as any}
              className={action.className}
              onClick={() => handleQuickAction(action.id)}
            >
              <action.icon size={18} className="mr-2" />
              {action.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={isCompleteJobDialogOpen} onOpenChange={setIsCompleteJobDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the job as completed and notify the client. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteJob}>Yes, Complete Job</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
