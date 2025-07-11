
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EstimateBuilderHeaderProps {
  estimateId?: string;
  estimateNumber: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const EstimateBuilderHeader = ({
  estimateId,
  estimateNumber,
  activeTab,
  setActiveTab
}: EstimateBuilderHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <DialogHeader className="p-6 border-b bg-muted/20">
      <div className="flex items-center gap-2">
        {isMobile && activeTab !== "form" && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveTab("form")} 
            className="mr-1"
          >
            <ArrowLeft size={18} />
          </Button>
        )}
        <DialogTitle className="text-xl">
          {estimateId ? `Edit Estimate ${estimateNumber}` : 'Create New Estimate'}
        </DialogTitle>
      </div>
    </DialogHeader>
  );
};
