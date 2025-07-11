
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface EstimateBuilderActionsProps {
  hasLineItems: boolean;
  onCancel: () => void;
  onSendEstimate: () => void;
}

export const EstimateBuilderActions = ({
  hasLineItems,
  onCancel,
  onSendEstimate
}: EstimateBuilderActionsProps) => {
  return (
    <div className="p-4 border-t bg-muted/20 flex justify-end space-x-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        onClick={onSendEstimate}
        className="flex items-center gap-1"
        disabled={!hasLineItems}
      >
        <Send size={16} />
        Send to Client
      </Button>
    </div>
  );
};
