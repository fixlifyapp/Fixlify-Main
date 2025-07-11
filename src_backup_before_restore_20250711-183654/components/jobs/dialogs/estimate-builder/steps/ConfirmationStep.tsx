
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationStepProps {
  sendMethod: "email" | "sms";
  customNote: string;
  onClose: () => void;
}

export const ConfirmationStep = ({ sendMethod, customNote, onClose }: ConfirmationStepProps) => {
  return (
    <div className="text-center p-6">
      <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Estimate Sent Successfully</h3>
      <p className="text-muted-foreground mb-6">
        The estimate has been sent to the client via {sendMethod === "email" ? "email" : "text message"}.
        {sendMethod === "email" && (
          <span className="block mt-2">The client can access their portal to view, approve, or reject the estimate.</span>
        )}
        {sendMethod === "sms" && (
          <span className="block mt-2">The client can access their portal to view, approve, or reject the estimate via the secure link.</span>
        )}
        {customNote && <span className="block mt-2">Your warranty recommendation was included.</span>}
      </p>
      <Button onClick={onClose}>
        Close
      </Button>
    </div>
  );
};
