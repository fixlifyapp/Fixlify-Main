
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface InvoiceFormHeaderProps {
  type: "invoice" | "estimate";
  previewMode: boolean;
  setPreviewMode: (value: boolean) => void;
  showWarrantyUpsell?: boolean;
  onAddWarranty: () => void;
}

export const InvoiceFormHeader = ({
  type,
  previewMode,
  setPreviewMode,
  showWarrantyUpsell,
  onAddWarranty,
}: InvoiceFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{type === "invoice" ? "Create Invoice" : "Create Estimate"}</h2>
      <div className="flex gap-2">
        {showWarrantyUpsell && (
          <Button 
            variant="outline" 
            onClick={onAddWarranty}
            className="gap-2"
          >
            <Plus size={16} />
            Add Warranty
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? "Edit Details" : "Preview"}
        </Button>
      </div>
    </div>
  );
};
