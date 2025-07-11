
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, RefreshCw, Search } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";
import { EstimateSummary } from "./EstimateSummary";

interface EstimateEditorProps {
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  onNotesChange: (notes: string) => void;
  onTaxRateChange: (rate: string) => void;
  onAddProduct: (product: any) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  onSyncToInvoice: () => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
}

export const EstimateEditor = ({
  estimateNumber,
  lineItems,
  notes,
  taxRate,
  onNotesChange,
  onTaxRateChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  onSyncToInvoice,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage
}: EstimateEditorProps) => {
  return (
    <div className="space-y-6">
      {/* Estimate Header Section */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="space-y-2">
          <Label htmlFor="estimate-number">Estimate #</Label>
          <Input
            id="estimate-number"
            value={estimateNumber}
            readOnly
            className="w-40 bg-muted/50"
          />
        </div>
        
        <div className="ml-auto space-x-2">
          {/* Sync Options Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onSyncToInvoice}
          >
            <RefreshCw size={16} />
            Sync to Invoice
          </Button>
        </div>
      </div>
      
      {/* Line Items Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onAddEmptyLineItem}
        >
          <Search size={16} />
          Add from Catalog
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onAddCustomLine}
        >
          <Plus size={16} />
          Add Custom Line
        </Button>
      </div>
      
      {/* Summary */}
      <EstimateSummary
        taxRate={taxRate}
        onTaxRateChange={onTaxRateChange}
        calculateSubtotal={calculateSubtotal}
        calculateTotalTax={calculateTotalTax}
        calculateGrandTotal={calculateGrandTotal}
        calculateTotalMargin={calculateTotalMargin}
        calculateMarginPercentage={calculateMarginPercentage}
      />
      
      {/* Notes Section */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes & Terms</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full min-h-[100px] p-2 border rounded-md resize-y"
          placeholder="Add notes or terms and conditions..."
        />
      </div>
    </div>
  );
};
