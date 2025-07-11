
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface JobActionsProps {
  onCompleteJob?: () => void;
  onCancelJob?: () => void;
  onReschedule?: () => void;
  onCreateEstimate?: () => void;
  onCreateInvoice?: () => void;
}

export const JobActions = ({ 
  onCompleteJob,
  onCancelJob,
  onReschedule,
  onCreateEstimate,
  onCreateInvoice
}: JobActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Actions <ChevronDown size={16} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onCompleteJob && (
          <DropdownMenuItem onClick={onCompleteJob}>Complete Job</DropdownMenuItem>
        )}
        
        {onReschedule && (
          <DropdownMenuItem onClick={onReschedule}>Reschedule</DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        {onCancelJob && (
          <DropdownMenuItem onClick={onCancelJob} className="text-fixlyfy-error">
            Cancel Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
