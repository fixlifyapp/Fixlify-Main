import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AutomationStub = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Automation components are temporarily disabled due to build issues. Core functionality remains available.
        </AlertDescription>
      </Alert>
      {children}
    </div>
  );
};