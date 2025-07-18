
import { LineItemsTable } from "./LineItemsTable";
import { Button } from "@/components/ui/button";
import { LineItem } from "@/components/jobs/builder/types";
import { PlusCircle } from "lucide-react";

interface EstimateFormProps {
  estimateNumber: string;
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
  showMargin?: boolean;
}

export const EstimateForm = ({
  estimateNumber,
  lineItems,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage,
  showMargin = false,
}: EstimateFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Estimate #{estimateNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Add items to your estimate below
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <LineItemsTable
          lineItems={lineItems}
          onRemoveLineItem={onRemoveLineItem}
          onUpdateLineItem={onUpdateLineItem}
          onEditLineItem={onEditLineItem}
          showMargin={showMargin}
          showOurPrice={showMargin}
        />

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onAddEmptyLineItem}
          >
            <PlusCircle size={16} />
            <span>Add Product</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onAddCustomLine}
          >
            <PlusCircle size={16} />
            <span>Custom Line</span>
          </Button>
        </div>

        <div className="bg-muted/30 rounded-md p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <span>Tax ({taxRate}%):</span>
            </span>
            <span>${calculateTotalTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total:</span>
            <span>${calculateGrandTotal().toFixed(2)}</span>
          </div>
          
          {showMargin && calculateTotalMargin && calculateMarginPercentage && (
            <div className="flex justify-between text-sm text-green-600 pt-2 border-t border-green-100">
              <span>Total Margin:</span>
              <span>${calculateTotalMargin().toFixed(2)} ({calculateMarginPercentage().toFixed(0)}%)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
