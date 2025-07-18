
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EstimateSyncOptionsProps {
  onSyncToInvoice: () => void;
}

export const EstimateSyncOptions = ({
  onSyncToInvoice,
}: EstimateSyncOptionsProps) => {
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  const handleDisplaySyncOptions = () => {
    setShowSyncOptions(!showSyncOptions);
  };

  const handleSyncFromInvoice = () => {
    toast.success("Line items imported from invoice");
    // In a real app, this would fetch line items from an existing invoice
    setShowSyncOptions(false);
  };

  const handleSyncFromPrevious = () => {
    toast.success("Line items imported from previous estimate");
    // In a real app, this would fetch line items from a previous estimate
    setShowSyncOptions(false);
  };

  const handleSyncToInvoiceClick = () => {
    onSyncToInvoice();
    setShowSyncOptions(false);
  };

  return (
    <div className="relative inline-block">
      <Button 
        onClick={handleDisplaySyncOptions} 
        variant="outline"
        className="gap-2"
      >
        <RefreshCw size={16} />
        Sync Options
      </Button>
      
      {showSyncOptions && (
        <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg z-10">
          <div className="py-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-2 text-sm" 
              onClick={handleSyncToInvoiceClick}
            >
              Sync to Invoice
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-2 text-sm" 
              onClick={handleSyncFromInvoice}
            >
              Import from Invoice
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-2 text-sm" 
              onClick={handleSyncFromPrevious}
            >
              Import from Prior Estimate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
